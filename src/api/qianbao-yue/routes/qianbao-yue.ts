export default {
  type: 'content-api',
  routes: [
    // 公开测试路由
    {
      method: 'GET',
      path: '/qianbao-yues/health',
      handler: 'qianbao-yue.testConnection',
      config: {
        type: 'content-api',
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // 自定义路由 - 必须放在默认CRUD路由之前
    {
      method: 'GET',
      path: '/qianbao-yues/test',
      handler: 'qianbao-yue.testConnection',
      config: {
        type: 'content-api',
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/qianbao-yues/user-wallet',
      handler: 'qianbao-yue.getUserWallet',
      config: {
        type: 'content-api',
        auth: {},  // 空对象表示需要登录
      },
    },
    {
      method: 'PUT',
      path: '/qianbao-yues/update-wallet',
      handler: 'qianbao-yue.updateWallet',
      config: {
        type: 'content-api',
        auth: {},  // 空对象表示需要登录
      },
    },
    {
      method: 'POST',
      path: '/qianbao-yues/recharge',
      handler: 'qianbao-yue.rechargeWallet',
      config: {
        type: 'content-api',
        auth: {},  // 空对象表示需要登录
      },
    },
    // 默认的CRUD路由 - 放在自定义路由之后
    {
      method: 'GET',
      path: '/qianbao-yues',
      handler: 'qianbao-yue.find',
      config: {
        auth: false,  // 临时允许公开访问用于测试
      },
    },
    {
      method: 'POST',
      path: '/qianbao-yues',
      handler: 'qianbao-yue.create',
    },
    {
      method: 'GET',
      path: '/qianbao-yues/:id',
      handler: 'qianbao-yue.findOne',
    },
    {
      method: 'PUT',
      path: '/qianbao-yues/:id',
      handler: 'qianbao-yue.update',
    },
    {
      method: 'DELETE',
      path: '/qianbao-yues/:id',
      handler: 'qianbao-yue.delete',
    },
  ],
}; 