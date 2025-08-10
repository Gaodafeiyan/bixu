import { Strapi } from '@strapi/strapi';

export default ({ strapi }: { strapi: Strapi }) => ({
  /**
   * 注册用户的推送token - 幂等实现
   */
  async register(ctx) {
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

      // 检查是否已存在相同的token
      const existingToken = await strapi.entityService.findMany('api::user-push-token.user-push-token' as any, {
        filters: { 
          userId: userId,
          pushToken: pushToken,
          serviceType: serviceType
        },
        fields: ['id'],
        limit: 1
      }) as any[];

      // 如果已存在，直接返回成功
      if (existingToken && existingToken.length > 0) {
        return ctx.send({
          success: true,
          message: 'Token已存在',
          id: existingToken[0].id
        });
      }

      // 如果不存在，创建新的token记录
      const created = await strapi.entityService.create('api::user-push-token.user-push-token' as any, {
        data: {
          userId,
          pushToken,
          serviceType,
          deviceType,
          isActive: true
        }
      });

      return ctx.send({
        success: true,
        message: 'Token注册成功',
        id: created.id
      });
    } catch (error) {
      console.error('注册推送token失败:', error);
      return ctx.internalServerError('注册推送token失败');
    }
  },

  /**
   * 注销用户的推送token
   */
  async unregister(ctx) {
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

      // 查找并删除token
      const existingToken = await strapi.entityService.findMany('api::user-push-token.user-push-token' as any, {
        filters: { 
          userId: userId,
          pushToken: pushToken,
          serviceType: serviceType
        },
        fields: ['id'],
        limit: 1
      }) as any[];

      if (existingToken && existingToken.length > 0) {
        await strapi.entityService.delete('api::user-push-token.user-push-token' as any, existingToken[0].id);
      }

      return ctx.send({
        success: true,
        message: 'Token注销成功',
      });
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

      const tokens = await strapi.entityService.findMany('api::user-push-token.user-push-token' as any, {
        filters: { userId: userId },
        fields: ['id', 'pushToken', 'serviceType', 'deviceType', 'isActive', 'createdAt']
      });

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
