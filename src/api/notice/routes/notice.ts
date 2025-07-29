export default {
  routes: [
    {
      method: 'GET',
      path: '/api/notices',
      handler: 'notice.findActive',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/api/notices/:id',
      handler: 'notice.findOne',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};