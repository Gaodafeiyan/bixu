import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreController('api::shop-cart.shop-cart' as any, ({ strapi }) => ({
  // 获取用户购物车
  async getUserCart(ctx) {
    try {
      const userId = ctx.state.user?.id;
      
      if (!userId) {
        console.log('用户未认证，返回401');
        return ctx.unauthorized('用户未认证');
      }

      console.log(`获取用户购物车 - 用户ID: ${userId}`);

      const cartItems = await strapi.entityService.findMany('api::shop-cart.shop-cart' as any, {
        filters: { user: { id: userId } },
        populate: ['product', 'product.images']
      }) as any[];

      console.log(`找到 ${cartItems?.length || 0} 个购物车商品`);

      ctx.body = {
        success: true,
        data: cartItems,
        message: '获取购物车成功'
      };
    } catch (error) {
      console.error('获取购物车失败:', error);
      ctx.throw(500, `获取购物车失败: ${error.message}`);
    }
  },

  // 添加商品到购物车
  async addToCart(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { productId, quantity = 1 } = ctx.request.body;

      if (!userId) {
        return ctx.unauthorized('用户未认证');
      }

      if (!productId) {
        return ctx.badRequest('商品ID为必填项');
      }

      if (quantity <= 0) {
        return ctx.badRequest('商品数量必须大于0');
      }

      // 验证商品是否存在且上架
      const product = await strapi.entityService.findOne('api::shop-product.shop-product' as any, productId);
      if (!product) {
        return ctx.badRequest('商品不存在');
      }

      if (product.status !== 'active') {
        return ctx.badRequest('商品已下架');
      }

      if (product.stock < quantity) {
        return ctx.badRequest('商品库存不足');
      }

      // 检查购物车是否已有该商品
      const existingCartItem = await strapi.entityService.findMany('api::shop-cart.shop-cart' as any, {
        filters: {
          user: { id: userId },
          product: { id: productId }
        }
      });

      let result;
      if (existingCartItem && existingCartItem.length > 0) {
        // 更新现有购物车商品数量
        const cartItem = existingCartItem[0] as any;
        const newQuantity = cartItem.quantity + quantity;
        
        if (product.stock < newQuantity) {
          return ctx.badRequest('商品库存不足');
        }

        result = await strapi.entityService.update('api::shop-cart.shop-cart' as any, cartItem.id, {
          data: { quantity: newQuantity }
        });
      } else {
        // 创建新的购物车商品
        result = await strapi.entityService.create('api::shop-cart.shop-cart' as any, {
          data: {
            user: userId,
            product: productId,
            quantity
          }
        });
      }

      ctx.body = {
        success: true,
        data: result,
        message: '添加到购物车成功'
      };
    } catch (error) {
      console.error('添加到购物车失败:', error);
      ctx.throw(500, `添加到购物车失败: ${error.message}`);
    }
  },

  // 更新购物车商品数量
  async updateCartItem(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { id } = ctx.params;
      const { quantity } = ctx.request.body;

      if (!userId) {
        return ctx.unauthorized('用户未认证');
      }

      if (quantity <= 0) {
        return ctx.badRequest('商品数量必须大于0');
      }

      // 验证购物车商品是否存在且属于当前用户
      const cartItem = await strapi.entityService.findOne('api::shop-cart.shop-cart' as any, id, {
        populate: ['product', 'user']
      }) as any;

      if (!cartItem) {
        return ctx.notFound('购物车商品不存在');
      }

      // 修复权限检查，确保ID类型一致
      if (cartItem.user?.id?.toString() !== userId?.toString()) {
        console.log(`权限检查失败 - 购物车用户ID: ${cartItem.user?.id}, 当前用户ID: ${userId}`);
        return ctx.forbidden('无权操作此购物车商品');
      }

      // 验证库存
      if (cartItem.product?.stock < quantity) {
        return ctx.badRequest('商品库存不足');
      }

      const result = await strapi.entityService.update('api::shop-cart.shop-cart' as any, id, {
        data: { quantity }
      });

      ctx.body = {
        success: true,
        data: result,
        message: '更新购物车成功'
      };
    } catch (error) {
      console.error('更新购物车失败:', error);
      ctx.throw(500, `更新购物车失败: ${error.message}`);
    }
  },

  // 删除购物车商品
  async removeFromCart(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { id } = ctx.params;

      if (!userId) {
        return ctx.unauthorized('用户未认证');
      }

      // 验证购物车商品是否存在且属于当前用户
      const cartItem = await strapi.entityService.findOne('api::shop-cart.shop-cart' as any, id, {
        populate: ['user']
      }) as any;

      if (!cartItem) {
        return ctx.notFound('购物车商品不存在');
      }

      // 修复权限检查，确保ID类型一致
      if (cartItem.user?.id?.toString() !== userId?.toString()) {
        console.log(`权限检查失败 - 购物车用户ID: ${cartItem.user?.id}, 当前用户ID: ${userId}`);
        return ctx.forbidden('无权操作此购物车商品');
      }

      await strapi.entityService.delete('api::shop-cart.shop-cart' as any, id);

      ctx.body = {
        success: true,
        message: '删除购物车商品成功'
      };
    } catch (error) {
      console.error('删除购物车商品失败:', error);
      ctx.throw(500, `删除购物车商品失败: ${error.message}`);
    }
  },

  // 清空购物车
  async clearCart(ctx) {
    try {
      const userId = ctx.state.user.id;

      if (!userId) {
        return ctx.unauthorized('用户未认证');
      }

      // 获取用户所有购物车商品
      const cartItems = await strapi.entityService.findMany('api::shop-cart.shop-cart' as any, {
        filters: { user: { id: userId } }
      }) as any[];

      // 批量删除
      for (const item of cartItems) {
        await strapi.entityService.delete('api::shop-cart.shop-cart' as any, item.id);
      }

      ctx.body = {
        success: true,
        message: '清空购物车成功'
      };
    } catch (error) {
      console.error('清空购物车失败:', error);
      ctx.throw(500, `清空购物车失败: ${error.message}`);
    }
  },

  // 获取购物车商品总数
  async getCartCount(ctx) {
    try {
      const userId = ctx.state.user.id;

      if (!userId) {
        return ctx.unauthorized('用户未认证');
      }

      const cartItems = await strapi.entityService.findMany('api::shop-cart.shop-cart' as any, {
        filters: { user: { id: userId } }
      }) as any[];

      const totalCount = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

      ctx.body = {
        success: true,
        data: { count: totalCount },
        message: '获取购物车商品总数成功'
      };
    } catch (error) {
      console.error('获取购物车商品总数失败:', error);
      ctx.throw(500, `获取购物车商品总数失败: ${error.message}`);
    }
  }
})); 