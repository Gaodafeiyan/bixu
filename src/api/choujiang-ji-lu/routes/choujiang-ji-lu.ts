export default {
  type: 'content-api',
  routes: [
    // 自定义路由 - 必须放在默认CRUD路由之前
    {
      method: 'GET',
      path: '/choujiang-ji-lus/my-history',
      handler: 'choujiang-ji-lu.getUserHistory',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'GET',
      path: '/choujiang-ji-lus/stats',
      handler: 'choujiang-ji-lu.getDrawStats',
      config: {
        auth: {
          scope: ['admin::is-authenticated'],
        },
      },
    },
    
    // 默认的CRUD路由 - 放在自定义路由之后
    {
      method: 'GET',
      path: '/choujiang-ji-lus',
      handler: 'choujiang-ji-lu.find',
      config: {
        auth: {
          scope: ['admin::is-authenticated'],
        },
      },
    },
    {
      method: 'GET',
      path: '/choujiang-ji-lus/:id',
      handler: 'choujiang-ji-lu.findOne',
      config: {
        auth: {
          scope: ['admin::is-authenticated'],
        },
      },
    },
    {
      method: 'POST',
      path: '/choujiang-ji-lus',
      handler: 'choujiang-ji-lu.create',
    },
    {
      method: 'PUT',
      path: '/choujiang-ji-lus/:id',
      handler: 'choujiang-ji-lu.update',
    },
    {
      method: 'DELETE',
      path: '/choujiang-ji-lus/:id',
      handler: 'choujiang-ji-lu.delete',
    },
  ],
}; 