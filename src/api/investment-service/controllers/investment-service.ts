import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::investment-service.investment-service', ({ strapi }) => ({
  // 手动触发投资完成处理
  async handleCompletion(ctx) {
    try {
      const { orderId } = ctx.request.body;
      
      if (!orderId || isNaN(Number(orderId))) {
        return ctx.badRequest('无效的订单ID');
      }

      console.log(`手动触发投资完成处理: 订单 ${orderId}`);

      // 调用投资服务处理投资完成
      const result = await strapi.service('api::investment-service.investment-service').handleInvestmentCompletion(Number(orderId));

      ctx.body = {
        success: true,
        data: result,
        message: '投资完成处理已执行'
      };
    } catch (error) {
      console.error('手动触发投资完成处理失败:', error);
      ctx.throw(500, `投资完成处理失败: ${error.message}`);
    }
  },

  // 手动触发到期投资检查
  async checkExpiredInvestments(ctx) {
    try {
      console.log('手动触发到期投资检查');

      // 调用投资服务检查到期投资
      await strapi.service('api::investment-service.investment-service').checkAndProcessExpiredInvestments();

      ctx.body = {
        success: true,
        message: '到期投资检查已执行'
      };
    } catch (error) {
      console.error('手动触发到期投资检查失败:', error);
      ctx.throw(500, `到期投资检查失败: ${error.message}`);
    }
  },

  // 获取投资统计
  async getInvestmentStats(ctx) {
    try {
      const userId = ctx.state.user.id;
      
      const stats = await strapi.service('api::investment-service.investment-service').getInvestmentStats(userId);

      ctx.body = {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('获取投资统计失败:', error);
      ctx.throw(500, `获取投资统计失败: ${error.message}`);
    }
  }
})); 