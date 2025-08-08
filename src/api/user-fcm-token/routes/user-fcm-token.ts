export default {
  type: 'content-api',
  routes: [
    {
      method: 'POST',
      path: '/user-fcm-token/register',
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
      path: '/user-fcm-token/unregister',
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
      path: '/user-fcm-token/tokens',
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