import { Strapi } from '@strapi/strapi';

export default ({ strapi }: { strapi: Strapi }) => ({
  // 每日限购重置任务
  async resetDailyLimits() {
    try {
      console.log('🔄 开始执行每日限购重置任务...');
      
      // 获取北京时间
      const beijingTime = new Date(Date.now() + 8 * 60 * 60 * 1000);
      const beijingToday = new Date(beijingTime);
      beijingToday.setHours(0, 0, 0, 0);
      
      // 获取所有认购计划
      const allPlans = await strapi.entityService.findMany('api::dinggou-jihua.dinggou-jihua');
      
      let resetCount = 0;
      for (const plan of Array.isArray(allPlans) ? allPlans : [allPlans]) {
        const planData = plan as any;
        
        // 检查是否需要重置
        let shouldReset = false;
        if (!planData.last_reset_date) {
          shouldReset = true;
        } else {
          const lastReset = new Date(planData.last_reset_date);
          const lastResetBeijing = new Date(lastReset.getTime() + 8 * 60 * 60 * 1000);
          const lastResetToday = new Date(lastResetBeijing);
          lastResetToday.setHours(0, 0, 0, 0);
          
          if (beijingToday.getTime() > lastResetToday.getTime()) {
            shouldReset = true;
          }
        }
        
        // 如果需要重置，更新计数和重置日期
        if (shouldReset) {
          await strapi.entityService.update('api::dinggou-jihua.dinggou-jihua', plan.id, {
            data: {
              daily_order_count: 0,
              last_reset_date: beijingToday
            } as any
          });
          resetCount++;
          console.log(`✅ 计划 ${planData.jihuaCode} 每日限购计数已重置`);
        }
      }
      
      console.log(`🎉 每日限购重置任务完成，共重置 ${resetCount} 个计划`);
      
      // 记录重置日志
      await strapi.entityService.create('api::system-config.system-config', {
        data: {
          key: `daily_reset_log_${beijingToday.toISOString().split('T')[0]}`,
          value: JSON.stringify({
            resetTime: beijingToday.toISOString(),
            resetCount: resetCount,
            totalPlans: allPlans.length
          }),
          description: '每日限购重置日志'
        }
      });
      
    } catch (error) {
      console.error('❌ 每日限购重置任务失败:', error);
    }
  },

  // 获取每日限购统计
  async getDailyLimitStats() {
    try {
      const allPlans = await strapi.entityService.findMany('api::dinggou-jihua.dinggou-jihua');
      
      const stats = allPlans.map(plan => {
        const planData = plan as any;
        return {
          planId: plan.id,
          planCode: planData.jihuaCode,
          planName: planData.name,
          dailyLimit: planData.daily_order_limit || 100,
          currentCount: planData.daily_order_count || 0,
          remainingCount: (planData.daily_order_limit || 100) - (planData.daily_order_count || 0),
          lastResetDate: planData.last_reset_date,
          isActive: planData.kaiqi
        };
      });
      
      return {
        success: true,
        data: {
          totalPlans: allPlans.length,
          activePlans: stats.filter(s => s.isActive).length,
          stats: stats
        }
      };
    } catch (error) {
      console.error('获取每日限购统计失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}); 