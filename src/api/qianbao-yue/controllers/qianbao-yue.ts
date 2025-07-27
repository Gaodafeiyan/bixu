import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreController(
  'api::qianbao-yue.qianbao-yue',
  ({ strapi }) => ({
    // 重写find方法
    async find(ctx) {
      try {
        // 直接使用strapi.entityService
        const result = await strapi.entityService.findPage('api::qianbao-yue.qianbao-yue', {
          ...ctx.query,
          populate: ['user']
        });
        return result;
      } catch (error) {
        console.error('获取钱包列表失败:', error);
        ctx.throw(500, `获取钱包列表失败: ${error.message}`);
      }
    },

    // 添加默认的findOne方法
    async findOne(ctx) {
      try {
        const { id } = ctx.params;
        const result = await strapi.entityService.findOne('api::qianbao-yue.qianbao-yue', id, {
          populate: ['user']
        });
        return result;
      } catch (error) {
        console.error('获取钱包详情失败:', error);
        ctx.throw(500, `获取钱包详情失败: ${error.message}`);
      }
    },

    // 添加默认的update方法
    async update(ctx) {
      try {
        const { id } = ctx.params;
        const { data } = ctx.request.body;
        const result = await strapi.entityService.update('api::qianbao-yue.qianbao-yue', id, {
          data
        });
        return result;
      } catch (error) {
        console.error('更新钱包失败:', error);
        ctx.throw(500, `更新钱包失败: ${error.message}`);
      }
    },

    // 添加默认的delete方法
    async delete(ctx) {
      try {
        const { id } = ctx.params;
        const result = await strapi.entityService.delete('api::qianbao-yue.qianbao-yue', id);
        return result;
      } catch (error) {
        console.error('删除钱包失败:', error);
        ctx.throw(500, `删除钱包失败: ${error.message}`);
      }
    },

    // 测试连接方法
    async testConnection(ctx) {
      ctx.body = {
        success: true,
        message: '钱包API连接正常',
        timestamp: new Date().toISOString()
      };
    },

    // 获取用户钱包
    async getUserWallet(ctx) {
      try {
        // 调试信息：检查JWT解析情况
        console.log('>>> ctx.state.user', ctx.state.user);
        console.log('>>> ctx.request.headers.authorization', ctx.request.headers.authorization);
        
        // 检查用户是否已认证
        if (!ctx.state.user || !ctx.state.user.id) {
          console.log('>>> 用户未认证，返回401');
          return ctx.unauthorized('用户未认证');
        }
        
        const userId = ctx.state.user.id;
        
        // 确保strapi.entityService存在
        if (!strapi) {
          console.error('strapi is undefined');
          return ctx.throw(500, '系统服务不可用');
        }
        
        if (!strapi.entityService) {
          console.error('strapi.entityService is undefined');
          return ctx.throw(500, '实体服务不可用');
        }
        
        // 查找用户钱包
              const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: userId },
        populate: ['user']
      }) as any[];
        
        let wallet = wallets && wallets.length > 0 ? wallets[0] : null;
        
        if (!wallet) {
          // 如果钱包不存在，创建钱包
          try {
            wallet = await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
              data: {
                usdtYue: '0',
                aiYue: '0',
                aiTokenBalances: '{}',
                user: userId
              }
            });
            
            console.log(`为用户 ${userId} 创建新钱包`);
          } catch (createError) {
            console.error('创建钱包失败:', createError);
            return ctx.throw(500, `创建钱包失败: ${createError.message}`);
          }
        }
        
        ctx.body = {
          success: true,
          data: wallet
        };
      } catch (error) {
        console.error('获取用户钱包失败:', error);
        ctx.throw(500, `获取用户钱包失败: ${error.message}`);
      }
    },

    // 更新钱包余额
    async updateWallet(ctx) {
      try {
        const userId = ctx.state.user.id;
        const { usdtYue, aiYue, aiTokenBalances } = ctx.request.body;
        
        if (!userId) {
          return ctx.unauthorized('用户未认证');
        }
        
        // 确保strapi.entityService存在
        if (!strapi || !strapi.entityService) {
          console.error('strapi.entityService is undefined');
          return ctx.throw(500, '系统服务不可用');
        }
        
        // 输入验证
        if (usdtYue !== undefined && (isNaN(Number(usdtYue)) || Number(usdtYue) < 0)) {
          return ctx.badRequest('USDT余额必须是大于等于0的数字');
        }
        
        if (aiYue !== undefined && (isNaN(Number(aiYue)) || Number(aiYue) < 0)) {
          return ctx.badRequest('AI代币余额必须是大于等于0的数字');
        }
        
        const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
          filters: { user: userId }
        }) as any[];
        
        let wallet = wallets && wallets.length > 0 ? wallets[0] : null;
        if (!wallet) {
          // 如果钱包不存在，创建钱包
          try {
            wallet = await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
              data: {
                usdtYue: '0',
                aiYue: '0',
                aiTokenBalances: '{}',
                user: userId
              }
            });
          } catch (createError) {
            console.error('创建钱包失败:', createError);
            return ctx.throw(500, `创建钱包失败: ${createError.message}`);
          }
        }

        // 更新钱包余额
        const updateData: any = {};
        if (usdtYue !== undefined) updateData.usdtYue = usdtYue;
        if (aiYue !== undefined) updateData.aiYue = aiYue;
        if (aiTokenBalances !== undefined) updateData.aiTokenBalances = aiTokenBalances;

        const updatedWallet = await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
          data: updateData
        });

        console.log(`用户 ${userId} 更新钱包余额: USDT=${usdtYue}, AI=${aiYue}`);

        ctx.body = {
          success: true,
          data: updatedWallet
        };
      } catch (error) {
        console.error('更新钱包失败:', error);
        ctx.throw(500, `更新钱包失败: ${error.message}`);
      }
    },

    // 充值钱包
    async rechargeWallet(ctx) {
      try {
        const { data } = ctx.request.body;
        
        if (!data) {
          return ctx.badRequest('缺少data字段');
        }

        if (!data.user) {
          return ctx.badRequest('缺少用户ID');
        }

        // 输入验证
        if (data.usdtYue !== undefined && (isNaN(Number(data.usdtYue)) || Number(data.usdtYue) < 0)) {
          return ctx.badRequest('USDT充值金额必须是大于等于0的数字');
        }
        
        if (data.aiYue !== undefined && (isNaN(Number(data.aiYue)) || Number(data.aiYue) < 0)) {
          return ctx.badRequest('AI代币充值金额必须是大于等于0的数字');
        }

        // 验证用户是否存在
        const user = await strapi.entityService.findOne('plugin::users-permissions.user', data.user);
        if (!user) {
          return ctx.badRequest('用户不存在');
        }

        // 查找或创建钱包
        const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
          filters: { user: data.user }
        }) as any[];
        
        let wallet = wallets && wallets.length > 0 ? wallets[0] : null;
        if (!wallet) {
          wallet = await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
            data: {
              usdtYue: '0',
              aiYue: '0',
              aiTokenBalances: '{}',
              user: data.user
            }
          });
        }

        // 更新钱包余额
        const updateData: any = {};
        if (data.usdtYue !== undefined) {
          const currentUsdt = new Decimal(wallet.usdtYue || 0);
          updateData.usdtYue = currentUsdt.plus(new Decimal(data.usdtYue)).toString();
        }
        if (data.aiYue !== undefined) {
          const currentAi = new Decimal(wallet.aiYue || 0);
          updateData.aiYue = currentAi.plus(new Decimal(data.aiYue)).toString();
        }
        if (data.aiTokenBalances !== undefined) {
          updateData.aiTokenBalances = data.aiTokenBalances;
        }

        const updatedWallet = await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
          data: updateData
        });

        console.log(`用户 ${data.user} 充值钱包: USDT=${data.usdtYue}, AI=${data.aiYue}`);

        ctx.body = {
          success: true,
          data: updatedWallet
        };
      } catch (error) {
        console.error('充值钱包失败:', error);
        ctx.throw(500, `充值钱包失败: ${error.message}`);
      }
    },

    // 重写create方法，添加数据验证
    async create(ctx) {
      try {
        const { data } = ctx.request.body;
        
        // 验证data字段
        if (!data) {
          return ctx.badRequest('缺少data字段');
        }
        
        // 验证用户ID
        if (!data.user) {
          return ctx.badRequest('缺少用户ID');
        }
        
        // 验证用户是否存在
        const user = await strapi.entityService.findOne('plugin::users-permissions.user', data.user);
        if (!user) {
          return ctx.badRequest('用户不存在');
        }
        
        // 检查用户是否已有钱包
        const existingWallet = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
          filters: { user: data.user }
        }) as any[];
        
        if (existingWallet.length > 0) {
          return ctx.badRequest('用户已存在钱包');
        }
        
        // 验证余额字段
        if (data.usdtYue !== undefined && (isNaN(Number(data.usdtYue)) || Number(data.usdtYue) < 0)) {
          return ctx.badRequest('USDT余额必须是大于等于0的数字');
        }
        
        if (data.aiYue !== undefined && (isNaN(Number(data.aiYue)) || Number(data.aiYue) < 0)) {
          return ctx.badRequest('AI代币余额必须是大于等于0的数字');
        }
        
        const wallet = await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
          data: {
            usdtYue: data.usdtYue || '0',
            aiYue: data.aiYue || '0',
            aiTokenBalances: data.aiTokenBalances || '{}',
            user: data.user
          }
        });
        
        console.log(`为用户 ${data.user} 创建钱包`);
        
        ctx.body = { 
          success: true,
          data: wallet 
        };
      } catch (error) {
        console.error('创建钱包失败:', error);
        ctx.throw(500, `创建钱包失败: ${error.message}`);
      }
    },
  })
); 