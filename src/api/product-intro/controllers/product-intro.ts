import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::product-intro.product-intro' as any, ({ strapi }) => ({
  // 获取活跃的产品介绍列表
  async getActiveProducts(ctx) {
    try {
      const products = await strapi.entityService.findMany('api::product-intro.product-intro' as any, {
        filters: {
          isActive: true
        },
        populate: ['mainImage', 'gallery'],
        sort: { order: 'asc', createdAt: 'desc' }
      });

      ctx.body = {
        success: true,
        data: products
      };
    } catch (error) {
      console.error('获取产品介绍列表失败:', error);
      ctx.throw(500, `获取产品介绍列表失败: ${error.message}`);
    }
  },

  // 获取产品介绍详情
  async getProductDetail(ctx) {
    try {
      const { id } = ctx.params;
      
      const product = await strapi.entityService.findOne('api::product-intro.product-intro' as any, id, {
        populate: ['mainImage', 'gallery', 'ingredients', 'benefits']
      });

      if (!product) {
        return ctx.notFound('产品介绍不存在');
      }

      ctx.body = {
        success: true,
        data: product
      };
    } catch (error) {
      console.error('获取产品介绍详情失败:', error);
      ctx.throw(500, `获取产品介绍详情失败: ${error.message}`);
    }
  },

  // 根据产品名称获取详情
  async getProductByName(ctx) {
    try {
      const { name } = ctx.params;
      
      const products = await strapi.entityService.findMany('api::product-intro.product-intro' as any, {
        filters: {
          productName: { $contains: name },
          isActive: true
        },
        populate: ['mainImage', 'gallery', 'ingredients', 'benefits'],
        limit: 1
      });

      if (!products || (Array.isArray(products) && products.length === 0)) {
        return ctx.notFound('产品介绍不存在');
      }

      ctx.body = {
        success: true,
        data: Array.isArray(products) ? products[0] : products
      };
    } catch (error) {
      console.error('根据名称获取产品介绍失败:', error);
      ctx.throw(500, `根据名称获取产品介绍失败: ${error.message}`);
    }
  }
})); 