import * as admin from 'firebase-admin';

// 初始化 Firebase Admin SDK
let firebaseApp: admin.app.App;

try {
  firebaseApp = admin.app();
} catch (error) {
  // 如果还没有初始化，则初始化
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID || 'your-project-id',
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  };

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export class PushNotificationService {
  /**
   * 发送推送通知给指定用户
   */
  async sendToUser(userId: number, title: string, body: string, data?: any) {
    try {
      // 获取用户的FCM token
      const tokens = await this.getUserFCMTokens(userId);
      
      if (tokens.length === 0) {
        console.log(`用户 ${userId} 没有注册的FCM token`);
        return { success: false, message: '用户没有注册的FCM token' };
      }

      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        tokens,
      };

             const response = await firebaseApp.messaging().sendEachForMulticast(message);
       
       console.log(`✅ 推送通知发送成功:`, {
         userId,
         successCount: response.successCount,
         failureCount: response.failureCount,
       });

       // 处理失败的token
       if (response.failureCount > 0) {
         const failedTokens = response.responses
           .map((resp, idx) => resp.success ? null : tokens[idx])
           .filter(Boolean);
         
         await this.removeInvalidTokens(failedTokens);
       }

       return {
         success: true,
         successCount: response.successCount,
         failureCount: response.failureCount,
       };
    } catch (error) {
      console.error('❌ 发送推送通知失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 发送推送通知给所有用户
   */
  async sendToAllUsers(title: string, body: string, data?: any) {
    try {
      const tokens = await this.getAllFCMTokens();
      
      if (tokens.length === 0) {
        return { success: false, message: '没有注册的FCM token' };
      }

      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        tokens,
      };

             const response = await firebaseApp.messaging().sendEachForMulticast(message);
       
       console.log(`✅ 群发推送通知成功:`, {
         successCount: response.successCount,
         failureCount: response.failureCount,
       });

       return {
         success: true,
         successCount: response.successCount,
         failureCount: response.failureCount,
       };
    } catch (error) {
      console.error('❌ 群发推送通知失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取用户的FCM token
   */
  private async getUserFCMTokens(userId: number): Promise<string[]> {
    try {
      const tokens = await strapi.entityService.findMany('api::user-fcm-token.user-fcm-token' as any, {
        filters: { userId },
        fields: ['fcmToken'],
      }) as any[];
      
      return tokens.map((token: any) => token.fcmToken);
    } catch (error) {
      console.error('获取用户FCM token失败:', error);
      return [];
    }
  }

  /**
   * 获取所有FCM token
   */
  private async getAllFCMTokens(): Promise<string[]> {
    try {
      const tokens = await strapi.entityService.findMany('api::user-fcm-token.user-fcm-token' as any, {
        fields: ['fcmToken'],
      }) as any[];
      
      return tokens.map((token: any) => token.fcmToken);
    } catch (error) {
      console.error('获取所有FCM token失败:', error);
      return [];
    }
  }

  /**
   * 移除无效的FCM token
   */
  private async removeInvalidTokens(invalidTokens: string[]) {
    try {
      for (const token of invalidTokens) {
        await strapi.entityService.deleteMany('api::user-fcm-token.user-fcm-token' as any, {
          filters: { fcmToken: token } as any,
        });
      }
      console.log(`🗑️ 移除了 ${invalidTokens.length} 个无效的FCM token`);
    } catch (error) {
      console.error('移除无效FCM token失败:', error);
    }
  }

  /**
   * 注册用户的FCM token
   */
  async registerUserToken(userId: number, fcmToken: string, deviceType: 'android' | 'ios' = 'android') {
    try {
      // 检查是否已存在
             const existingToken = await strapi.entityService.findMany('api::user-fcm-token.user-fcm-token' as any, {
         filters: { userId, fcmToken } as any,
       });

      if (existingToken && existingToken.length > 0) {
        console.log(`用户 ${userId} 的FCM token已存在`);
        return { success: true, message: 'Token已存在' };
      }

      // 创建新的token记录
      await strapi.entityService.create('api::user-fcm-token.user-fcm-token' as any, {
        data: {
          userId,
          fcmToken,
          deviceType,
        },
      });

      console.log(`✅ 用户 ${userId} 的FCM token注册成功`);
      return { success: true, message: 'Token注册成功' };
    } catch (error) {
      console.error('注册FCM token失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 注销用户的FCM token
   */
  async unregisterUserToken(userId: number, fcmToken: string) {
    try {
             await strapi.entityService.deleteMany('api::user-fcm-token.user-fcm-token' as any, {
         filters: { userId, fcmToken } as any,
       });

      console.log(`✅ 用户 ${userId} 的FCM token注销成功`);
      return { success: true, message: 'Token注销成功' };
    } catch (error) {
      console.error('注销FCM token失败:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new PushNotificationService(); 