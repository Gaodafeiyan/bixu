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
} as any); 