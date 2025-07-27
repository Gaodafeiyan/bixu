export default {
  type: 'content-api',
  routes: [
    // 自定义路由 - 必须放在默认CRUD路由之前
    {
      method: 'POST',
      path: '/choujiang-jihuis/give-chance',
      handler: 'choujiang-jihui.giveChance',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    {
      method: 'GET',
      path: '/choujiang-jihuis/my-chances',
      handler: 'choujiang-jihui.getUserChances',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    {
      method: 'POST',
      path: '/choujiang-jihuis/draw',
      handler: 'choujiang-jihui.draw',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    
    // 默认的CRUD路由 - 放在自定义路由之后
    {
      method: 'GET',
      path: '/choujiang-jihuis',
      handler: 'choujiang-jihui.find',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    {
      method: 'GET',
      path: '/choujiang-jihuis/:id',
      handler: 'choujiang-jihui.findOne',
      config: {
        auth: {},  // 空对象表示需要登录
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
  ],
}; 