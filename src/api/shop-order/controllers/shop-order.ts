import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreController('api::shop-order.shop-order' as any, ({ strapi }) => ({
  // 获取用户订单列表
  async getUserOrders(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { status, page = 1, pageSize = 20 } = ctx.query;

      if (!userId) {
        return ctx.unauthorized('用户未认证');
      }

      const filters: any = { user: { id: userId } };
      if (status) {
        filters.status = status;
      }

      const result = await strapi.entityService.findPage('api::shop-order.shop-order' as any, {
        filters,
        sort: { createdAt: 'desc' },
        populate: ['product', 'product.images'],
        page,
        pageSize
      });

      ctx.body = {
        success: true,
        data: result,
        message: '获取订单列表成功'
      };
    } catch (error) {
      console.error('获取订单列表失败:', error);
      ctx.throw(500, `获取订单列表失败: ${error.message}`);
    }
  },

  // 获取订单详情
  async getOrderDetail(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { id } = ctx.params;

      if (!userId) {
        return ctx.unauthorized('用户未认证');
      }

      const order = await strapi.entityService.findOne('api::shop-order.shop-order' as any, id, {
        populate: ['product', 'product.images', 'user']
      }) as any;

      if (!order) {
        return ctx.notFound('订单不存在');
      }

      if (order.user?.id !== userId) {
        return ctx.forbidden('无权查看此订单');
      }

      ctx.body = {
        success: true,
        data: order,
        message: '获取订单详情成功'
      };
    } catch (error) {
      console.error('获取订单详情失败:', error);
      ctx.throw(500, `获取订单详情失败: ${error.message}`);
    }
  },

  // 创建订单（从购物车）
  async createOrderFromCart(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { cartItemIds, shippingAddress } = ctx.request.body;

      if (!userId) {
        return ctx.unauthorized('用户未认证');
      }

      if (!cartItemIds || !Array.isArray(cartItemIds) || cartItemIds.length === 0) {
        return ctx.badRequest('请选择要购买的商品');
      }

      if (!shippingAddress) {
        return ctx.badRequest('收货地址为必填项');
      }

      // 获取用户钱包
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: { id: userId } }
      });

      let userWallet = wallets && wallets.length > 0 ? wallets[0] : null;
      if (!userWallet) {
        return ctx.badRequest('用户钱包不存在');
      }

      // 获取购物车商品
      const cartItems = await strapi.entityService.findMany('api::shop-cart.shop-cart' as any, {
        filters: {
          id: { $in: cartItemIds },
          user: { id: userId }
        },
        populate: ['product']
      }) as any[];

      if (cartItems.length === 0) {
        return ctx.badRequest('购物车商品不存在');
      }

      // 计算总金额和验证库存
      let totalAmount = new Decimal(0);
      const orderItems = [];

      for (const cartItem of cartItems) {
        const product = cartItem.product;
        
        // 验证商品状态
        if (product.status !== 'active') {
          return ctx.badRequest(`商品 ${product.name} 已下架`);
        }

        // 验证库存
        if (product.stock < cartItem.quantity) {
          return ctx.badRequest(`商品 ${product.name} 库存不足`);
        }

        const itemTotal = new Decimal(product.price).mul(cartItem.quantity);
        totalAmount = totalAmount.plus(itemTotal);

        orderItems.push({
          product: product,
          quantity: cartItem.quantity,
          price: product.price,
          total: itemTotal.toString()
        });
      }

      // 验证用户余额
      const userBalance = new Decimal(userWallet.usdtYue || 0);
      if (userBalance.lessThan(totalAmount)) {
        return ctx.badRequest('USDT余额不足');
      }

      // 创建订单
      const orderNumber = `SO${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      const order = await strapi.entityService.create('api::shop-order.shop-order' as any, {
        data: {
          orderNumber,
          user: userId,
          product: orderItems[0].product.id, // 暂时只支持单个商品，后续可扩展
          quantity: orderItems[0].quantity,
          totalAmount: totalAmount.toString(),
          status: 'pending',
          paymentMethod: 'usdt',
          shippingAddress,
          productPrice: orderItems[0].price,
          productName: orderItems[0].product.name
        }
      });

      // 扣除用户USDT余额
      const newBalance = userBalance.sub(totalAmount);
      await strapi.entityService.update('api::qianbao-yue.qianbao-yue', userWallet.id, {
        data: { usdtYue: newBalance.toString() }
      });

      // 减少商品库存
      for (const item of orderItems) {
        const newStock = item.product.stock - item.quantity;
        await strapi.entityService.update('api::shop-product.shop-product' as any, item.product.id, {
          data: { stock: newStock }
        });
      }

      // 删除购物车商品
      for (const cartItem of cartItems) {
        await strapi.entityService.delete('api::shop-cart.shop-cart' as any, cartItem.id);
      }

      // 如果是实物商品，创建发货订单
      if (orderItems[0].product.isPhysical) {
        await strapi.service('shipping-service' as any).createShippingOrderFromShopOrder(order.id);
      }

      ctx.body = {
        success: true,
        data: order,
        message: '创建订单成功'
      };
    } catch (error) {
      console.error('创建订单失败:', error);
      ctx.throw(500, `创建订单失败: ${error.message}`);
    }
  },

  // 创建单个商品订单
  async createSingleOrder(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { productId, quantity = 1, shippingAddress } = ctx.request.body;

      if (!userId) {
        return ctx.unauthorized('用户未认证');
      }

      if (!productId || !shippingAddress) {
        return ctx.badRequest('商品ID和收货地址为必填项');
      }

      if (quantity <= 0) {
        return ctx.badRequest('商品数量必须大于0');
      }

      // 获取商品信息
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

      // 获取用户钱包
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: { id: userId } }
      });

      let userWallet = wallets && wallets.length > 0 ? wallets[0] : null;
      if (!userWallet) {
        return ctx.badRequest('用户钱包不存在');
      }

      // 计算总金额
      const totalAmount = new Decimal(product.price).mul(quantity);

      // 验证用户余额
      const userBalance = new Decimal(userWallet.usdtYue || 0);
      if (userBalance.lessThan(totalAmount)) {
        return ctx.badRequest('USDT余额不足');
      }

      // 创建订单
      const orderNumber = `SO${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      const order = await strapi.entityService.create('api::shop-order.shop-order' as any, {
        data: {
          orderNumber,
          user: userId,
          product: productId,
          quantity,
          totalAmount: totalAmount.toString(),
          status: 'pending',
          paymentMethod: 'usdt',
          shippingAddress,
          productPrice: product.price,
          productName: product.name
        }
      });

      // 扣除用户USDT余额
      const newBalance = userBalance.sub(totalAmount);
      await strapi.entityService.update('api::qianbao-yue.qianbao-yue', userWallet.id, {
        data: { usdtYue: newBalance.toString() }
      });

      // 减少商品库存
      const newStock = product.stock - quantity;
      await strapi.entityService.update('api::shop-product.shop-product' as any, productId, {
        data: { stock: newStock }
      });

      // 如果是实物商品，创建发货订单
      if (product.isPhysical) {
        await strapi.service('shipping-service' as any).createShippingOrderFromShopOrder(order.id);
      }

      ctx.body = {
        success: true,
        data: order,
        message: '创建订单成功'
      };
    } catch (error) {
      console.error('创建订单失败:', error);
      ctx.throw(500, `创建订单失败: ${error.message}`);
    }
  },

  // 取消订单
  async cancelOrder(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { id } = ctx.params;

      if (!userId) {
        return ctx.unauthorized('用户未认证');
      }

      const order = await strapi.entityService.findOne('api::shop-order.shop-order' as any, id, {
        populate: ['product']
      }) as any;

      if (!order) {
        return ctx.notFound('订单不存在');
      }

      if (order.user?.id !== userId) {
        return ctx.forbidden('无权操作此订单');
      }

      if (order.status !== 'pending') {
        return ctx.badRequest('只能取消待支付的订单');
      }

      // 更新订单状态
      await strapi.entityService.update('api::shop-order.shop-order' as any, id, {
        data: { status: 'cancelled' }
      });

      // 退还USDT余额
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: { id: userId } }
      });

      if (wallets && wallets.length > 0) {
        const userWallet = wallets[0];
        const currentBalance = new Decimal(userWallet.usdtYue || 0);
        const refundAmount = new Decimal(order.totalAmount);
        const newBalance = currentBalance.plus(refundAmount);

        await strapi.entityService.update('api::qianbao-yue.qianbao-yue', userWallet.id, {
          data: { usdtYue: newBalance.toString() }
        });
      }

      // 恢复商品库存
      const newStock = order.product?.stock + order.quantity;
      await strapi.entityService.update('api::shop-product.shop-product' as any, order.product?.id, {
        data: { stock: newStock }
      });

      ctx.body = {
        success: true,
        message: '取消订单成功'
      };
    } catch (error) {
      console.error('取消订单失败:', error);
      ctx.throw(500, `取消订单失败: ${error.message}`);
    }
  },

  // 确认收货
  async confirmReceived(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { id } = ctx.params;

      if (!userId) {
        return ctx.unauthorized('用户未认证');
      }

      const order = await strapi.entityService.findOne('api::shop-order.shop-order' as any, id) as any;

      if (!order) {
        return ctx.notFound('订单不存在');
      }

      if (order.user?.id !== userId) {
        return ctx.forbidden('无权操作此订单');
      }

      if (order.status !== 'shipped') {
        return ctx.badRequest('只能确认已发货的订单');
      }

      // 更新订单状态
      await strapi.entityService.update('api::shop-order.shop-order' as any, id, {
        data: { status: 'delivered' }
      });

      ctx.body = {
        success: true,
        message: '确认收货成功'
      };
    } catch (error) {
      console.error('确认收货失败:', error);
      ctx.throw(500, `确认收货失败: ${error.message}`);
    }
  }
})); 