export default {
  routes: [
    // 获取用户订单列表
    {
      method: 'GET',
      path: '/shop-orders',
      handler: 'shop-order.getUserOrders',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    // 获取订单详情
    {
      method: 'GET',
      path: '/shop-orders/:id',
      handler: 'shop-order.getOrderDetail',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    // 从购物车创建订单
    {
      method: 'POST',
      path: '/shop-orders/from-cart',
      handler: 'shop-order.createOrderFromCart',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    // 创建单个商品订单
    {
      method: 'POST',
      path: '/shop-orders/single',
      handler: 'shop-order.createSingleOrder',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    // 取消订单
    {
      method: 'PUT',
      path: '/shop-orders/:id/cancel',
      handler: 'shop-order.cancelOrder',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    // 确认收货
    {
      method: 'PUT',
      path: '/shop-orders/:id/confirm',
      handler: 'shop-order.confirmReceived',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    }
  ]
}; 