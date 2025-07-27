import { Strapi } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default ({ strapi }: { strapi: Strapi }) => ({
  // 处理投资完成后的逻辑
  async handleInvestmentCompletion(orderId: number) {
    try {
      // 获取订单信息
      const order = await strapi.entityService.findOne('api::dinggou-dingdan.dinggou-dingdan', orderId, {
        populate: ['user', 'jihua']
      });

      if (!order) {
        throw new Error('订单不存在');
      }

      console.log(`处理投资完成: 订单 ${orderId}, 当前状态: ${order.status}`);

      // 只有running状态的订单才能转为redeemable
      if (order.status !== 'running') {
        console.log(`订单 ${orderId} 状态不是running，跳过处理`);
        return {
          success: false,
          reason: 'invalid_status',
          message: '订单状态不是running'
        };
      }

      // 更新订单状态为可赎回
      await strapi.entityService.update('api::dinggou-dingdan.dinggou-dingdan', orderId, {
        data: { status: 'redeemable' }
      });

      console.log(`订单 ${orderId} 状态更新为 redeemable`);

      // 处理邀请奖励（使用新的档位封顶制度）
      const rewardResult = await this.processInvitationRewardV2(order);
      
      const result = {
        success: true,
        orderId: orderId,
        newStatus: 'redeemable',
        invitationReward: rewardResult,
        message: '投资完成处理成功'
      };

      console.log(`✅ 投资完成处理成功: 订单 ${orderId}`, result);
      return result;
    } catch (error) {
      console.error(`❌ 投资完成处理失败: 订单 ${orderId}`, error);
      return {
        success: false,
        error: error.message,
        message: '投资完成处理失败'
      };
    }
  },

  // 新的邀请奖励处理逻辑（按上级档位封顶计算）
  async processInvitationRewardV2(order: any) {
    try {
      const userId = order.user.id;
      const investmentAmount = new Decimal(order.amount);
      const childPrincipal = investmentAmount.toNumber();

      console.log(`开始处理邀请奖励V2: 订单 ${order.id}, 用户 ${userId}, 投资金额 ${investmentAmount.toString()}`);

      // 获取用户的邀请人
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId, {
        populate: ['invitedBy']
      });

      if (!user.invitedBy) {
        console.log(`用户 ${userId} 没有邀请人，跳过邀请奖励`);
        return {
          success: false,
          reason: 'no_inviter',
          message: '用户没有邀请人'
        };
      }

      // 获取邀请奖励配置服务
      const rewardConfigService = strapi.service('api::invitation-reward-config.invitation-reward-config');
      
      // 获取邀请人的当前最高有效档位
      const parentTier = await rewardConfigService.getUserCurrentTier(user.invitedBy.id);
      
      if (!parentTier) {
        console.log(`邀请人 ${user.invitedBy.id} 没有有效的投资档位，跳过邀请奖励`);
        return {
          success: false,
          reason: 'no_valid_tier',
          message: '邀请人没有有效的投资档位'
        };
      }

      console.log(`邀请人档位: ${parentTier.name}, 静态收益率: ${(parentTier.staticRate * 100).toFixed(0)}%, 返佣系数: ${(parentTier.referralRate * 100).toFixed(0)}%`);

      // 计算邀请奖励
      const rewardCalculation = rewardConfigService.calculateReferralReward(parentTier, childPrincipal);
      const rewardAmount = new Decimal(rewardCalculation.rewardAmount);

      console.log(`邀请奖励计算: ${rewardCalculation.calculation}`);

      // 创建邀请奖励记录
      const rewardRecord = await strapi.entityService.create('api::yaoqing-jiangli.yaoqing-jiangli', {
        data: {
          shouyiUSDT: rewardAmount.toString(),
          tuijianRen: user.invitedBy.id,
          laiyuanRen: userId,
          laiyuanDan: order.id,
          // 新增字段：记录计算详情
          calculation: rewardCalculation.calculation,
          parentTier: parentTier.name,
          childPrincipal: childPrincipal.toString(),
          commissionablePrincipal: Math.min(childPrincipal, parentTier.maxCommission).toString()
        }
      });

      console.log(`邀请奖励记录创建成功: ID ${rewardRecord.id}`);

      // 更新邀请人钱包余额
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: { $eq: user.invitedBy.id } }
      }) as any[];

      if (wallets && wallets.length > 0) {
        const wallet = wallets[0];
        const currentBalance = new Decimal(wallet.usdtYue || 0);
        const newBalance = currentBalance.plus(rewardAmount);
        
        await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
          data: { usdtYue: newBalance.toString() }
        });

        console.log(`邀请人钱包余额更新: 用户 ${user.invitedBy.id}, 原余额 ${currentBalance.toString()}, 新余额 ${newBalance.toString()}`);
      } else {
        console.warn(`邀请人 ${user.invitedBy.id} 没有找到钱包，无法更新余额`);
      }

      const result = {
        success: true,
        rewardId: rewardRecord.id,
        rewardAmount: rewardAmount.toString(),
        inviterId: user.invitedBy.id,
        inviterUsername: user.invitedBy.username,
        parentTier: parentTier.name,
        calculation: rewardCalculation.calculation,
        message: '邀请奖励处理成功'
      };

      console.log(`✅ 邀请奖励处理成功: 推荐人 ${user.invitedBy.id}, 奖励 ${rewardAmount.toString()} USDT`);
      
      return result;
    } catch (error) {
      console.error('❌ 邀请奖励处理失败:', error);
      return {
        success: false,
        error: error.message,
        message: '邀请奖励处理失败'
      };
    }
  },

  // 检查并处理到期的投资
  async checkAndProcessExpiredInvestments() {
    try {
      const now = new Date();
      
      // 查找已到期但未处理的订单
      const expiredOrders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
        filters: {
          end_at: { $lte: now },
          status: 'running'
        },
        populate: ['user', 'jihua']
      });

      console.log(`发现 ${(expiredOrders as any[]).length} 个到期订单`);

      for (const order of expiredOrders as any[]) {
        try {
          const result = await this.handleInvestmentCompletion(order.id);
          console.log(`处理到期订单 ${order.id} 结果:`, result);
        } catch (error) {
          console.error(`处理到期订单 ${order.id} 时出错:`, error);
        }
      }
    } catch (error) {
      console.error('检查到期投资失败:', error);
      throw error;
    }
  },

  // 获取投资统计
  async getInvestmentStats(userId: number) {
    try {
      // 获取用户的所有订单
      const orders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
        filters: { user: { $eq: userId } },
        populate: ['jihua']
      }) as any[];

      // 计算统计数据
      const totalInvestment = (orders as any[]).reduce((sum, order) => {
        return sum + parseFloat(order.amount || 0);
      }, 0);

      const activeOrders = (orders as any[]).filter(order => order.status === 'running');
      const completedOrders = (orders as any[]).filter(order => order.status === 'finished');
      const redeemableOrders = (orders as any[]).filter(order => order.status === 'redeemable');

      const totalYield = completedOrders.reduce((sum, order) => {
        return sum + parseFloat(order.payout_amount || 0);
      }, 0);

      return {
        totalInvestment,
        totalOrders: (orders as any[]).length,
        activeOrders: activeOrders.length,
        completedOrders: completedOrders.length,
        redeemableOrders: redeemableOrders.length,
        totalYield
      };
    } catch (error) {
      console.error('获取投资统计失败:', error);
      throw error;
    }
  }
}); 