export default {
  type: 'content-api',
  routes: [
    {
      method: 'POST',
      path: '/user-push-token/register',
      handler: 'user-push-token.register',
      config: {
        type: 'content-api',
        auth: {},
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/user-push-token/unregister',
      handler: 'user-push-token.unregister',
      config: {
        type: 'content-api',
        auth: {},
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/user-push-token/tokens',
      handler: 'user-push-token.getUserTokens',
      config: {
        type: 'content-api',
        auth: {},
        policies: [],
        middlewares: [],
      },
    },
  ],
};
