import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::ai-token.ai-token' as any, ({ strapi }) => ({
  // 获取所有活跃代币
  async getActiveTokens(ctx) {
    try {
      const tokens = await strapi.service('api::ai-token.ai-token').getActiveTokens();
      ctx.body = {
        data: tokens
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 获取代币价格
  async getTokenPrice(ctx) {
    try {
      const { id } = ctx.params;
      const price = await strapi.service('api::ai-token.ai-token').getTokenPrice(parseInt(id));
      ctx.body = {
        data: { price }
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 批量获取代币价格
  async getBatchPrices(ctx) {
    try {
      const prices = await strapi.service('api::ai-token.ai-token').getBatchTokenPrices();
      ctx.body = {
        data: prices
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 初始化代币数据
  async initializeTokens(ctx) {
    try {
      await strapi.service('api::ai-token.ai-token').initializeTokens();
      ctx.body = {
        data: { message: '代币数据初始化成功' }
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 获取代币市场数据
  async getMarketData(ctx) {
    try {
      const tokens = await strapi.service('api::ai-token.ai-token').getActiveTokens();
      const prices = await strapi.service('api::ai-token.ai-token').getBatchTokenPrices();
      
      const marketData = tokens.map(token => ({
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        price: prices[token.id] || 0.01,
        weight: token.weight,
        description: token.description,
        logo_url: token.logo_url
      }));
      
      ctx.body = {
        data: marketData
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  }
})); 