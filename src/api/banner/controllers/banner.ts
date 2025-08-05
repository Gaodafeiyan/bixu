import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::banner.banner', ({ strapi }) => ({
  // 获取活跃的banner列表
  async getActiveBanners(ctx) {
    try {
      const now = new Date();
      
      const banners = await strapi.entityService.findMany('api::banner.banner', {
        filters: {
          isActive: true,
          $or: [
            { startDate: { $lte: now } },
            { startDate: null }
          ],
          $or: [
            { endDate: { $gte: now } },
            { endDate: null }
          ]
        },
        populate: ['image'],
        sort: { order: 'asc', createdAt: 'desc' }
      });

      ctx.body = {
        success: true,
        data: banners
      };
    } catch (error) {
      console.error('获取banner列表失败:', error);
      ctx.throw(500, `获取banner列表失败: ${error.message}`);
    }
  },

  // 获取banner详情
  async getBannerDetail(ctx) {
    try {
      const { id } = ctx.params;
      
      const banner = await strapi.entityService.findOne('api::banner.banner', id, {
        populate: ['image']
      });

      if (!banner) {
        return ctx.notFound('Banner不存在');
      }

      ctx.body = {
        success: true,
        data: banner
      };
    } catch (error) {
      console.error('获取banner详情失败:', error);
      ctx.throw(500, `获取banner详情失败: ${error.message}`);
    }
  }
})); 