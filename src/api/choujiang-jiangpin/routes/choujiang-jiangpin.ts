export default {
  type: 'content-api',
  routes: [
    // 自定义路由 - 必须放在默认CRUD路由之前
    {
      method: 'GET',
      path: '/choujiang-jiangpins/available-prizes',
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
    
    // 默认的CRUD路由 - 放在自定义路由之后
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
  ],
}; 