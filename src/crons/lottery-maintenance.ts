export default {
  // 定时任务配置 - 每天凌晨2点执行
  cron: '0 2 * * *',
  
  // 任务处理函数
  async handler({ strapi }) {
    try {
      console.log('🕐 开始执行抽奖系统维护任务...');
      
      // 1. 清理过期的抽奖机会
      await this.cleanExpiredChances(strapi);
      
      // 2. 清理过期的奖品
      await this.cleanExpiredPrizes(strapi);
      
      // 3. 检查库存预警
      await this.checkStockWarnings(strapi);
      
      // 4. 生成抽奖统计报告
      await this.generateLotteryReport(strapi);
      
      console.log('✅ 抽奖系统维护任务完成');
    } catch (error) {
      console.error('❌ 抽奖系统维护任务失败:', error);
    }
  },

  // 清理过期的抽奖机会
  async cleanExpiredChances(strapi: any) {
    try {
      const beijingNow = new Date(Date.now() + 8 * 60 * 60 * 1000); // 北京时间 UTC+8
      
      const expiredChances = await strapi.entityService.findMany('api::choujiang-jihui.choujiang-jihui' as any, {
        filters: {
          isActive: true,
          validUntil: { $lt: beijingNow }
        }
      });

      if (expiredChances.length > 0) {
        console.log(`发现 ${expiredChances.length} 个过期抽奖机会`);
        
        for (const chance of expiredChances) {
          await strapi.entityService.update('api::choujiang-jihui.choujiang-jihui' as any, chance.id, {
            data: { isActive: false }
          });
        }
        
        console.log(`已清理 ${expiredChances.length} 个过期抽奖机会`);
      }
    } catch (error) {
      console.error('清理过期抽奖机会失败:', error);
    }
  },

  // 清理过期的奖品
  async cleanExpiredPrizes(strapi: any) {
    try {
      const now = new Date();
      
      const expiredPrizes = await strapi.entityService.findMany('api::choujiang-jiangpin.choujiang-jiangpin' as any, {
        filters: {
          kaiQi: true,
          validUntil: { $lt: now }
        }
      });

      if (expiredPrizes.length > 0) {
        console.log(`发现 ${expiredPrizes.length} 个过期奖品`);
        
        for (const prize of expiredPrizes) {
          await strapi.entityService.update('api::choujiang-jiangpin.choujiang-jiangpin' as any, prize.id, {
            data: { kaiQi: false }
          });
        }
        
        console.log(`已清理 ${expiredPrizes.length} 个过期奖品`);
      }
    } catch (error) {
      console.error('清理过期奖品失败:', error);
    }
  },

  // 检查库存预警
  async checkStockWarnings(strapi: any) {
    try {
      const lotteryEngine = strapi.service('lottery-engine' as any);
      await lotteryEngine.checkStockWarning();
    } catch (error) {
      console.error('检查库存预警失败:', error);
    }
  },

  // 生成抽奖统计报告
  async generateLotteryReport(strapi: any) {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      // 获取昨日抽奖统计
      const yesterdayDraws = await strapi.entityService.count('api::choujiang-ji-lu.choujiang-ji-lu' as any, {
        filters: {
          drawTime: { $gte: yesterday }
        }
      });

      const yesterdayWins = await strapi.entityService.count('api::choujiang-ji-lu.choujiang-ji-lu' as any, {
        filters: {
          drawTime: { $gte: yesterday },
          isWon: true
        }
      });

      const winRate = yesterdayDraws > 0 ? (yesterdayWins / yesterdayDraws * 100).toFixed(2) : '0.00';

      console.log(`📊 昨日抽奖统计:`);
      console.log(`   - 总抽奖次数: ${yesterdayDraws}`);
      console.log(`   - 中奖次数: ${yesterdayWins}`);
      console.log(`   - 中奖率: ${winRate}%`);

      // 可以发送到钉钉或其他通知渠道
      if (yesterdayDraws > 0) {
        await this.sendDailyReport({
          totalDraws: yesterdayDraws,
          totalWins: yesterdayWins,
          winRate: winRate
        });
      }
    } catch (error) {
      console.error('生成抽奖统计报告失败:', error);
    }
  },

  // 发送每日报告
  async sendDailyReport(stats: any) {
    try {
      const webhookUrl = process.env.DINGTALK_WEBHOOK_URL;
      if (!webhookUrl) return;

      const message = {
        msgtype: 'text',
        text: {
          content: `📊 抽奖系统每日报告\n\n` +
                   `• 总抽奖次数: ${stats.totalDraws}\n` +
                   `• 中奖次数: ${stats.totalWins}\n` +
                   `• 中奖率: ${stats.winRate}%\n` +
                   `• 报告时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`
        }
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
    } catch (error) {
      console.error('发送每日报告失败:', error);
    }
  }
}; 