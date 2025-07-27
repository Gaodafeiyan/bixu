import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::choujiang-jihui.choujiang-jihui', {
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
      method: 'POST',
      path: '/choujiang-jihuis/give-chance',
      handler: 'choujiang-jihui.giveChance',
      config: {
        auth: {
          scope: ['admin::is-authenticated'],
        },
      },
    },
    {
      method: 'GET',
      path: '/choujiang-jihuis/my-chances',
      handler: 'choujiang-jihui.getUserChances',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'POST',
      path: '/choujiang-jihuis/draw',
      handler: 'choujiang-jihui.draw',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
  ],
}); 