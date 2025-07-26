export default {
  type: 'content-api',
  routes: [
    // 公开测试路由
    {
      method: 'GET',
      path: '/qianbao-yues/health',
      handler: 'qianbao-yue.testConnection',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // 默认的CRUD路由
    {
      method: 'GET',
      path: '/qianbao-yues',
      handler: 'qianbao-yue.find',
      config: {
        auth: false,  // 临时允许公开访问用于测试
      },
    },
    {
      method: 'GET',
      path: '/qianbao-yues/:id',
      handler: 'qianbao-yue.findOne',
    },
    {
      method: 'POST',
      path: '/qianbao-yues',
      handler: 'qianbao-yue.create',
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
    // 自定义路由
    {
      method: 'GET',
      path: '/qianbao-yues/test',
      handler: 'qianbao-yue.testConnection',
      config: {
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
        auth: {
          scope: ['authenticated'],
        },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/qianbao-yues/update-wallet',
      handler: 'qianbao-yue.updateWallet',
      config: {
        auth: {
          scope: ['authenticated'],
        },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/qianbao-yues/recharge',
      handler: 'qianbao-yue.rechargeWallet',
      config: {
        auth: {
          scope: ['authenticated'],
        },
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 