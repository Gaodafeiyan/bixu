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
  },

  // 创建产品介绍
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      
      const product = await strapi.entityService.create('api::product-intro.product-intro' as any, {
        data: {
          ...data,
          publishedAt: new Date()
        }
      });

      ctx.body = {
        success: true,
        data: product
      };
    } catch (error) {
      console.error('创建产品介绍失败:', error);
      ctx.throw(500, `创建产品介绍失败: ${error.message}`);
    }
  },

  // 获取所有产品介绍
  async find(ctx) {
    try {
      const products = await strapi.entityService.findMany('api::product-intro.product-intro' as any, {
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

  // 更新产品介绍
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;
      
      const product = await strapi.entityService.update('api::product-intro.product-intro' as any, id, {
        data
      });

      ctx.body = {
        success: true,
        data: product
      };
    } catch (error) {
      console.error('更新产品介绍失败:', error);
      ctx.throw(500, `更新产品介绍失败: ${error.message}`);
    }
  },

  // 删除产品介绍
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      
      await strapi.entityService.delete('api::product-intro.product-intro' as any, id);

      ctx.body = {
        success: true,
        message: '产品介绍删除成功'
      };
    } catch (error) {
      console.error('删除产品介绍失败:', error);
      ctx.throw(500, `删除产品介绍失败: ${error.message}`);
    }
  }
})); 