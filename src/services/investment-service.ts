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

      // 更新订单状态为可赎回
      await strapi.entityService.update('api::dinggou-dingdan.dinggou-dingdan', orderId, {
        status: 'redeemable'
      });

      // 处理邀请奖励
      await this.processInvitationReward(order);

      console.log(`✅ 投资完成处理成功: 订单 ${orderId}`);
    } catch (error) {
      console.error(`❌ 投资完成处理失败: 订单 ${orderId}`, error);
      throw error;
    }
  },

  // 处理邀请奖励
  async processInvitationReward(order: any) {
    try {
      const userId = order.user.id;
      const investmentAmount = new Decimal(order.amount);

      // 获取用户的邀请人
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId, {
        populate: ['invitedBy']
      });

      if (!user.invitedBy) {
        console.log(`用户 ${userId} 没有邀请人，跳过邀请奖励`);
        return;
      }

      // 计算邀请奖励（例如投资金额的5%）
      const rewardRate = new Decimal('0.05'); // 5% 邀请奖励
      const rewardAmount = investmentAmount.mul(rewardRate);

      // 创建邀请奖励记录
      await strapi.entityService.create('api::yaoqing-jiangli.yaoqing-jiangli', {
        data: {
          shouyiUSDT: rewardAmount.toString(),
          tuijianRen: user.invitedBy.id,
          laiyuanRen: userId,
          laiyuanDan: order.id
        }
      });

      // 更新邀请人钱包余额
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: user.invitedBy.id }
      });

      if (wallets && wallets.length > 0) {
        const wallet = wallets[0];
        const currentBalance = new Decimal(wallet.usdtYue || 0);
        
        await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
          usdtYue: currentBalance.plus(rewardAmount).toString()
        });
      }

      console.log(`✅ 邀请奖励处理成功: 推荐人 ${user.invitedBy.id}, 奖励 ${rewardAmount.toString()} USDT`);
    } catch (error) {
      console.error('❌ 邀请奖励处理失败:', error);
      throw error;
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

      console.log(`发现 ${expiredOrders.length} 个到期订单`);

      for (const order of expiredOrders as any[]) {
        try {
          await this.handleInvestmentCompletion(order.id);
        } catch (error) {
          console.error(`处理到期订单失败: ${order.id}`, error);
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
        filters: { user: userId },
        populate: ['jihua']
      });

      // 计算统计数据
      const totalInvestment = orders.reduce((sum, order) => {
        return sum + parseFloat(order.amount || 0);
      }, 0);

      const activeOrders = orders.filter(order => order.status === 'running');
      const completedOrders = orders.filter(order => order.status === 'finished');
      const redeemableOrders = orders.filter(order => order.status === 'redeemable');

      const totalYield = completedOrders.reduce((sum, order) => {
        return sum + parseFloat(order.payout_amount || 0);
      }, 0);

      return {
        totalInvestment,
        totalOrders: orders.length,
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