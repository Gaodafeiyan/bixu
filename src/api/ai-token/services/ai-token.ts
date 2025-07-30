import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::ai-token.ai-token' as any, ({ strapi }) => ({
  // 获取所有活跃的代币
  async getActiveTokens() {
    try {
      const result = await strapi.entityService.findMany('api::ai-token.ai-token' as any, {
        filters: {
          is_active: true
        },
        sort: { weight: 'desc' }
      });
      return result || [];
    } catch (error) {
      console.error('获取活跃代币失败:', error);
      return [];
    }
  },

  // 获取代币价格
  async getTokenPrice(tokenId: number) {
    try {
      const token = await strapi.entityService.findOne('api::ai-token.ai-token' as any, tokenId);
      if (!token) {
        console.warn(`代币不存在: ${tokenId}`);
        return 0.01;
      }

      const { price_source, price_api_id } = token as any;
      
      switch (price_source) {
        case 'coingecko':
          return await this.getCoinGeckoPrice(price_api_id);
        case 'binance':
          return await this.getBinancePrice(price_api_id);
        case 'dexscreener':
          return await this.getDexScreenerPrice(price_api_id);
        default:
          console.warn(`不支持的价格源: ${price_source}`);
          return 0.01;
      }
    } catch (error) {
      console.error(`获取代币 ${tokenId} 价格失败:`, error);
      return 0.01;
    }
  },

  // CoinGecko API
  async getCoinGeckoPrice(coinId: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data[coinId]?.usd || 0.01;
    } catch (error) {
      console.error('CoinGecko API 请求失败:', error);
      return 0.01;
    }
  },

  // Binance API
  async getBinancePrice(symbol: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`,
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status}`);
      }
      
      const data = await response.json() as any;
      return parseFloat(data.price) || 0.01;
    } catch (error) {
      console.error('Binance API 请求失败:', error);
      return 0.01;
    }
  },

  // DexScreener API
  async getDexScreenerPrice(pairAddress: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(
        `https://api.dexscreener.com/latest/dex/pairs/solana/${pairAddress}`,
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`DexScreener API error: ${response.status}`);
      }
      
      const data = await response.json() as any;
      return parseFloat(data.pairs?.[0]?.priceUsd) || 0.01;
    } catch (error) {
      console.error('DexScreener API 请求失败:', error);
      return 0.01;
    }
  },

  // 批量获取代币价格
  async getBatchTokenPrices() {
    try {
      const tokens = await this.getActiveTokens();
      const prices: { [key: number]: number } = {};
      
      for (const token of tokens) {
        prices[token.id] = await this.getTokenPrice(token.id);
      }
      
      return prices;
    } catch (error) {
      console.error('批量获取代币价格失败:', error);
      return {};
    }
  },

  // 初始化代币数据
  async initializeTokens() {
    try {
      const defaultTokens = [
        {
          name: 'Render',
          symbol: 'RNDR',
          contract_address: 'RNDR1A97ZatuqTAT2bZn1r4KwQisLvVfwJQfqWwaCSm',
          price_source: 'coingecko',
          price_api_id: 'render-token',
          weight: 30,
          is_active: true,
          description: 'Render Network代币'
        },
        {
          name: 'Nosana',
          symbol: 'NOS',
          contract_address: '4BC2PiK9Y319bPQKHbLbHu86xdksJLAuBTBDPc6QcKAS',
          price_source: 'coingecko',
          price_api_id: 'nosana',
          weight: 25,
          is_active: true,
          description: 'Nosana代币'
        },
        {
          name: 'Synesis One',
          symbol: 'SNS',
          contract_address: 'SNS5czn4ZyjtHNpgJyHCN33zBYFWvLJoYxx3JrqkjvGc',
          price_source: 'coingecko',
          price_api_id: 'synesis-one',
          weight: 20,
          is_active: true,
          description: 'Synesis One代币'
        },
        {
          name: 'Numeraire',
          symbol: 'NMR',
          contract_address: 'NMR1gd2nautLcWTPZLY625YCHP6oVVNqs8s4ET3SkMsv',
          price_source: 'coingecko',
          price_api_id: 'numerai',
          weight: 15,
          is_active: true,
          description: 'Numeraire代币'
        },
        {
          name: 'ChainGPT',
          symbol: 'CGPT',
          contract_address: 'CGPT1Ws3jh9E82fUmX9Zykp17fjM5pVp4SGbXw7U7Doo',
          price_source: 'coingecko',
          price_api_id: 'chaingpt',
          weight: 10,
          is_active: true,
          description: 'ChainGPT代币'
        }
      ];

      for (const tokenData of defaultTokens) {
        const existingToken = await strapi.entityService.findMany('api::ai-token.ai-token' as any, {
          filters: { symbol: tokenData.symbol }
        });
        
        if (!existingToken || (Array.isArray(existingToken) && existingToken.length === 0)) {
          await strapi.entityService.create('api::ai-token.ai-token' as any, {
            data: tokenData
          });
        }
      }
      
      console.log('AI代币数据初始化完成');
    } catch (error) {
      console.error('初始化AI代币数据失败:', error);
      throw error;
    }
  }
})); 