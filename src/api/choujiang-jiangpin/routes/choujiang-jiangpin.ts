import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::choujiang-jiangpin.choujiang-jiangpin' as any, {
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
} as any); 