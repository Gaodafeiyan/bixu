import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::choujiang-jiangpin.choujiang-jiangpin', ({ strapi }) => ({
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
      };

      // 添加分类过滤
      if (category) {
        filters.category = category;
      }

      // 添加稀有度过滤
      if (rarity) {
        filters.rarity = rarity;
      }

      const prizes = await strapi.entityService.findMany('api::choujiang-jiangpin.choujiang-jiangpin', {
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
      const totalPrizes = await strapi.entityService.count('api::choujiang-jiangpin.choujiang-jiangpin');
      const activePrizes = await strapi.entityService.count('api::choujiang-jiangpin.choujiang-jiangpin', {
        filters: { kaiQi: true }
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

      const prize = await strapi.entityService.findOne('api::choujiang-jiangpin.choujiang-jiangpin', id);
      if (!prize) {
        return ctx.notFound('奖品不存在');
      }

      const newQuantity = Math.max(0, ((prize as any).currentQuantity || 0) + quantity);
      
      await strapi.entityService.update('api::choujiang-jiangpin.choujiang-jiangpin', id, {
        data: { currentQuantity: newQuantity }
      });

      ctx.body = {
        success: true,
        data: { currentQuantity: newQuantity },
        message: '更新奖品库存成功'
      };
    } catch (error) {
      console.error('更新奖品库存失败:', error);
      ctx.throw(500, `更新奖品库存失败: ${error.message}`);
    }
  }
})); 