import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::choujiang-ji-lu.choujiang-ji-lu' as any, ({ strapi }) => ({
  // 获取用户的抽奖历史
  async getUserHistory(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { page = 1, pageSize = 20, isWon } = ctx.query;

      const filters: any = {
        user: { id: userId }
      };

      // 添加中奖状态过滤
      if (isWon !== undefined) {
        filters.isWon = isWon === 'true';
      }

      const result = await strapi.entityService.findPage('api::choujiang-ji-lu.choujiang-ji-lu' as any, {
        filters,
        populate: ['jiangpin', 'chance'],
        pagination: {
          page: parseInt(String(page)),
          pageSize: parseInt(String(pageSize))
        },
        sort: { drawTime: 'desc' }
      });

      // 计算统计信息
      const totalDraws = await strapi.entityService.count('api::choujiang-ji-lu.choujiang-ji-lu' as any, {
        filters: { user: { id: userId } }
      });

      const totalWins = await strapi.entityService.count('api::choujiang-ji-lu.choujiang-ji-lu' as any, {
        filters: { 
          user: { id: userId },
          isWon: true
        }
      });

      const winRate = totalDraws > 0 ? (totalWins / totalDraws * 100).toFixed(2) : '0.00';

      ctx.body = {
        success: true,
        data: {
          ...result,
          stats: {
            totalDraws,
            totalWins,
            winRate: `${winRate}%`
          }
        },
        message: '获取抽奖历史成功'
      };
    } catch (error) {
      console.error('获取用户抽奖历史失败:', error);
      ctx.throw(500, `获取用户抽奖历史失败: ${error.message}`);
    }
  },

  // 获取抽奖统计信息（管理员）
  async getDrawStats(ctx) {
    try {
      const { startDate, endDate } = ctx.query;

      const filters: any = {};
      
      // 添加日期范围过滤
      if (startDate || endDate) {
        filters.drawTime = {};
        if (startDate) {
          filters.drawTime.$gte = new Date(startDate);
        }
        if (endDate) {
          filters.drawTime.$lte = new Date(endDate);
        }
      }

      const totalDraws = await strapi.entityService.count('api::choujiang-ji-lu.choujiang-ji-lu' as any, { filters });
      const totalWins = await strapi.entityService.count('api::choujiang-ji-lu.choujiang-ji-lu' as any, { 
        filters: { ...filters, isWon: true }
      });

      // 按奖品类型统计
      const prizeTypeStats = await strapi.db.query('api::choujiang-ji-lu.choujiang-ji-lu').findMany({
        select: ['isWon'],
        populate: {
          jiangpin: {
            select: ['jiangpinType']
          }
        },
        filters
      });

      const typeStats: any = {};
      prizeTypeStats.forEach((record: any) => {
        const type = record.jiangpin?.jiangpinType || 'unknown';
        if (!typeStats[type]) {
          typeStats[type] = { total: 0, wins: 0 };
        }
        typeStats[type].total++;
        if (record.isWon) {
          typeStats[type].wins++;
        }
      });

      ctx.body = {
        success: true,
        data: {
          totalDraws,
          totalWins,
          winRate: totalDraws > 0 ? (totalWins / totalDraws * 100).toFixed(2) : '0.00',
          typeStats
        },
        message: '获取抽奖统计成功'
      };
    } catch (error) {
      console.error('获取抽奖统计失败:', error);
      ctx.throw(500, `获取抽奖统计失败: ${error.message}`);
    }
  }
})); 