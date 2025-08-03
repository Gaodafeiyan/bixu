import { Strapi } from '@strapi/strapi';

export default ({ strapi }: { strapi: Strapi }) => ({
  /**
   * 发送推送通知给指定用户
   */
  async sendToUser(ctx) {
    try {
      const { userId, title, body, data } = ctx.request.body;

      if (!userId || !title || !body) {
        return ctx.badRequest('userId, title, body是必需的');
      }

      const pushNotificationService = strapi.service('api::push-notification.push-notification');
      const result = await pushNotificationService.sendToUser(userId, title, body, data);

      return ctx.send(result);
    } catch (error) {
      console.error('发送推送通知失败:', error);
      return ctx.internalServerError('发送推送通知失败');
    }
  },

  /**
   * 发送推送通知给所有用户
   */
  async sendToAllUsers(ctx) {
    try {
      const { title, body, data } = ctx.request.body;

      if (!title || !body) {
        return ctx.badRequest('title, body是必需的');
      }

      const pushNotificationService = strapi.service('api::push-notification.push-notification');
      const result = await pushNotificationService.sendToAllUsers(title, body, data);

      return ctx.send(result);
    } catch (error) {
      console.error('群发推送通知失败:', error);
      return ctx.internalServerError('群发推送通知失败');
    }
  },

  /**
   * 发送系统公告推送
   */
  async sendSystemAnnouncement(ctx) {
    try {
      const { title, body, data } = ctx.request.body;

      if (!title || !body) {
        return ctx.badRequest('title, body是必需的');
      }

      // 获取所有开启了推送通知的用户
      const usersWithPushEnabled = await strapi.entityService.findMany('api::user-notification-settings.user-notification-settings' as any, {
        filters: { pushNotifications: true },
        populate: ['user'],
      });

      const pushNotificationService = strapi.service('api::push-notification.push-notification');
      let totalSuccess = 0;
      let totalFailure = 0;

      // 给每个开启了推送的用户发送通知
      for (const setting of usersWithPushEnabled) {
        if (setting.user) {
          const result = await pushNotificationService.sendToUser(setting.user.id, title, body, data);
          if (result.success) {
            totalSuccess += result.successCount || 0;
            totalFailure += result.failureCount || 0;
          }
        }
      }

      return ctx.send({
        success: true,
        message: '系统公告推送完成',
        totalSuccess,
        totalFailure,
      });
    } catch (error) {
      console.error('发送系统公告推送失败:', error);
      return ctx.internalServerError('发送系统公告推送失败');
    }
  },
}); 