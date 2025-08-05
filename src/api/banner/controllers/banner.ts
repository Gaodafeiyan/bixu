import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::banner.banner' as any, ({ strapi }) => ({
  // 获取活跃的banner列表
  async getActiveBanners(ctx) {
    try {
      const now = new Date();
      
      const banners = await strapi.entityService.findMany('api::banner.banner' as any, {
        filters: {
          isActive: true,
          $and: [
            {
              $or: [
                { startDate: { $lte: now } },
                { startDate: null }
              ]
            },
            {
              $or: [
                { endDate: { $gte: now } },
                { endDate: null }
              ]
            }
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
      
      const banner = await strapi.entityService.findOne('api::banner.banner' as any, id, {
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
  },

  // 创建banner
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      
      const banner = await strapi.entityService.create('api::banner.banner' as any, {
        data: {
          ...data,
          publishedAt: new Date()
        }
      });

      ctx.body = {
        success: true,
        data: banner
      };
    } catch (error) {
      console.error('创建banner失败:', error);
      ctx.throw(500, `创建banner失败: ${error.message}`);
    }
  },

  // 获取所有banner
  async find(ctx) {
    try {
      const banners = await strapi.entityService.findMany('api::banner.banner' as any, {
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

  // 更新banner
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;
      
      const banner = await strapi.entityService.update('api::banner.banner' as any, id, {
        data
      });

      ctx.body = {
        success: true,
        data: banner
      };
    } catch (error) {
      console.error('更新banner失败:', error);
      ctx.throw(500, `更新banner失败: ${error.message}`);
    }
  },

  // 删除banner
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      
      await strapi.entityService.delete('api::banner.banner' as any, id);

      ctx.body = {
        success: true,
        message: 'Banner删除成功'
      };
    } catch (error) {
      console.error('删除banner失败:', error);
      ctx.throw(500, `删除banner失败: ${error.message}`);
    }
  }
})); 