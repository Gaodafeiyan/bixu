import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreController('api::dinggou-jihua.dinggou-jihua', ({ strapi }) => ({
  // 投资认购计划
  async invest(ctx) {
    try {
      const { planId } = ctx.params;
      const { amount } = ctx.request.body;
      const userId = ctx.state.user.id;

      // 验证投资金额
      if (!amount || parseFloat(amount) <= 0) {
        return ctx.badRequest('投资金额必须大于0');
      }

      // 获取计划信息
      const plan = await strapi.entityService.findOne('api::dinggou-jihua.dinggou-jihua', planId);
      if (!plan) {
        return ctx.notFound('认购计划不存在');
      }

      // 检查计划状态
      if (!plan.kaiqi) {
        return ctx.badRequest('认购计划已暂停');
      }

      // 检查用户钱包余额
      const wallet = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: userId }
      });

      if (!wallet || wallet.length === 0) {
        return ctx.badRequest('用户钱包不存在');
      }

      const userWallet = wallet[0];
      const investmentAmount = new Decimal(amount);
      const walletBalance = new Decimal(userWallet.usdtYue || 0);

      if (walletBalance.lessThan(investmentAmount)) {
        return ctx.badRequest('钱包余额不足');
      }

      // 创建投资订单
      const order = await strapi.entityService.create('api::dinggou-dingdan.dinggou-dingdan', {
        data: {
          user: userId,
          jihua: planId,
          amount: investmentAmount.toString(),
          principal: investmentAmount.toString(),
          yield_rate: plan.jingtaiBili,
          cycle_days: plan.zhouQiTian,
          start_at: new Date(),
          end_at: new Date(Date.now() + plan.zhouQiTian * 24 * 60 * 60 * 1000),
          status: 'pending'
        }
      });

      // 扣除钱包余额
      await strapi.entityService.update('api::qianbao-yue.qianbao-yue', userWallet.id, {
        data: {
          usdtYue: walletBalance.minus(investmentAmount).toString()
        }
      });

      ctx.body = {
        success: true,
        data: order,
        message: '投资成功'
      };
    } catch (error) {
      console.error('投资失败:', error);
      ctx.throw(500, `投资失败: ${error.message}`);
    }
  },

  // 赎回投资
  async redeem(ctx) {
    try {
      const { orderId } = ctx.params;
      const userId = ctx.state.user.id;

      // 获取订单信息
      const order = await strapi.entityService.findOne('api::dinggou-dingdan.dinggou-dingdan', orderId, {
        populate: ['user', 'jihua']
      });

      if (!order) {
        return ctx.notFound('订单不存在');
      }

      // 验证订单所有者
      if (order.user.id !== userId) {
        return ctx.forbidden('无权操作此订单');
      }

      // 检查订单状态
      if (order.status !== 'finished') {
        return ctx.badRequest('订单尚未完成，无法赎回');
      }

      // 计算收益
      const investmentAmount = new Decimal(order.amount);
      const yieldRate = new Decimal(order.jihua.jingtaiBili);
      const cycleDays = order.cycle_days;
      
      // 计算静态收益
      const staticYield = investmentAmount.mul(yieldRate).mul(cycleDays).div(365);
      
      // 计算AI代币收益（如果有）
      const aiTokenYield = new Decimal(0); // 这里可以根据实际AI代币逻辑计算
      
      const totalYield = staticYield.plus(aiTokenYield);
      const totalPayout = investmentAmount.plus(totalYield);

      // 更新钱包余额
      const wallet = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: userId }
      });

      if (wallet && wallet.length > 0) {
        const userWallet = wallet[0];
        const currentBalance = new Decimal(userWallet.usdtYue || 0);
        
        await strapi.entityService.update('api::qianbao-yue.qianbao-yue', userWallet.id, {
          data: {
            usdtYue: currentBalance.plus(totalPayout).toString()
          }
        });
      }

      // 更新订单状态
      await strapi.entityService.update('api::dinggou-dingdan.dinggou-dingdan', orderId, {
        data: {
          status: 'finished',
          redeemed_at: new Date(),
          payout_amount: totalPayout.toString()
        }
      });

      ctx.body = {
        success: true,
        data: {
          orderId,
          investmentAmount: investmentAmount.toString(),
          staticYield: staticYield.toString(),
          aiTokenYield: aiTokenYield.toString(),
          totalYield: totalYield.toString(),
          totalPayout: totalPayout.toString()
        },
        message: '赎回成功'
      };
    } catch (error) {
      console.error('赎回失败:', error);
      ctx.throw(500, `赎回失败: ${error.message}`);
    }
  },

  // 获取计划统计信息
  async getPlanStats(ctx) {
    try {
      const { planId } = ctx.params;

      // 获取计划信息
      const plan = await strapi.entityService.findOne('api::dinggou-jihua.dinggou-jihua', planId);
      if (!plan) {
        return ctx.notFound('认购计划不存在');
      }

      // 获取该计划的所有订单
      const orders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
        filters: { jihua: planId },
        populate: ['user']
      });

      // 计算统计数据
      const totalInvestment = orders.reduce((sum, order) => {
        return sum + parseFloat(order.amount || 0);
      }, 0);

      const activeOrders = orders.filter(order => order.status === 'active');
      const completedOrders = orders.filter(order => order.status === 'finished');

      const totalYield = completedOrders.reduce((sum, order) => {
        return sum + parseFloat(order.payout_amount || 0);
      }, 0);

      ctx.body = {
        success: true,
        data: {
          planId,
          planName: plan.jihuaCode,
          totalInvestment,
          totalParticipants: orders.length,
          activeParticipants: activeOrders.length,
          completedParticipants: completedOrders.length,
          totalYield,
          maxSlots: plan.max_slots || 100,
          currentSlots: orders.length,
          availableSlots: (plan.max_slots || 100) - orders.length
        }
      };
    } catch (error) {
      console.error('获取计划统计失败:', error);
      ctx.throw(500, `获取计划统计失败: ${error.message}`);
    }
  },

  // 获取我的投资
  async getMyInvestments(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { page = 1, pageSize = 10 } = ctx.query;

      const orders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
        filters: { user: userId },
        populate: ['jihua'],
        pagination: {
          page: parseInt(String(page)),
          pageSize: parseInt(String(pageSize))
        },
        sort: { createdAt: 'desc' }
      });

      ctx.body = {
        success: true,
        data: orders,
        pagination: {
          page: parseInt(String(page)),
          pageSize: parseInt(String(pageSize)),
          total: orders.length
        }
      };
    } catch (error) {
      console.error('获取我的投资失败:', error);
      ctx.throw(500, `获取我的投资失败: ${error.message}`);
    }
  },

  // 获取计划参与者列表
  async getPlanParticipants(ctx) {
    try {
      const { planId } = ctx.params;
      const { page = 1, pageSize = 20 } = ctx.query;

      // 获取计划信息
      const plan = await strapi.entityService.findOne('api::dinggou-jihua.dinggou-jihua', planId);
      if (!plan) {
        return ctx.notFound('认购计划不存在');
      }

      // 获取该计划的参与者
      const participants = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
        filters: { jihua: planId },
        populate: ['user'],
        pagination: {
          page: parseInt(String(page)),
          pageSize: parseInt(String(pageSize))
        },
        sort: { createdAt: 'desc' }
      });

      // 格式化参与者信息
      const formattedParticipants = participants.map(order => ({
        userId: order.user.id,
        username: order.user.username,
        email: order.user.email,
        investmentAmount: order.amount,
        investmentDate: order.createdAt,
        status: order.status,
        orderId: order.id
      }));

      ctx.body = {
        success: true,
        data: {
          planId,
          planName: plan.jihuaCode,
          participants: formattedParticipants,
          pagination: {
            page: parseInt(String(page)),
            pageSize: parseInt(String(pageSize)),
            total: participants.length
          }
        }
      };
    } catch (error) {
      console.error('获取参与者列表失败:', error);
      ctx.throw(500, `获取参与者列表失败: ${error.message}`);
    }
  }
})); 