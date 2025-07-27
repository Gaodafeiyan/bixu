export default {
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
}; 