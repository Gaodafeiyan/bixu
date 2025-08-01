export default {
  routes: [
    {
      method: 'GET',
      path: '/lottery-groups',
      handler: 'lottery-group.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/lottery-groups/:id',
      handler: 'lottery-group.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/lottery-groups',
      handler: 'lottery-group.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/lottery-groups/:id',
      handler: 'lottery-group.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/lottery-groups/:id',
      handler: 'lottery-group.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 