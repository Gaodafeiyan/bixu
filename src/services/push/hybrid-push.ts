import axios from 'axios';
import { Strapi } from '@strapi/strapi';

// JPush配置
const JPUSH_APP_KEY = process.env.JPUSH_APP_KEY;
const JPUSH_MASTER_SECRET = process.env.JPUSH_MASTER_SECRET;
const JPUSH_AUTH = JPUSH_APP_KEY && JPUSH_MASTER_SECRET 
  ? Buffer.from(`${JPUSH_APP_KEY}:${JPUSH_MASTER_SECRET}`).toString('base64')
  : null;

// Firebase配置（备用）
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;

export class HybridPushService {
  private strapi: Strapi;

  constructor(strapi: Strapi) {
    this.strapi = strapi;
  }

  /**
   * 发送推送通知给指定用户（优先使用JPush）
   */
  async sendToUser(userId: number, title: string, body: string, data?: any) {
    try {
      // 获取用户的推送token
      const tokens = await this.getUserPushTokens(userId);
      
      console.log(`🔍 用户 ${userId} 的推送token:`, tokens);
      
      if (tokens.length === 0) {
        console.log(`用户 ${userId} 没有注册的推送token`);
        return { success: false, message: '用户没有注册的推送token' };
      }

      // 按服务类型分组token
      const firebaseTokens = tokens.filter(t => t.serviceType === 'firebase').map(t => t.pushToken);
      const jpushTokens = tokens.filter(t => t.serviceType === 'jpush').map(t => t.pushToken);

      const results = [];

      // 优先发送JPush推送
      if (jpushTokens.length > 0) {
        console.log('🇨🇳 优先使用极光推送发送通知');
        const jpushResult = await this.sendJPushPush(jpushTokens, title, body, data);
        results.push({ service: 'jpush', ...jpushResult });
      }

      // 如果JPush失败或没有JPush token，使用Firebase作为备用
      if (firebaseTokens.length > 0 && (jpushTokens.length === 0 || results.length === 0)) {
        console.log('🌍 使用Firebase作为备用推送服务');
        const firebaseResult = await this.sendFirebasePush(firebaseTokens, title, body, data);
        results.push({ service: 'firebase', ...firebaseResult });
      }

      console.log(`✅ 推送发送完成:`, {
        userId,
        results,
      });

      return {
        success: true,
        results,
      };
    } catch (error) {
      console.error('❌ 发送推送失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 发送Firebase推送（备用推送服务）
   */
  async sendFirebasePush(tokens: string[], title: string, body: string, data?: any) {
    try {
      if (!FIREBASE_PROJECT_ID || !FIREBASE_PRIVATE_KEY || !FIREBASE_CLIENT_EMAIL) {
        console.log('⚠️ Firebase配置不完整，跳过Firebase推送');
        return { success: false, message: 'Firebase配置不完整' };
      }

      // 这里需要初始化Firebase Admin SDK
      const admin = require('firebase-admin');
      
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: FIREBASE_PROJECT_ID,
            privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: FIREBASE_CLIENT_EMAIL,
          }),
        });
      }

      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      
      console.log(`✅ Firebase推送发送成功:`, {
        successCount: response.successCount,
        failureCount: response.failureCount,
      });

      // 处理失败的token
      if (response.failureCount > 0) {
        const failedTokens = response.responses
          .map((resp: any, idx: number) => resp.success ? null : tokens[idx])
          .filter(Boolean);
        
        await this.removeInvalidTokens(failedTokens, 'firebase');
      }

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      console.error('❌ Firebase推送发送失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 发送JPush推送（主要推送服务）
   */
  async sendJPushPush(tokens: string[], title: string, body: string, data?: any) {
    try {
      console.log('🔍 JPush推送调试信息:', {
        JPUSH_APP_KEY: JPUSH_APP_KEY ? '已配置' : '未配置',
        JPUSH_MASTER_SECRET: JPUSH_MASTER_SECRET ? '已配置' : '未配置',
        JPUSH_AUTH: JPUSH_AUTH ? '已生成' : '未生成',
        tokens: tokens,
        title: title,
        body: body,
      });
      
      if (!JPUSH_AUTH) {
        console.log('⚠️ JPush配置不完整，跳过JPush推送');
        return { success: false, message: 'JPush配置不完整' };
      }

      const payload = {
        platform: ['android'],
        audience: { registration_id: tokens },
        notification: {
          android: {
            alert: body,
            title,
            extras: data || {},
          },
        },
        options: {
          time_to_live: 3600,
          apns_production: process.env.JPUSH_PRODUCTION === 'true',
        },
      };

      console.log('📤 发送JPush推送请求:', JSON.stringify(payload, null, 2));

      const response = await axios.post('https://api.jpush.cn/v3/push', payload, {
        headers: { 
          Authorization: `Basic ${JPUSH_AUTH}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log(`✅ JPush推送发送成功:`, {
        msgId: response.data.msg_id,
        sendno: response.data.sendno,
      });

      return {
        success: true,
        msgId: response.data.msg_id,
        sendno: response.data.sendno,
      };
    } catch (error) {
      console.error('❌ JPush推送发送失败:', error);
      
      // 添加详细的错误信息
      let errorMessage = error.message;
      if (error.response) {
        console.error('JPush API响应错误:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
        errorMessage = `JPush API错误 (${error.response.status}): ${JSON.stringify(error.response.data)}`;
      }
      
      return { success: false, error: errorMessage };
    }
  }

  /**
   * 获取用户的推送token
   */
  async getUserPushTokens(userId: number) {
    try {
      const tokens = await this.strapi.entityService.findMany('api::user-push-token.user-push-token' as any, {
        filters: { 
          userId,
          isActive: true,
        } as any,
      });

      return tokens || [];
    } catch (error) {
      console.error('获取用户推送token失败:', error);
      return [];
    }
  }

  /**
   * 移除无效的token
   */
  async removeInvalidTokens(invalidTokens: string[], serviceType: string) {
    try {
      for (const token of invalidTokens) {
        // 先查找要更新的记录
        const existingTokens = await this.strapi.entityService.findMany('api::user-push-token.user-push-token' as any, {
          filters: { pushToken: token, serviceType } as any,
        });

        if (existingTokens && Array.isArray(existingTokens) && existingTokens.length > 0) {
          for (const existingToken of existingTokens) {
            await this.strapi.entityService.update('api::user-push-token.user-push-token' as any, existingToken.id, {
              data: { isActive: false } as any,
            });
          }
        }
      }
      console.log(`✅ 已移除 ${invalidTokens.length} 个无效token (${serviceType})`);
    } catch (error) {
      console.error('移除无效token失败:', error);
    }
  }

  /**
   * 注册用户的推送token
   */
  async registerUserToken(userId: number, pushToken: string, serviceType: string, deviceType: string = 'android') {
    try {
      // 检查是否已存在
      const existingToken = await this.strapi.entityService.findMany('api::user-push-token.user-push-token' as any, {
        filters: { userId, pushToken, serviceType } as any,
      });

      if (existingToken && existingToken.length > 0) {
        console.log(`用户 ${userId} 的${serviceType} token已存在`);
        return { success: true, message: 'Token已存在' };
      }

      // 创建新的token记录
      await this.strapi.entityService.create('api::user-push-token.user-push-token' as any, {
        data: {
          userId,
          pushToken,
          serviceType,
          deviceType,
          isActive: true,
        },
      });

      console.log(`✅ 用户 ${userId} 的${serviceType} token注册成功`);
      return { success: true, message: 'Token注册成功' };
    } catch (error) {
      console.error('注册推送token失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 注销用户的推送token
   */
  async unregisterUserToken(userId: number, pushToken: string, serviceType: string) {
    try {
      // 先查找要更新的记录
      const existingTokens = await this.strapi.entityService.findMany('api::user-push-token.user-push-token' as any, {
        filters: { userId, pushToken, serviceType } as any,
      });

      if (existingTokens && Array.isArray(existingTokens) && existingTokens.length > 0) {
        for (const existingToken of existingTokens) {
          await this.strapi.entityService.update('api::user-push-token.user-push-token' as any, existingToken.id, {
            data: { isActive: false } as any,
          });
        }
      }

      console.log(`✅ 用户 ${userId} 的${serviceType} token注销成功`);
      return { success: true, message: 'Token注销成功' };
    } catch (error) {
      console.error('注销推送token失败:', error);
      return { success: false, error: error.message };
    }
  }
}
