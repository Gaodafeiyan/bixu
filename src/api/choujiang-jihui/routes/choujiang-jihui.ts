export default {
  type: 'content-api',
  routes: [
    // 默认的CRUD路由
    {
      method: 'GET',
      path: '/choujiang-jihuis',
      handler: 'choujiang-jihui.find',
      config: {
        auth: {
          scope: ['admin::is-authenticated'],
        },
      },
    },
    {
      method: 'GET',
      path: '/choujiang-jihuis/:id',
      handler: 'choujiang-jihui.findOne',
      config: {
        auth: {
          scope: ['admin::is-authenticated'],
        },
      },
    },
    {
      method: 'POST',
      path: '/choujiang-jihuis',
      handler: 'choujiang-jihui.create',
    },
    {
      method: 'PUT',
      path: '/choujiang-jihuis/:id',
      handler: 'choujiang-jihui.update',
    },
    {
      method: 'DELETE',
      path: '/choujiang-jihuis/:id',
      handler: 'choujiang-jihui.delete',
    },
    
    // 自定义路由
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