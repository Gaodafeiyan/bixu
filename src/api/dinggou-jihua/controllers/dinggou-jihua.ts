import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreController('api::dinggou-jihua.dinggou-jihua', ({ strapi }) => ({
  // 投资认购计划
  async invest(ctx) {
    try {
      const { planId } = ctx.params;
      const userId = ctx.state.user.id;

      // 输入验证
      if (!planId || isNaN(Number(planId))) {
        return ctx.badRequest('无效的计划ID');
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

      // 检查槽位是否已满
      if (plan.current_slots >= plan.max_slots) {
        return ctx.badRequest('认购计划槽位已满');
      }

      // 使用计划中预设的投资金额
      const investmentAmount = new Decimal(plan.benjinUSDT || 0);
      if (investmentAmount.isZero()) {
        return ctx.badRequest('认购计划金额未设置');
      }

      // 使用事务服务执行投资操作
      const transactionService = strapi.service('api::transaction-service.transaction-service');
      const result = await transactionService.executeInvestmentTransaction(
        userId, 
        Number(planId), 
        investmentAmount
      );

      // 记录操作日志
      console.log(`用户 ${userId} 投资计划 ${planId}，金额: ${investmentAmount.toString()} USDT`);

      ctx.body = {
        success: true,
        data: {
          orderId: result.orderId,
          investmentAmount: investmentAmount.toString(),
          planName: result.planName,
          planCode: result.planCode,
          newBalance: result.newBalance
        },
        message: '投资成功'
      };
    } catch (error) {
      console.error('投资失败:', error);
      
      // 统一错误处理
      if (error.message.includes('钱包余额不足')) {
        return ctx.badRequest('钱包余额不足');
      } else if (error.message.includes('认购计划不存在')) {
        return ctx.notFound('认购计划不存在');
      } else if (error.message.includes('用户钱包不存在')) {
        return ctx.badRequest('用户钱包不存在');
      }
      
      ctx.throw(500, `投资失败: ${error.message}`);
    }
  },

  // 赎回投资
  async redeem(ctx) {
    try {
      const { orderId } = ctx.params;
      const userId = ctx.state.user.id;

      // 输入验证
      if (!orderId || isNaN(Number(orderId))) {
        return ctx.badRequest('无效的订单ID');
      }

      // 使用事务服务执行赎回操作
      const transactionService = strapi.service('api::transaction-service.transaction-service');
      const result = await transactionService.executeRedemptionTransaction(
        Number(orderId), 
        userId
      );

      // 记录操作日志
      console.log(`用户 ${userId} 赎回订单 ${orderId}，总收益: ${result.totalPayout} USDT`);

      ctx.body = {
        success: true,
        data: {
          orderId: result.orderId,
          investmentAmount: result.investmentAmount,
          staticYield: result.staticYield,
          totalPayout: result.totalPayout
        },
        message: '赎回成功'
      };
    } catch (error) {
      console.error('赎回失败:', error);
      
      // 统一错误处理
      if (error.message.includes('订单不存在')) {
        return ctx.notFound('订单不存在');
      } else if (error.message.includes('订单尚未完成')) {
        return ctx.badRequest('订单尚未完成，无法赎回');
      } else if (error.message.includes('无权操作')) {
        return ctx.forbidden('无权操作此订单');
      }
      
      ctx.throw(500, `赎回失败: ${error.message}`);
    }
  },

  // 获取计划统计信息
  async getPlanStats(ctx) {
    try {
      const { planId } = ctx.params;

      // 输入验证
      if (!planId || isNaN(Number(planId))) {
        return ctx.badRequest('无效的计划ID');
      }

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
      const totalInvestment = (orders as any[]).reduce((sum, order) => {
        return sum + parseFloat(order.amount || 0);
      }, 0);

      const activeOrders = (orders as any[]).filter(order => order.status === 'running');
      const completedOrders = (orders as any[]).filter(order => order.status === 'finished');

      const totalYield = completedOrders.reduce((sum, order) => {
        return sum + parseFloat(order.payout_amount || 0);
      }, 0);

      ctx.body = {
        success: true,
        data: {
          planId: plan.id,
          planName: plan.jihuaCode,
          totalInvestment,
          totalParticipants: (orders as any[]).length,
          activeParticipants: activeOrders.length,
          completedParticipants: completedOrders.length,
          totalYield,
          maxSlots: plan.max_slots || 100,
          currentSlots: (orders as any[]).length,
          availableSlots: (plan.max_slots || 100) - (orders as any[]).length
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

      // 输入验证
      const pageNum = parseInt(String(page));
      const pageSizeNum = parseInt(String(pageSize));
      
      if (isNaN(pageNum) || isNaN(pageSizeNum) || pageNum < 1 || pageSizeNum < 1) {
        return ctx.badRequest('无效的分页参数');
      }

      const orders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
        filters: { user: userId },
        populate: ['jihua'],
        pagination: {
          page: pageNum,
          pageSize: pageSizeNum
        }
      }) as any[];

      ctx.body = {
        success: true,
        data: {
          orders,
          pagination: {
            page: pageNum,
            pageSize: pageSizeNum,
            total: orders.length
          }
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

      // 输入验证
      if (!planId || isNaN(Number(planId))) {
        return ctx.badRequest('无效的计划ID');
      }

      const pageNum = parseInt(String(page));
      const pageSizeNum = parseInt(String(pageSize));
      
      if (isNaN(pageNum) || isNaN(pageSizeNum) || pageNum < 1 || pageSizeNum < 1) {
        return ctx.badRequest('无效的分页参数');
      }

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
          page: pageNum,
          pageSize: pageSizeNum
        },
        sort: { createdAt: 'desc' }
      });

      // 格式化参与者信息
      const formattedParticipants = (participants as any[]).map(order => ({
        userId: order.user.id,
        username: order.user.username,
        email: order.user.email,
        amount: order.amount,
        status: order.status,
        createdAt: order.createdAt
      }));

      ctx.body = {
        success: true,
        data: {
          participants: formattedParticipants,
          pagination: {
            page: pageNum,
            pageSize: pageSizeNum,
            total: (participants as any[]).length
          }
        }
      };
    } catch (error) {
      console.error('获取参与者列表失败:', error);
      ctx.throw(500, `获取参与者列表失败: ${error.message}`);
    }
  }
})); 