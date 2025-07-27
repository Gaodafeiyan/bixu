export default {
  type: 'content-api',
  routes: [
    // 自定义路由
    {
      method: 'GET',
      path: '/dinggou-dingdans/user-orders',
      handler: 'dinggou-dingdan.getUserOrders',
      config: { 
        type: 'content-api',
        auth: {},  // 空对象表示需要登录
      },
    },
    {
      method: 'PUT',
      path: '/dinggou-dingdans/:orderId/status',
      handler: 'dinggou-dingdan.updateOrderStatus',
      config: {
        type: 'content-api',
        auth: {},  // 空对象表示需要登录
      },
    },
    {
      method: 'GET',
      path: '/dinggou-dingdans/:orderId/detail',
      handler: 'dinggou-dingdan.getOrderDetail',
      config: { 
        type: 'content-api',
        auth: {},  // 空对象表示需要登录
      },
    },
    // 标准CRUD路由
    {
      method: 'GET',
      path: '/dinggou-dingdans',
      handler: 'dinggou-dingdan.find',
    },
    {
      method: 'GET',
      path: '/dinggou-dingdans/:id',
      handler: 'dinggou-dingdan.findOne',
    },
    {
      method: 'POST',
      path: '/dinggou-dingdans',
      handler: 'dinggou-dingdan.create',
    },
    {
      method: 'PUT',
      path: '/dinggou-dingdans/:id',
      handler: 'dinggou-dingdan.update',
    },
    {
      method: 'DELETE',
      path: '/dinggou-dingdans/:id',
      handler: 'dinggou-dingdan.delete',
    },
  ],
}; 