import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreController(
  'api::qianbao-yue.qianbao-yue',
  ({ strapi }) => ({
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
        const userId = ctx.state.user.id;
        
        const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
          filters: { user: userId }
        });
        
        let wallet = wallets[0];
        if (!wallet) {
          // 如果钱包不存在，创建钱包
          wallet = await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
            data: {
              usdtYue: '0',
              aiYue: '0',
              aiTokenBalances: '{}',
              user: userId
            }
          });
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
        
        const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
          filters: { user: userId }
        });
        
        let wallet = wallets[0];
        if (!wallet) {
          // 如果钱包不存在，创建钱包
          wallet = await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
            data: {
              usdtYue: '0',
              aiYue: '0',
              aiTokenBalances: '{}',
              user: userId
            }
          });
        }

        // 更新钱包余额
        const updateData: any = {};
        if (usdtYue !== undefined) updateData.usdtYue = usdtYue;
        if (aiYue !== undefined) updateData.aiYue = aiYue;
        if (aiTokenBalances !== undefined) updateData.aiTokenBalances = aiTokenBalances;

        const updatedWallet = await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
          data: updateData
        });

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

        // 验证用户是否存在
        const user = await strapi.entityService.findOne('plugin::users-permissions.user', data.user);
        if (!user) {
          return ctx.badRequest('用户不存在');
        }

        // 查找或创建钱包
        const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
          filters: { user: data.user }
        });
        
        let wallet = wallets[0];
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
          const currentUsdt = parseFloat(wallet.usdtYue || '0');
          updateData.usdtYue = (currentUsdt + parseFloat(data.usdtYue)).toString();
        }
        if (data.aiYue !== undefined) {
          const currentAi = parseFloat(wallet.aiYue || '0');
          updateData.aiYue = (currentAi + parseFloat(data.aiYue)).toString();
        }
        if (data.aiTokenBalances !== undefined) {
          updateData.aiTokenBalances = data.aiTokenBalances;
        }

        const updatedWallet = await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
          data: updateData
        });

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
        
        const wallet = await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
          data: {
            usdtYue: data.usdtYue || '0',
            aiYue: data.aiYue || '0',
            aiTokenBalances: data.aiTokenBalances || '{}',
            user: data.user
          }
        });
        
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