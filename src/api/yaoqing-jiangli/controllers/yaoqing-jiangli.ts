import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreController('api::yaoqing-jiangli.yaoqing-jiangli', ({ strapi }) => ({
  // 添加默认的find方法
  async find(ctx) {
    try {
      const result = await strapi.entityService.findPage('api::yaoqing-jiangli.yaoqing-jiangli', {
        ...ctx.query,
        populate: ['tuijianRen', 'laiyuanRen', 'laiyuanDan']
      });
      return result;
    } catch (error) {
      console.error('获取邀请奖励列表失败:', error);
      ctx.throw(500, `获取邀请奖励列表失败: ${error.message}`);
    }
  },

  // 添加默认的findOne方法
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.entityService.findOne('api::yaoqing-jiangli.yaoqing-jiangli', id, {
        populate: ['tuijianRen', 'laiyuanRen', 'laiyuanDan']
      });
      return result;
    } catch (error) {
      console.error('获取邀请奖励详情失败:', error);
      ctx.throw(500, `获取邀请奖励详情失败: ${error.message}`);
    }
  },

  // 添加默认的update方法
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;
      const result = await strapi.entityService.update('api::yaoqing-jiangli.yaoqing-jiangli', id, {
        data
      });
      return result;
    } catch (error) {
      console.error('更新邀请奖励失败:', error);
      ctx.throw(500, `更新邀请奖励失败: ${error.message}`);
    }
  },

  // 添加默认的delete方法
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.entityService.delete('api::yaoqing-jiangli.yaoqing-jiangli', id);
      return result;
    } catch (error) {
      console.error('删除邀请奖励失败:', error);
      ctx.throw(500, `删除邀请奖励失败: ${error.message}`);
    }
  },

  // 创建邀请奖励（兼容性方法，复制V2版本逻辑）
  async createReward(ctx) {
    try {
      const { data } = ctx.request.body;
      
      if (!data) {
        return ctx.badRequest('缺少data字段');
      }

      if (!data.tuijianRen || !data.laiyuanRen || !data.childPrincipal) {
        return ctx.badRequest('缺少必要字段');
      }

      // 验证推荐人是否存在
      const tuijianUser = await strapi.entityService.findOne('plugin::users-permissions.user', data.tuijianRen);
      if (!tuijianUser) {
        return ctx.badRequest('推荐人不存在');
      }

      // 验证来源人是否存在
      const laiyuanUser = await strapi.entityService.findOne('plugin::users-permissions.user', data.laiyuanRen);
      if (!laiyuanUser) {
        return ctx.badRequest('来源人不存在');
      }

      // 获取邀请奖励配置服务
      const rewardConfigService = strapi.service('api::invitation-reward-config.invitation-reward-config');
      
      // 获取推荐人的当前最高有效档位
      const parentTier = await rewardConfigService.getUserCurrentTier(data.tuijianRen);
      
      if (!parentTier) {
        return ctx.badRequest('推荐人没有有效的投资档位');
      }

      // 计算邀请奖励
      const childPrincipal = parseFloat(data.childPrincipal);
      const rewardCalculation = rewardConfigService.calculateReferralReward(parentTier, childPrincipal);
      const rewardAmount = new Decimal(rewardCalculation.rewardAmount);

      // 创建奖励记录
      const reward = await strapi.entityService.create('api::yaoqing-jiangli.yaoqing-jiangli', {
        data: {
          shouyiUSDT: rewardAmount.toString(),
          tuijianRen: data.tuijianRen,
          laiyuanRen: data.laiyuanRen,
          laiyuanDan: data.laiyuanDan || null,
          calculation: rewardCalculation.calculation,
          parentTier: parentTier.name,
          childPrincipal: childPrincipal.toString(),
          commissionablePrincipal: Math.min(childPrincipal, parentTier.maxCommission).toString(),
          rewardLevel: data.rewardLevel || 1,
          rewardType: data.rewardType || 'referral'
        }
      });

      // 更新推荐人钱包余额
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: { id: data.tuijianRen } }
      }) as any[];

      if (wallets && wallets.length > 0) {
        const wallet = wallets[0];
        const currentBalance = new Decimal(wallet.usdtYue || 0);
        
        await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
          data: { usdtYue: currentBalance.plus(rewardAmount).toString() }
        });
      }

      ctx.body = {
        success: true,
        data: {
          reward,
          calculation: rewardCalculation.calculation,
          parentTier: parentTier.name
        },
        message: '邀请奖励创建成功'
      };
    } catch (error) {
      console.error('创建邀请奖励失败:', error);
      ctx.throw(500, `创建邀请奖励失败: ${error.message}`);
    }
  },

  // 创建邀请奖励（V2版本，支持档位封顶计算）
  async createRewardV2(ctx) {
    try {
      const { data } = ctx.request.body;
      
      if (!data) {
        return ctx.badRequest('缺少data字段');
      }

      if (!data.tuijianRen || !data.laiyuanRen || !data.childPrincipal) {
        return ctx.badRequest('缺少必要字段');
      }

      // 验证推荐人是否存在
      const tuijianUser = await strapi.entityService.findOne('plugin::users-permissions.user', data.tuijianRen);
      if (!tuijianUser) {
        return ctx.badRequest('推荐人不存在');
      }

      // 验证来源人是否存在
      const laiyuanUser = await strapi.entityService.findOne('plugin::users-permissions.user', data.laiyuanRen);
      if (!laiyuanUser) {
        return ctx.badRequest('来源人不存在');
      }

      // 获取邀请奖励配置服务
      const rewardConfigService = strapi.service('api::invitation-reward-config.invitation-reward-config');
      
      // 获取推荐人的当前最高有效档位
      const parentTier = await rewardConfigService.getUserCurrentTier(data.tuijianRen);
      
      if (!parentTier) {
        return ctx.badRequest('推荐人没有有效的投资档位');
      }

      // 计算邀请奖励
      const childPrincipal = parseFloat(data.childPrincipal);
      const rewardCalculation = rewardConfigService.calculateReferralReward(parentTier, childPrincipal);
      const rewardAmount = new Decimal(rewardCalculation.rewardAmount);

      // 创建奖励记录
      const reward = await strapi.entityService.create('api::yaoqing-jiangli.yaoqing-jiangli', {
        data: {
          shouyiUSDT: rewardAmount.toString(),
          tuijianRen: data.tuijianRen,
          laiyuanRen: data.laiyuanRen,
          laiyuanDan: data.laiyuanDan || null,
          calculation: rewardCalculation.calculation,
          parentTier: parentTier.name,
          childPrincipal: childPrincipal.toString(),
          commissionablePrincipal: Math.min(childPrincipal, parentTier.maxCommission).toString(),
          rewardLevel: data.rewardLevel || 1,
          rewardType: data.rewardType || 'referral'
        }
      });

      // 更新推荐人钱包余额
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: { id: data.tuijianRen } }
      }) as any[];

      if (wallets && wallets.length > 0) {
        const wallet = wallets[0];
        const currentBalance = new Decimal(wallet.usdtYue || 0);
        
        await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
          data: { usdtYue: currentBalance.plus(rewardAmount).toString() } as any
        });
      }

      ctx.body = {
        success: true,
        data: {
          reward,
          calculation: rewardCalculation.calculation,
          parentTier: parentTier.name
        },
        message: '邀请奖励创建成功'
      };
    } catch (error) {
      console.error('创建邀请奖励失败:', error);
      ctx.throw(500, `创建邀请奖励失败: ${error.message}`);
    }
  },

  // 获取用户邀请奖励记录
  async getUserRewards(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { page = 1, pageSize = 10 } = ctx.query;

      const rewards = await strapi.entityService.findMany('api::yaoqing-jiangli.yaoqing-jiangli', {
        filters: { tuijianRen: userId },
        populate: ['laiyuanRen', 'laiyuanDan'],
        pagination: {
          page: parseInt(String(page)),
          pageSize: parseInt(String(pageSize))
        },
        sort: { createdAt: 'desc' }
      }) as any[];

      ctx.body = {
        success: true,
        data: {
          rewards,
          pagination: {
            page: parseInt(String(page)),
            pageSize: parseInt(String(pageSize)),
            total: rewards.length
          }
        }
      };
    } catch (error) {
      console.error('获取用户邀请奖励失败:', error);
      ctx.throw(500, `获取用户邀请奖励失败: ${error.message}`);
    }
  },

  // 获取用户团队统计（兼容性方法，复制V2版本逻辑）
  async getTeamStats(ctx) {
    try {
      const userId = ctx.state.user.id;

      // 获取直接推荐人数
      const directReferrals = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: { invitedBy: userId }
      }) as any[];

      // 获取间接推荐人数
      const indirectReferrals = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: { 
          invitedBy: { $in: directReferrals.map(user => user.id) }
        }
      } as any) as any[];

      // 获取总收益和奖励记录
      const totalRewards = await strapi.entityService.findMany('api::yaoqing-jiangli.yaoqing-jiangli', {
        filters: { tuijianRen: userId },
        populate: ['tuijianRen', 'laiyuanRen', 'laiyuanDan']
      }) as any[];

      const totalEarnings = totalRewards.reduce((sum, reward) => {
        return sum + new Decimal(reward.shouyiUSDT || 0).toNumber();
      }, 0);

      // 获取用户当前档位
      const rewardConfigService = strapi.service('api::invitation-reward-config.invitation-reward-config');
      console.log(`开始获取用户 ${userId} 的当前档位...`);
      const currentTier = await rewardConfigService.getUserCurrentTier(userId);

      console.log('API返回的currentTier:', currentTier); // 调试日志
      console.log('currentTier详情:', {
        name: currentTier?.name,
        staticRate: currentTier?.staticRate,
        referralRate: currentTier?.referralRate,
        maxCommission: currentTier?.maxCommission
      });

      ctx.body = {
        success: true,
        data: {
          directReferrals: directReferrals.length,
          indirectReferrals: indirectReferrals.length,
          totalReferrals: directReferrals.length + indirectReferrals.length,
          totalEarnings: totalEarnings.toString(),
          currentTier: currentTier ? {
            name: currentTier.name,
            staticRate: currentTier.staticRate,
            referralRate: currentTier.referralRate,
            maxCommission: currentTier.maxCommission
          } : {
            name: '未知',
            staticRate: 0,
            referralRate: 0,
            maxCommission: 0
          },
          rewards: totalRewards // 添加奖励记录
        }
      };
    } catch (error) {
      console.error('获取团队统计失败:', error);
      ctx.throw(500, `获取团队统计失败: ${error.message}`);
    }
  },

  // 获取用户团队统计（V2版本，支持档位封顶计算）
  async getTeamStatsV2(ctx) {
    try {
      const userId = ctx.state.user.id;

      // 获取直接推荐人数
      const directReferrals = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: { invitedBy: userId }
      }) as any[];

      // 获取间接推荐人数
      const indirectReferrals = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: { 
          invitedBy: { $in: directReferrals.map(user => user.id) }
        }
      } as any) as any[];

      // 获取总收益和奖励记录
      const totalRewards = await strapi.entityService.findMany('api::yaoqing-jiangli.yaoqing-jiangli', {
        filters: { tuijianRen: userId },
        populate: ['tuijianRen', 'laiyuanRen', 'laiyuanDan']
      }) as any[];

      const totalEarnings = totalRewards.reduce((sum, reward) => {
        return sum + new Decimal(reward.shouyiUSDT || 0).toNumber();
      }, 0);

      // 获取用户当前档位
      const rewardConfigService = strapi.service('api::invitation-reward-config.invitation-reward-config');
      const currentTier = await rewardConfigService.getUserCurrentTier(userId);

      console.log('API V2返回的currentTier:', currentTier); // 调试日志

      ctx.body = {
        success: true,
        data: {
          directReferrals: directReferrals.length,
          indirectReferrals: indirectReferrals.length,
          totalReferrals: directReferrals.length + indirectReferrals.length,
          totalEarnings: totalEarnings.toString(),
          currentTier: currentTier ? {
            name: currentTier.name,
            staticRate: currentTier.staticRate,
            referralRate: currentTier.referralRate,
            maxCommission: currentTier.maxCommission
          } : {
            name: '未知',
            staticRate: 0,
            referralRate: 0,
            maxCommission: 0
          },
          rewards: totalRewards // 添加奖励记录
        }
      };
    } catch (error) {
      console.error('获取团队统计失败:', error);
      ctx.throw(500, `获取团队统计失败: ${error.message}`);
    }
  },

  // 获取邀请奖励档位配置
  async getRewardTiers(ctx) {
    try {
      const rewardConfigService = strapi.service('api::invitation-reward-config.invitation-reward-config');
      const tiers = rewardConfigService.getAllTiers();
      const isValid = rewardConfigService.validateTierConfig();

      ctx.body = {
        success: true,
        data: {
          tiers,
          isValid,
          message: isValid ? '档位配置有效' : '档位配置有误'
        }
      };
    } catch (error) {
      console.error('获取奖励档位配置失败:', error);
      ctx.throw(500, `获取奖励档位配置失败: ${error.message}`);
    }
  },

  // 获取订单相关的邀请奖励
  async getOrderInvitationReward(ctx) {
    try {
      const { orderId } = ctx.params;
      const userId = ctx.state.user.id;

      if (!orderId || isNaN(Number(orderId))) {
        return ctx.badRequest('无效的订单ID');
      }

      // 验证订单所有者
      const order = await strapi.entityService.findOne('api::dinggou-dingdan.dinggou-dingdan', orderId, {
        populate: ['user']
      });
      if (!order) {
        return ctx.notFound('订单不存在');
      }

      if ((order as any).user?.id !== userId) {
        return ctx.forbidden('无权查看此订单的邀请奖励');
      }

      // 查询邀请奖励
      const rewards = await strapi.entityService.findMany('api::yaoqing-jiangli.yaoqing-jiangli', {
        filters: { laiyuanDan: orderId },
        populate: ['tuijianRen']
      }) as any[];

      if (rewards.length === 0) {
        ctx.body = {
          success: true,
          data: {
            hasReward: false,
            rewardAmount: '0',
            inviterInfo: null,
            message: '该订单没有邀请奖励'
          }
        };
        return;
      }

      const reward = rewards[0];
      ctx.body = {
        success: true,
        data: {
          hasReward: true,
          rewardId: reward.id,
          rewardAmount: reward.shouyiUSDT,
          calculation: reward.calculation,
          parentTier: reward.parentTier,
          inviterInfo: {
            id: reward.tuijianRen.id,
            username: reward.tuijianRen.username
          },
          createdAt: reward.createdAt,
          message: '邀请奖励查询成功'
        }
      };
    } catch (error) {
      console.error('获取订单邀请奖励失败:', error);
      ctx.throw(500, `获取订单邀请奖励失败: ${error.message}`);
    }
  },

  // 重写create方法，添加数据验证
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      
      if (!data) {
        return ctx.badRequest('缺少data字段');
      }
      
      if (!data.tuijianRen || !data.laiyuanRen || !data.shouyiUSDT) {
        return ctx.badRequest('缺少必要字段');
      }
      
      // 验证推荐人是否存在
      const tuijianUser = await strapi.entityService.findOne('plugin::users-permissions.user', data.tuijianRen);
      if (!tuijianUser) {
        return ctx.badRequest('推荐人不存在');
      }
      
      // 验证来源人是否存在
      const laiyuanUser = await strapi.entityService.findOne('plugin::users-permissions.user', data.laiyuanRen);
      if (!laiyuanUser) {
        return ctx.badRequest('来源人不存在');
      }
      
      // 验证收益金额
      if (isNaN(Number(data.shouyiUSDT)) || Number(data.shouyiUSDT) <= 0) {
        return ctx.badRequest('收益金额必须是大于0的数字');
      }
      
      const reward = await strapi.entityService.create('api::yaoqing-jiangli.yaoqing-jiangli', {
        data: {
          shouyiUSDT: data.shouyiUSDT,
          tuijianRen: data.tuijianRen,
          laiyuanRen: data.laiyuanRen,
          laiyuanDan: data.laiyuanDan || null,
          calculation: data.calculation || '',
          parentTier: data.parentTier || '',
          childPrincipal: data.childPrincipal || '',
          commissionablePrincipal: data.commissionablePrincipal || '',
          rewardLevel: data.rewardLevel || 1,
          rewardType: data.rewardType || 'referral'
        }
      });
      
      ctx.body = {
        success: true,
        data: reward,
        message: '邀请奖励创建成功'
      };
    } catch (error) {
      console.error('创建邀请奖励失败:', error);
      ctx.throw(500, `创建邀请奖励失败: ${error.message}`);
    }
  },
})); 