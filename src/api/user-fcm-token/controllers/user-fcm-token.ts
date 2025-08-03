import { Strapi } from '@strapi/strapi';

export default ({ strapi }: { strapi: Strapi }) => ({
  /**
   * 注册用户的FCM token
   */
  async registerToken(ctx) {
    try {
      const { fcmToken, deviceType = 'android' } = ctx.request.body;
      const userId = ctx.state.user.id;

      if (!fcmToken) {
        return ctx.badRequest('FCM token是必需的');
      }

      const pushNotificationService = strapi.service('api::push-notification.push-notification');
      const result = await pushNotificationService.registerUserToken(userId, fcmToken, deviceType);

      if (result.success) {
        return ctx.send({
          success: true,
          message: result.message,
        });
      } else {
        return ctx.badRequest(result.error);
      }
    } catch (error) {
      console.error('注册FCM token失败:', error);
      return ctx.internalServerError('注册FCM token失败');
    }
  },

  /**
   * 注销用户的FCM token
   */
  async unregisterToken(ctx) {
    try {
      const { fcmToken } = ctx.request.body;
      const userId = ctx.state.user.id;

      if (!fcmToken) {
        return ctx.badRequest('FCM token是必需的');
      }

      const pushNotificationService = strapi.service('api::push-notification.push-notification');
      const result = await pushNotificationService.unregisterUserToken(userId, fcmToken);

      if (result.success) {
        return ctx.send({
          success: true,
          message: result.message,
        });
      } else {
        return ctx.badRequest(result.error);
      }
    } catch (error) {
      console.error('注销FCM token失败:', error);
      return ctx.internalServerError('注销FCM token失败');
    }
  },

  /**
   * 获取用户的FCM tokens
   */
  async getUserTokens(ctx) {
    try {
      const userId = ctx.state.user.id;

      const tokens = await strapi.entityService.findMany('api::user-fcm-token.user-fcm-token' as any, {
        filters: { userId, isActive: true },
        fields: ['id', 'fcmToken', 'deviceType', 'createdAt'],
      });

      return ctx.send({
        success: true,
        data: tokens,
      });
    } catch (error) {
      console.error('获取用户FCM tokens失败:', error);
      return ctx.internalServerError('获取用户FCM tokens失败');
    }
  },
}); 