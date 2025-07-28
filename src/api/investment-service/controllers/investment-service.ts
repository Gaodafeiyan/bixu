export default ({ strapi }) => ({
  // 手动触发投资完成处理
  async handleCompletion(ctx) {
    try {
      const { orderId } = ctx.request.body;
      
      if (!orderId || isNaN(Number(orderId))) {
        return ctx.badRequest('Invalid order ID');
      }

      console.log(`Manually triggering investment completion: Order ${orderId}`);

      // 获取服务实例并调用方法
      const service = strapi.service('api::investment-service.investment-service');
      const result = await service.handleInvestmentCompletion(Number(orderId));

      ctx.body = {
        success: true,
        data: result,
        message: 'Investment completion processing executed'
      };
    } catch (error) {
      console.error('Manual investment completion trigger failed:', error);
      ctx.throw(500, `Investment completion processing failed: ${error.message}`);
    }
  },

  // 手动触发邀请奖励处理
  async processInvitationReward(ctx) {
    try {
      const { orderId, orderData } = ctx.request.body;
      
      if (!orderId || isNaN(Number(orderId))) {
        return ctx.badRequest('Invalid order ID');
      }

      console.log(`Manually triggering invitation reward processing: Order ${orderId}`);

      // 如果没有提供orderData，先获取订单信息
      let order = orderData;
      if (!order) {
        order = await strapi.entityService.findOne('api::dinggou-dingdan.dinggou-dingdan', orderId, {
          populate: ['user', 'jihua']
        });
      }

      if (!order) {
        return ctx.badRequest('Order not found');
      }

      // 获取服务实例并调用方法
      const service = strapi.service('api::investment-service.investment-service');
      const result = await service.processInvitationRewardV2(order);

      ctx.body = {
        success: true,
        data: result,
        message: 'Invitation reward processing executed'
      };
    } catch (error) {
      console.error('Manual invitation reward processing failed:', error);
      ctx.throw(500, `Invitation reward processing failed: ${error.message}`);
    }
  },

  // 手动触发过期投资检查
  async checkExpiredInvestments(ctx) {
    try {
      console.log('Manually triggering expired investment check');

      // 获取服务实例并调用方法
      const service = strapi.service('api::investment-service.investment-service');
      await service.checkAndProcessExpiredInvestments();

      ctx.body = {
        success: true,
        message: 'Expired investment check executed'
      };
    } catch (error) {
      console.error('Manual expired investment check failed:', error);
      ctx.throw(500, `Expired investment check failed: ${error.message}`);
    }
  },

  // 获取投资统计
  async getInvestmentStats(ctx) {
    try {
      const userId = ctx.state.user.id;
      
      // 获取服务实例并调用方法
      const service = strapi.service('api::investment-service.investment-service');
      const stats = await service.getInvestmentStats(userId);

      ctx.body = {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Failed to get investment statistics:', error);
      ctx.throw(500, `Failed to get investment statistics: ${error.message}`);
    }
  }
}); 