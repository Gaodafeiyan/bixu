import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::choujiang-jiangpin.choujiang-jiangpin' as any, ({ strapi }) => ({
  // 继承默认的find方法
  async find(ctx) {
    try {
      // 直接使用strapi.entityService
      const result = await strapi.entityService.findPage('api::choujiang-jiangpin.choujiang-jiangpin' as any, {
        ...ctx.query,
        populate: ['image']
      });
      return result;
    } catch (error) {
      console.error('获取抽奖奖品列表失败:', error);
      ctx.throw(500, `获取抽奖奖品列表失败: ${error.message}`);
    }
  },

  // 添加默认的findOne方法
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.entityService.findOne('api::choujiang-jiangpin.choujiang-jiangpin' as any, id, {
        populate: ['image']
      });
      return result;
    } catch (error) {
      console.error('获取抽奖奖品详情失败:', error);
      ctx.throw(500, `获取抽奖奖品详情失败: ${error.message}`);
    }
  },

  // 添加默认的create方法
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      const result = await strapi.entityService.create('api::choujiang-jiangpin.choujiang-jiangpin' as any, {
        data
      });
      return result;
    } catch (error) {
      console.error('创建抽奖奖品失败:', error);
      ctx.throw(500, `创建抽奖奖品失败: ${error.message}`);
    }
  },

  // 添加默认的update方法
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;
      const result = await strapi.entityService.update('api::choujiang-jiangpin.choujiang-jiangpin' as any, id, {
        data
      });
      return result;
    } catch (error) {
      console.error('更新抽奖奖品失败:', error);
      ctx.throw(500, `更新抽奖奖品失败: ${error.message}`);
    }
  },

  // 添加默认的delete方法
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.entityService.delete('api::choujiang-jiangpin.choujiang-jiangpin' as any, id);
      return result;
    } catch (error) {
      console.error('删除抽奖奖品失败:', error);
      ctx.throw(500, `删除抽奖奖品失败: ${error.message}`);
    }
  },

  // 获取可用的奖品列表（用于抽奖）
  async getAvailablePrizes(ctx) {
    try {
      const { category, rarity } = ctx.query;
      
      const filters: any = {
        kaiQi: true,
        $or: [
          { maxQuantity: 0 }, // 无限制数量
          { currentQuantity: { $lt: { $ref: 'maxQuantity' } } } // 当前数量小于最大数量
        ]
      } as any;

      // 添加分类过滤
      if (category) {
        filters.category = category;
      }

      // 添加稀有度过滤
      if (rarity) {
        filters.rarity = rarity;
      }

      const prizes = await strapi.entityService.findMany('api::choujiang-jiangpin.choujiang-jiangpin' as any, {
        filters,
        sort: { paiXuShunXu: 'asc', zhongJiangLv: 'desc' },
        populate: ['image']
      });

      ctx.body = {
        success: true,
        data: prizes,
        message: '获取可用奖品成功'
      };
    } catch (error) {
      console.error('获取可用奖品失败:', error);
      ctx.throw(500, `获取可用奖品失败: ${error.message}`);
    }
  },

  // 获取奖品统计信息
  async getPrizeStats(ctx) {
    try {
      const totalPrizes = await strapi.entityService.count('api::choujiang-jiangpin.choujiang-jiangpin' as any);
      const activePrizes = await strapi.entityService.count('api::choujiang-jiangpin.choujiang-jiangpin' as any, {
        filters: { kaiQi: true } as any
      });

      // 按稀有度统计 - 使用原生SQL查询替代groupBy
      const rarityStats = await strapi.db.connection.raw(`
        SELECT rarity, COUNT(*) as count 
        FROM choujiang_jiangpins 
        GROUP BY rarity
      `);

      ctx.body = {
        success: true,
        data: {
          totalPrizes,
          activePrizes,
          rarityStats: rarityStats.rows || []
        },
        message: '获取奖品统计成功'
      };
    } catch (error) {
      console.error('获取奖品统计失败:', error);
      ctx.throw(500, `获取奖品统计失败: ${error.message}`);
    }
  },

  // 更新奖品库存
  async updatePrizeQuantity(ctx) {
    try {
      const { id } = ctx.params;
      const { quantity } = ctx.request.body;

      if (typeof quantity !== 'number') {
        return ctx.badRequest('数量必须是数字');
      }

      const prize = await strapi.entityService.findOne('api::choujiang-jiangpin.choujiang-jiangpin' as any, id);
      if (!prize) {
        return ctx.notFound('奖品不存在');
      }

      const newQuantity = Math.max(0, ((prize as any).currentQuantity || 0) + quantity);
      
      await strapi.entityService.update('api::choujiang-jiangpin.choujiang-jiangpin' as any, id, {
        data: { currentQuantity: newQuantity } as any as any as any
      });

      ctx.body = {
        success: true,
        data: { currentQuantity: newQuantity } as any as any,
        message: '更新奖品库存成功'
      };
    } catch (error) {
      console.error('更新奖品库存失败:', error);
      ctx.throw(500, `更新奖品库存失败: ${error.message}`);
    }
  }
})); 