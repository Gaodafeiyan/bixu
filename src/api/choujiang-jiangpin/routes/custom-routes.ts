export default {
  routes: [
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