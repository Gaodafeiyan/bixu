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

      console.log('🔍 获取用户抽奖历史 - 用户ID:', userId);
      console.log('🔍 过滤条件:', filters);

      const result = await strapi.entityService.findPage('api::choujiang-ji-lu.choujiang-ji-lu' as any, {
        filters,
        populate: {
          jiangpin: {
            populate: ['image'] // 添加图片populate
          },
          chance: true,
          // 移除错误的shippingOrder populate，因为发货订单是通过record关联的
        },
        pagination: {
          page: parseInt(String(page)),
          pageSize: parseInt(String(pageSize))
        },
        sort: { drawTime: 'desc' }
      });

      console.log('🔍 查询结果数量:', result.results?.length || 0);
      
      // 为每个记录单独查询发货订单
      if (result.results) {
        for (let i = 0; i < result.results.length; i++) {
          const record = result.results[i] as any;
          console.log(`🔍 记录 ${i + 1}:`);
          console.log(`   奖品: ${record.jiangpin?.name || '未知'}`);
          console.log(`   中奖: ${record.isWon}`);
          console.log(`   记录ID: ${record.id}`);
          
                     // 查询该记录对应的发货订单 - 修复查询逻辑
           const shippingOrders = await strapi.entityService.findMany('api::shipping-order.shipping-order' as any, {
             filters: {
               record: { id: record.id }
             },
             populate: {
               record: {
                 populate: ['jiangpin']
               }
             }
           }) as any[];
          
          if (shippingOrders && shippingOrders.length > 0) {
            record.shippingOrder = shippingOrders[0];
            console.log(`   发货订单: 存在`);
            console.log(`   收货人: ${record.shippingOrder.receiverName || 'null'}`);
            console.log(`   状态: ${record.shippingOrder.status || 'null'}`);
            console.log(`   手机: ${record.shippingOrder.mobile || 'null'}`);
          } else {
            console.log(`   发货订单: 不存在`);
            // 如果没有发货订单，设置默认值
            record.shippingOrder = null;
          }
        }
      }

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

      // 计算奖品类型统计的百分比
      const prizeTypeStatsWithPercentage: any = {};
      Object.keys(typeStats).forEach(type => {
        const stats = typeStats[type];
        const percentage = totalDraws > 0 ? (stats.total / totalDraws * 100).toFixed(2) : '0.00';
        prizeTypeStatsWithPercentage[type] = {
          count: stats.total,
          wins: stats.wins,
          percentage: `${percentage}%`
        };
      });

      // 月度统计（最近6个月）
      const monthlyStats = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthDraws = await strapi.entityService.count('api::choujiang-ji-lu.choujiang-ji-lu' as any, {
          filters: {
            drawTime: {
              $gte: startOfMonth,
              $lte: endOfMonth
            }
          } as any
        });
        
        const monthWins = await strapi.entityService.count('api::choujiang-ji-lu.choujiang-ji-lu' as any, {
          filters: {
            drawTime: {
              $gte: startOfMonth,
              $lte: endOfMonth
            },
            isWon: true
          } as any
        });
        
        const monthRate = monthDraws > 0 ? (monthWins / monthDraws * 100).toFixed(2) : '0.00';
        
        monthlyStats.push({
          period: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
          draws: monthDraws,
          wins: monthWins,
          rate: `${monthRate}%`
        });
      }

      // 周度统计（最近4周）
      const weeklyStats = [];
      for (let i = 3; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7));
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        const weekDraws = await strapi.entityService.count('api::choujiang-ji-lu.choujiang-ji-lu' as any, {
          filters: {
            drawTime: {
              $gte: startOfWeek,
              $lte: endOfWeek
            }
          } as any
        });
        
        const weekWins = await strapi.entityService.count('api::choujiang-ji-lu.choujiang-ji-lu' as any, {
          filters: {
            drawTime: {
              $gte: startOfWeek,
              $lte: endOfWeek
            },
            isWon: true
          } as any
        });
        
        const weekRate = weekDraws > 0 ? (weekWins / weekDraws * 100).toFixed(2) : '0.00';
        
        weeklyStats.push({
          period: `第${4-i}周`,
          draws: weekDraws,
          wins: weekWins,
          rate: `${weekRate}%`
        });
      }

      ctx.body = {
        success: true,
        data: {
          totalDraws,
          totalWins,
          winRate: totalDraws > 0 ? (totalWins / totalDraws * 100).toFixed(2) : '0.00',
          typeStats: prizeTypeStatsWithPercentage,
          monthlyStats,
          weeklyStats
        },
        message: '获取抽奖统计成功'
      };
    } catch (error) {
      console.error('获取抽奖统计失败:', error);
      ctx.throw(500, `获取抽奖统计失败: ${error.message}`);
    }
  }
})); 