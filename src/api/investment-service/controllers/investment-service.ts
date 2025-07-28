export default ({ strapi }) => ({
  // 手动触发投资完成处理
  async handleCompletion(ctx) {
    try {
      const { orderId } = ctx.request.body;
      
      if (!orderId || isNaN(Number(orderId))) {
        return ctx.badRequest('Invalid order ID');
      }

      console.log(`Manually triggering investment completion: Order ${orderId}`);

      // Call investment service to handle investment completion
      const result = await strapi.service('investment-service').handleInvestmentCompletion(Number(orderId));

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

      // Call investment service to process invitation reward
      const result = await strapi.service('investment-service').processInvitationRewardV2(order);

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

      // Call investment service to check expired investments
      await strapi.service('investment-service').checkAndProcessExpiredInvestments();

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
      
      const stats = await strapi.service('investment-service').getInvestmentStats(userId);

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