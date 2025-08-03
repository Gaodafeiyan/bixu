export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/lottery-groups',
      handler: 'lottery-group.find',
      config: {
        type: 'content-api',
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/lottery-groups/:id',
      handler: 'lottery-group.findOne',
      config: {
        type: 'content-api',
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/lottery-groups',
      handler: 'lottery-group.create',
      config: {
        type: 'content-api',
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/lottery-groups/:id',
      handler: 'lottery-group.update',
      config: {
        type: 'content-api',
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/lottery-groups/:id',
      handler: 'lottery-group.delete',
      config: {
        type: 'content-api',
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 