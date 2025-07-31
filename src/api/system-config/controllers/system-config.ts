import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::system-config.system-config', ({ strapi }) => ({
  // 继承默认的find方法
  async find(ctx) {
    try {
      const result = await strapi.entityService.findPage('api::system-config.system-config', {
        ...ctx.query,
        populate: []
      });
      return result;
    } catch (error) {
      console.error('获取系统配置列表失败:', error);
      ctx.throw(500, `获取系统配置列表失败: ${error.message}`);
    }
  },

  // 添加默认的findOne方法
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.entityService.findOne('api::system-config.system-config', id, {
        populate: []
      });
      return result;
    } catch (error) {
      console.error('获取系统配置详情失败:', error);
      ctx.throw(500, `获取系统配置详情失败: ${error.message}`);
    }
  },

  // 添加默认的create方法
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      const result = await strapi.entityService.create('api::system-config.system-config', {
        data
      });
      return result;
    } catch (error) {
      console.error('创建系统配置失败:', error);
      ctx.throw(500, `创建系统配置失败: ${error.message}`);
    }
  },

  // 添加默认的update方法
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;
      const result = await strapi.entityService.update('api::system-config.system-config', id, {
        data
      });
      return result;
    } catch (error) {
      console.error('更新系统配置失败:', error);
      ctx.throw(500, `更新系统配置失败: ${error.message}`);
    }
  },

  // 添加默认的delete方法
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.entityService.delete('api::system-config.system-config', id);
      return result;
    } catch (error) {
      console.error('删除系统配置失败:', error);
      ctx.throw(500, `删除系统配置失败: ${error.message}`);
    }
  },

  // 获取限购设置
  async getLimitSettings(ctx) {
    try {
      const limitConfigs = await strapi.entityService.findMany('api::system-config.system-config', {
        filters: {
          key: { $in: ['daily_order_limit', 'daily_reset_time', 'limit_enabled'] }
        }
      });

      const settings = {};
      limitConfigs.forEach(config => {
        settings[config.key] = config.value;
      });

      ctx.body = {
        success: true,
        data: settings
      };
    } catch (error) {
      console.error('获取限购设置失败:', error);
      ctx.throw(500, `获取限购设置失败: ${error.message}`);
    }
  },

  // 更新限购设置
  async updateLimitSettings(ctx) {
    try {
      const { daily_order_limit, limit_enabled } = ctx.request.body;

      // 更新或创建每日限购数量设置
      const existingLimit = await strapi.entityService.findMany('api::system-config.system-config', {
        filters: { key: 'daily_order_limit' }
      });

      if (existingLimit.length > 0) {
        await strapi.entityService.update('api::system-config.system-config', existingLimit[0].id, {
          data: { value: daily_order_limit.toString() }
        });
      } else {
        await strapi.entityService.create('api::system-config.system-config', {
          data: {
            key: 'daily_order_limit',
            value: daily_order_limit.toString(),
            description: '每日可投资订单数量限制'
          }
        });
      }

      // 更新或创建限购开关设置
      const existingEnabled = await strapi.entityService.findMany('api::system-config.system-config', {
        filters: { key: 'limit_enabled' }
      });

      if (existingEnabled.length > 0) {
        await strapi.entityService.update('api::system-config.system-config', existingEnabled[0].id, {
          data: { value: limit_enabled.toString() }
        });
      } else {
        await strapi.entityService.create('api::system-config.system-config', {
          data: {
            key: 'limit_enabled',
            value: limit_enabled.toString(),
            description: '是否启用每日限购'
          }
        });
      }

      ctx.body = {
        success: true,
        message: '限购设置更新成功'
      };
    } catch (error) {
      console.error('更新限购设置失败:', error);
      ctx.throw(500, `更新限购设置失败: ${error.message}`);
    }
  },

  // 获取每日投资统计
  async getDailyInvestmentStats(ctx) {
    try {
      const { date } = ctx.query;
      const targetDate = date ? new Date(date) : new Date();
      
      // 获取指定日期的投资订单数量
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const dailyOrders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
        filters: {
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        },
        populate: ['jihua']
      });

      // 按计划分组统计
      const planStats = {};
      dailyOrders.forEach(order => {
        const planCode = order.jihua.jihuaCode;
        if (!planStats[planCode]) {
          planStats[planCode] = {
            planName: order.jihua.name,
            orderCount: 0,
            totalAmount: 0
          };
        }
        planStats[planCode].orderCount++;
        planStats[planCode].totalAmount += parseFloat(order.amount.toString());
      });

      ctx.body = {
        success: true,
        data: {
          date: targetDate.toISOString().split('T')[0],
          totalOrders: dailyOrders.length,
          totalAmount: dailyOrders.reduce((sum, order) => sum + parseFloat(order.amount.toString()), 0),
          planStats: planStats
        }
      };
    } catch (error) {
      console.error('获取每日投资统计失败:', error);
      ctx.throw(500, `获取每日投资统计失败: ${error.message}`);
    }
  },

  // 手动重置每日限购计数
  async resetDailyCounts(ctx) {
    try {
      const { planId } = ctx.params;
      
      if (planId) {
        // 重置指定计划
        await strapi.entityService.update('api::dinggou-jihua.dinggou-jihua', planId, {
          data: {
            daily_order_count: 0,
            last_reset_date: new Date()
          } as any
        });
      } else {
        // 重置所有计划
        const allPlans = await strapi.entityService.findMany('api::dinggou-jihua.dinggou-jihua');
        for (const plan of allPlans) {
          await strapi.entityService.update('api::dinggou-jihua.dinggou-jihua', plan.id, {
            data: {
              daily_order_count: 0,
              last_reset_date: new Date()
            } as any
          });
        }
      }

      ctx.body = {
        success: true,
        message: '每日限购计数重置成功'
      };
    } catch (error) {
      console.error('重置每日限购计数失败:', error);
      ctx.throw(500, `重置每日限购计数失败: ${error.message}`);
    }
  }
})); 