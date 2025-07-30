export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/ai-tokens',
      handler: 'ai-token.find',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/ai-tokens/active',
      handler: 'ai-token.getActiveTokens',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/ai-tokens/:id/price',
      handler: 'ai-token.getTokenPrice',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/ai-tokens/prices/batch',
      handler: 'ai-token.getBatchPrices',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/ai-tokens/market-data',
      handler: 'ai-token.getMarketData',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/ai-tokens/initialize',
      handler: 'ai-token.initializeTokens',
      config: {
        auth: {
          scope: ['admin::is-authenticated'],
        },
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 