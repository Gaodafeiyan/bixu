import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::notice.notice', ({ strapi }) => ({
  // 获取活跃的公告列表
  async findActive(ctx) {
    try {
      const { data, meta } = await strapi.entityService.findMany('api::notice.notice', {
        filters: {
          isActive: true,
          publishedAt: { $notNull: true }
        },
        sort: { priority: 'desc', createdAt: 'desc' },
        populate: '*'
      });

      ctx.body = {
        success: true,
        data: data
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
      const entity = await strapi.entityService.findOne('api::notice.notice', id, {
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