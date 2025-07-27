import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::choujiang-ji-lu.choujiang-ji-lu' as any, {
  config: {
    find: {
      auth: {
        scope: ['admin::is-authenticated'],
      },
    },
    findOne: {
      auth: {
        scope: ['admin::is-authenticated'],
      },
    },
  },
  only: ['find', 'findOne', 'create', 'update', 'delete'],
  except: [],
  routes: [
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
  ],
}); 