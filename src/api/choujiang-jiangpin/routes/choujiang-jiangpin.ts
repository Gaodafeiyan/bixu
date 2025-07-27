export default {
  type: 'content-api',
  routes: [
    // 默认的CRUD路由
    {
      method: 'GET',
      path: '/choujiang-jiangpins',
      handler: 'choujiang-jiangpin.find',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/choujiang-jiangpins/:id',
      handler: 'choujiang-jiangpin.findOne',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/choujiang-jiangpins',
      handler: 'choujiang-jiangpin.create',
    },
    {
      method: 'PUT',
      path: '/choujiang-jiangpins/:id',
      handler: 'choujiang-jiangpin.update',
    },
    {
      method: 'DELETE',
      path: '/choujiang-jiangpins/:id',
      handler: 'choujiang-jiangpin.delete',
    },
    
    // 自定义路由
    {
      method: 'GET',
      path: '/choujiang-jiangpins/available',
      handler: 'choujiang-jiangpin.getAvailablePrizes',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/choujiang-jiangpins/stats',
      handler: 'choujiang-jiangpin.getPrizeStats',
      config: {
        auth: {
          scope: ['admin::is-authenticated'],
        },
      },
    },
    {
      method: 'PUT',
      path: '/choujiang-jiangpins/:id/quantity',
      handler: 'choujiang-jiangpin.updatePrizeQuantity',
      config: {
        auth: {
          scope: ['admin::is-authenticated'],
        },
      },
    },
  ],
}; 