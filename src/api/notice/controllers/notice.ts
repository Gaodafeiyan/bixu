import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::notice.notice' as any, ({ strapi }) => ({
  // 获取活跃的公告列表
  async findActive(ctx) {
    try {
      const notices = await strapi.entityService.findMany('api::notice.notice' as any, {
        filters: {
          isActive: true,
          publishedAt: { $notNull: true }
        },
        sort: { priority: 'desc', createdAt: 'desc' },
        populate: '*'
      }) as any[];

      ctx.body = {
        success: true,
        data: notices
      };
    } catch (error) {
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  // 获取公告详情
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const entity = await strapi.entityService.findOne('api::notice.notice' as any, id, {
        populate: '*'
      });

      if (!entity) {
        return ctx.notFound('Notice not found');
      }

      ctx.body = {
        success: true,
        data: entity
      };
    } catch (error) {
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }
}));