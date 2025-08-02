import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::choujiang-ji-lu.choujiang-ji-lu' as any, ({ strapi }) => ({
  // 继承默认的find方法
  async find(ctx) {
    try {
      // 处理查询参数，将"me"替换为当前用户ID
      const query = { ...ctx.query };
      
      // 检查是否有filters[user][id]=me的情况
      if (query.filters && query.filters.user && query.filters.user.id === 'me') {
        if (ctx.state.user && ctx.state.user.id) {
          query.filters.user.id = ctx.state.user.id;
        } else {
          return ctx.unauthorized('用户未登录');
        }
      }
      
      const result = await strapi.entityService.findPage('api::choujiang-ji-lu.choujiang-ji-lu' as any, {
        ...query,
        populate: ['user', 'jiangpin', 'chance']
      });
      return result;
    } catch (error) {
      console.error('获取抽奖记录列表失败:', error);
      ctx.throw(500, `获取抽奖记录列表失败: ${error.message}`);
    }
  },

  // 添加默认的findOne方法
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.entityService.findOne('api::choujiang-ji-lu.choujiang-ji-lu' as any, id, {
        populate: ['user', 'jiangpin', 'chance']
      });
      return result;
    } catch (error) {
      console.error('获取抽奖记录详情失败:', error);
      ctx.throw(500, `获取抽奖记录详情失败: ${error.message}`);
    }
  },

  // 添加默认的create方法
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      const result = await strapi.entityService.create('api::choujiang-ji-lu.choujiang-ji-lu' as any, {
        data
      });
      return result;
    } catch (error) {
      console.error('创建抽奖记录失败:', error);
      ctx.throw(500, `创建抽奖记录失败: ${error.message}`);
    }
  },

  // 添加默认的update方法
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;
      const result = await strapi.entityService.update('api::choujiang-ji-lu.choujiang-ji-lu' as any, id, {
        data
      });
      return result;
    } catch (error) {
      console.error('更新抽奖记录失败:', error);
      ctx.throw(500, `更新抽奖记录失败: ${error.message}`);
    }
  },

  // 添加默认的delete方法
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.entityService.delete('api::choujiang-ji-lu.choujiang-ji-lu' as any, id);
      return result;
    } catch (error) {
      console.error('删除抽奖记录失败:', error);
      ctx.throw(500, `删除抽奖记录失败: ${error.message}`);
    }
  },

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
        populate: {
          jiangpin: {
            populate: ['image'] // 添加图片populate
          },
          chance: true,
          shippingOrder: {
            populate: ['receiverName', 'mobile', 'province', 'city', 'district', 'address', 'zipCode', 'status', 'trackingNo', 'carrier', 'shippedAt', 'deliveredAt']
          }
        },
        pagination: {
          page: parseInt(String(page)),
          pageSize: parseInt(String(pageSize))
        },
        sort: { drawTime: 'desc' }
      });

      // 计算统计信息
      const totalDraws = await strapi.entityService.count('api::choujiang-ji-lu.choujiang-ji-lu' as any, {
        filters: { user: { id: userId } } as any
      });

      const totalWins = await strapi.entityService.count('api::choujiang-ji-lu.choujiang-ji-lu' as any, {
        filters: { 
          user: { id: userId },
          isWon: true
        } as any
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