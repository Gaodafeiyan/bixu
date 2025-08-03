export default {
  type: 'content-api',
  routes: [
    {
      method: 'POST',
      path: '/fcm/register',
      handler: 'user-fcm-token.registerToken',
      config: {
        type: 'content-api',
        auth: {},
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/fcm/unregister',
      handler: 'user-fcm-token.unregisterToken',
      config: {
        type: 'content-api',
        auth: {},
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/fcm/tokens',
      handler: 'user-fcm-token.getUserTokens',
      config: {
        type: 'content-api',
        auth: {},
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 