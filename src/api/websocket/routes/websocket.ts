export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/websocket',
      handler: 'websocket.handleConnection',
      config: {
        auth: {
          scope: ['authenticated']
        },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/websocket/stats',
      handler: 'websocket.getStats',
      config: {
        auth: {
          scope: ['authenticated']
        },
        policies: [],
        middlewares: [],
      },
    },
  ],
};
