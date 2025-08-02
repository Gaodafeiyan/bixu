export default {
  routes: [
    // 获取用户订单列表
    {
      method: 'GET',
      path: '/shop-orders',
      handler: 'shop-order.getUserOrders',
      config: {
        auth: {}  // 空对象表示需要登录
      }
    },
    // 获取订单详情
    {
      method: 'GET',
      path: '/shop-orders/:id',
      handler: 'shop-order.getOrderDetail',
      config: {
        auth: {}  // 空对象表示需要登录
      }
    },
    // 从购物车创建订单
    {
      method: 'POST',
      path: '/shop-orders/from-cart',
      handler: 'shop-order.createOrderFromCart',
      config: {
        auth: {}  // 空对象表示需要登录
      }
    },
    // 创建单个商品订单
    {
      method: 'POST',
      path: '/shop-orders/single',
      handler: 'shop-order.createSingleOrder',
      config: {
        auth: {}  // 空对象表示需要登录
      }
    },
    // 取消订单
    {
      method: 'PUT',
      path: '/shop-orders/:id/cancel',
      handler: 'shop-order.cancelOrder',
      config: {
        auth: {}  // 空对象表示需要登录
      }
    },
    // 确认收货
    {
      method: 'PUT',
      path: '/shop-orders/:id/confirm',
      handler: 'shop-order.confirmReceived',
      config: {
        auth: {}  // 空对象表示需要登录
      }
    }
  ]
}; 