import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::shop-product.shop-product' as any, ({ strapi }) => ({
  // 获取商品列表
  async find(ctx) {
    try {
      const { category, status, page = 1, pageSize = 20, search } = ctx.query;
      
      const filters: any = {};
      
      // 分类过滤
      if (category) {
        filters.category = category;
      }
      
      // 状态过滤
      if (status) {
        filters.status = status;
      } else {
        // 默认只显示上架商品
        filters.status = 'active';
      }

      // 搜索过滤
      if (search) {
        filters.$or = [
          {
            name: {
              $containsi: search
            }
          },
          {
            description: {
              $containsi: search
            }
          }
        ];
      }

      const result = await strapi.entityService.findPage('api::shop-product.shop-product' as any, {
        filters,
        sort: { createdAt: 'desc' },
        populate: ['images'],
        page,
        pageSize
      });

      ctx.body = {
        success: true,
        data: result,
        message: '获取商品列表成功'
      };
    } catch (error) {
      console.error('获取商品列表失败:', error);
      ctx.throw(500, `获取商品列表失败: ${error.message}`);
    }
  },

  // 获取商品详情
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.entityService.findOne('api::shop-product.shop-product' as any, id, {
        populate: ['images']
      });

      if (!result) {
        return ctx.notFound('商品不存在');
      }

      ctx.body = {
        success: true,
        data: result,
        message: '获取商品详情成功'
      };
    } catch (error) {
      console.error('获取商品详情失败:', error);
      ctx.throw(500, `获取商品详情失败: ${error.message}`);
    }
  },

  // 创建商品（管理员）
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      
      // 验证必填字段
      if (!data.name || !data.price || !data.stock) {
        return ctx.badRequest('商品名称、价格和库存为必填项');
      }

      // 验证价格格式
      if (isNaN(Number(data.price)) || Number(data.price) <= 0) {
        return ctx.badRequest('商品价格必须是大于0的数字');
      }

      // 验证库存格式
      if (isNaN(Number(data.stock)) || Number(data.stock) < 0) {
        return ctx.badRequest('商品库存必须是非负整数');
      }

      const result = await strapi.entityService.create('api::shop-product.shop-product' as any, {
        data: {
          ...data,
          status: data.status || 'active',
          isPhysical: data.isPhysical !== undefined ? data.isPhysical : true
        }
      });

      ctx.body = {
        success: true,
        data: result,
        message: '创建商品成功'
      };
    } catch (error) {
      console.error('创建商品失败:', error);
      ctx.throw(500, `创建商品失败: ${error.message}`);
    }
  },

  // 更新商品（管理员）
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;

      // 验证商品是否存在
      const existingProduct = await strapi.entityService.findOne('api::shop-product.shop-product' as any, id);
      if (!existingProduct) {
        return ctx.notFound('商品不存在');
      }

      // 验证价格格式
      if (data.price !== undefined && (isNaN(Number(data.price)) || Number(data.price) <= 0)) {
        return ctx.badRequest('商品价格必须是大于0的数字');
      }

      // 验证库存格式
      if (data.stock !== undefined && (isNaN(Number(data.stock)) || Number(data.stock) < 0)) {
        return ctx.badRequest('商品库存必须是非负整数');
      }

      const result = await strapi.entityService.update('api::shop-product.shop-product' as any, id, {
        data
      });

      ctx.body = {
        success: true,
        data: result,
        message: '更新商品成功'
      };
    } catch (error) {
      console.error('更新商品失败:', error);
      ctx.throw(500, `更新商品失败: ${error.message}`);
    }
  },

  // 删除商品（管理员）
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      
      // 验证商品是否存在
      const existingProduct = await strapi.entityService.findOne('api::shop-product.shop-product' as any, id);
      if (!existingProduct) {
        return ctx.notFound('商品不存在');
      }

      await strapi.entityService.delete('api::shop-product.shop-product' as any, id);

      ctx.body = {
        success: true,
        message: '删除商品成功'
      };
    } catch (error) {
      console.error('删除商品失败:', error);
      ctx.throw(500, `删除商品失败: ${error.message}`);
    }
  },

  // 获取商品分类
  async getCategories(ctx) {
    try {
      const products = await strapi.entityService.findMany('api::shop-product.shop-product' as any, {
        filters: { status: 'active' }
      }) as any[];

      // 提取所有分类并去重
      const categories = [...new Set(products.map((product: any) => product.category).filter(Boolean))];

      ctx.body = {
        success: true,
        data: categories,
        message: '获取商品分类成功'
      };
    } catch (error) {
      console.error('获取商品分类失败:', error);
      ctx.throw(500, `获取商品分类失败: ${error.message}`);
    }
  },

  // 更新商品库存
  async updateStock(ctx) {
    try {
      const { id } = ctx.params;
      const { stock } = ctx.request.body;

      if (stock === undefined || isNaN(Number(stock)) || Number(stock) < 0) {
        return ctx.badRequest('库存必须是非负整数');
      }

      const result = await strapi.entityService.update('api::shop-product.shop-product' as any, id, {
        data: { stock: Number(stock) } as any as any as any
      });

      ctx.body = {
        success: true,
        data: result,
        message: '更新商品库存成功'
      };
    } catch (error) {
      console.error('更新商品库存失败:', error);
      ctx.throw(500, `更新商品库存失败: ${error.message}`);
    }
  }
})); 