import { Strapi } from '@strapi/strapi';
import { HybridPushService } from '../../../services/push/hybrid-push';

export default ({ strapi }: { strapi: Strapi }) => ({
  /**
   * 注册用户的推送token
   */
  async registerToken(ctx) {
    try {
      const { pushToken, serviceType, deviceType = 'android' } = ctx.request.body;
      
      // 检查用户是否已登录
      if (!ctx.state.user || !ctx.state.user.id) {
        return ctx.unauthorized('用户未登录');
      }
      
      const userId = ctx.state.user.id;

      if (!pushToken) {
        return ctx.badRequest('pushToken是必需的');
      }

      if (!serviceType || !['firebase', 'jpush'].includes(serviceType)) {
        return ctx.badRequest('serviceType必须是firebase或jpush');
      }

      const hybridPushService = new HybridPushService(strapi);
      const result = await hybridPushService.registerUserToken(userId, pushToken, serviceType, deviceType);

      if (result.success) {
        return ctx.send({
          success: true,
          message: result.message,
        });
      } else {
        return ctx.badRequest(result.error);
      }
    } catch (error) {
      console.error('注册推送token失败:', error);
      return ctx.internalServerError('注册推送token失败');
    }
  },

  /**
   * 注销用户的推送token
   */
  async unregisterToken(ctx) {
    try {
      const { pushToken, serviceType } = ctx.request.body;
      
      // 检查用户是否已登录
      if (!ctx.state.user || !ctx.state.user.id) {
        return ctx.unauthorized('用户未登录');
      }
      
      const userId = ctx.state.user.id;

      if (!pushToken) {
        return ctx.badRequest('pushToken是必需的');
      }

      if (!serviceType || !['firebase', 'jpush'].includes(serviceType)) {
        return ctx.badRequest('serviceType必须是firebase或jpush');
      }

      const hybridPushService = new HybridPushService(strapi);
      const result = await hybridPushService.unregisterUserToken(userId, pushToken, serviceType);

      if (result.success) {
        return ctx.send({
          success: true,
          message: result.message,
        });
      } else {
        return ctx.badRequest(result.error);
      }
    } catch (error) {
      console.error('注销推送token失败:', error);
      return ctx.internalServerError('注销推送token失败');
    }
  },

  /**
   * 获取用户的推送token列表
   */
  async getUserTokens(ctx) {
    try {
      // 检查用户是否已登录
      if (!ctx.state.user || !ctx.state.user.id) {
        return ctx.unauthorized('用户未登录');
      }
      
      const userId = ctx.state.user.id;

      const hybridPushService = new HybridPushService(strapi);
      const tokens = await hybridPushService.getUserPushTokens(userId);

      return ctx.send({
        success: true,
        tokens,
      });
    } catch (error) {
      console.error('获取用户推送token失败:', error);
      return ctx.internalServerError('获取用户推送token失败');
    }
  },
});
