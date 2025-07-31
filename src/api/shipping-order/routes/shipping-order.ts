export default {
  type: 'content-api',
  routes: [
    // 自定义路由 - 必须放在默认CRUD路由之前
    {
      method: 'GET',
      path: '/shipping-orders/stats',
      handler: 'shipping-order.getShippingStats',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    {
      method: 'POST',
      path: '/shipping-orders/batch-ship',
      handler: 'shipping-order.batchShip',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    {
      method: 'GET',
      path: '/shipping-orders/export',
      handler: 'shipping-order.exportOrders',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    {
      method: 'PUT',
      path: '/shipping-orders/:id/address',
      handler: 'shipping-order.updateAddress',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    {
      method: 'POST',
      path: '/shipping-orders/:id/manual-ship',
      handler: 'shipping-order.manualShip',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    {
      method: 'GET',
      path: '/shipping-orders/pending',
      handler: 'shipping-order.getPendingOrders',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    
    // 默认的CRUD路由 - 放在自定义路由之后
    {
      method: 'GET',
      path: '/shipping-orders',
      handler: 'shipping-order.find',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    {
      method: 'GET',
      path: '/shipping-orders/:id',
      handler: 'shipping-order.findOne',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    {
      method: 'POST',
      path: '/shipping-orders',
      handler: 'shipping-order.create',
    },
    {
      method: 'PUT',
      path: '/shipping-orders/:id',
      handler: 'shipping-order.update',
    },
    {
      method: 'DELETE',
      path: '/shipping-orders/:id',
      handler: 'shipping-order.delete',
    },
  ],
}; 