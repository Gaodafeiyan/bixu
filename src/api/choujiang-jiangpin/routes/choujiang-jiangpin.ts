import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::choujiang-jiangpin.choujiang-jiangpin', {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
  only: ['find', 'findOne', 'create', 'update', 'delete'],
  except: [],
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
}); 