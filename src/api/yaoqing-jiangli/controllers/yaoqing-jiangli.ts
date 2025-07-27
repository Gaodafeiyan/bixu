import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreController('api::yaoqing-jiangli.yaoqing-jiangli', ({ strapi }) => ({
  // 添加默认的find方法
  async find(ctx) {
    try {
      const result = await strapi.entityService.findPage('api::yaoqing-jiangli.yaoqing-jiangli', {
        ...ctx.query,
        populate: ['*']
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
        populate: ['*']
      });
      return result;
    } catch (error) {
      console.error('获取邀请奖励详情失败:', error);
      ctx.throw(500, `获取邀请奖励详情失败: ${error.message}`);
    }
  },

  // 添加默认的create方法
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      const result = await strapi.entityService.create('api::yaoqing-jiangli.yaoqing-jiangli', {
        data
      });
      return result;
    } catch (error) {
      console.error('创建邀请奖励失败:', error);
      ctx.throw(500, `创建邀请奖励失败: ${error.message}`);
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

  // 创建邀请奖励
  async createReward(ctx) {
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

      // 创建奖励记录
      const reward = await strapi.entityService.create('api::yaoqing-jiangli.yaoqing-jiangli', {
        data: {
          shouyiUSDT: data.shouyiUSDT,
          tuijianRen: data.tuijianRen,
          laiyuanRen: data.laiyuanRen,
          laiyuanDan: data.laiyuanDan || null
        }
      });

      // 更新推荐人钱包余额
      const rewardAmount = new Decimal(data.shouyiUSDT);
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: data.tuijianRen }
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
        data: reward,
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

  // 获取用户团队统计
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

      // 获取总收益
      const totalRewards = await strapi.entityService.findMany('api::yaoqing-jiangli.yaoqing-jiangli', {
        filters: { tuijianRen: userId }
      }) as any[];

      const totalEarnings = totalRewards.reduce((sum, reward) => {
        return sum + new Decimal(reward.shouyiUSDT || 0).toNumber();
      }, 0);

      ctx.body = {
        success: true,
        data: {
          directReferrals: directReferrals.length,
          indirectReferrals: indirectReferrals.length,
          totalReferrals: directReferrals.length + indirectReferrals.length,
          totalEarnings: totalEarnings.toString()
        }
      };
    } catch (error) {
      console.error('获取团队统计失败:', error);
      ctx.throw(500, `获取团队统计失败: ${error.message}`);
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
          laiyuanDan: data.laiyuanDan || null
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