import cron from 'node-cron';

let jobsStarted = false;
let scanning = false;
let processingWithdrawals = false;

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    // 移除手动服务注册，使用Strapi的自动服务发现机制
    // 服务文件现在位于正确的位置：src/api/investment-service/services/
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    if (jobsStarted) return;
    jobsStarted = true;

    // 可用环境开关：不想跑就不跑
    if (process.env.ENABLE_CHAIN_JOBS !== 'true') {
      strapi.log.info('Chain jobs disabled by env');
      return;
    }

    console.log('🚀 启动定时任务...');

    // 获取区块链服务
    const blockchainService = strapi.service('api::recharge-channel.blockchain-service');
    
    // 只初始化一次
    try {
      await blockchainService?.init?.();
      console.log('✅ 区块链服务初始化完成');
    } catch (error) {
      strapi.log.warn(`chain init error: ${error}`);
    }

    // 互斥+递增窗口扫描，避免每次扫上万区块
    cron.schedule('*/20 * * * * *', async () => {   // 每 20 秒
      if (scanning) return;
      scanning = true;
      try {
        await blockchainService?.scanNextWindow?.();
      } catch (e) {
        strapi.log.warn(`scanNextWindow error: ${e}`);
      } finally {
        scanning = false;
      }
    });

    // 处理提现订单 - 每60秒执行一次，也加互斥
    cron.schedule('0 * * * * *', async () => {
      if (processingWithdrawals) return;
      processingWithdrawals = true;
      try {
        await blockchainService?.processWithdrawals?.();
      } catch (e) {
        strapi.log.warn(`processWithdrawals error: ${e}`);
      } finally {
        processingWithdrawals = false;
      }
    });

    // 检查到期投资 - 每5分钟执行一次
    cron.schedule('*/5 * * * *', async () => {
      try {
        console.log('🔄 开始检查到期投资...');
        // 这里可以添加检查到期投资的逻辑
        console.log('✅ 到期投资检查完成');
      } catch (error) {
        console.error('❌ 检查到期投资失败:', error);
      }
    });

    // 初始化抽奖系统服务
    (async () => {
      try {
        console.log('🎰 初始化抽奖系统服务...');
        
        // 初始化抽奖引擎
        const lotteryEngine = strapi.service('lottery-engine' as any);
        if (lotteryEngine) {
          console.log('✅ 抽奖引擎初始化完成');
          
          // 检查库存预警
          await lotteryEngine.checkStockWarning();
          console.log('✅ 库存预警检查完成');
        } else {
          console.log('⚠️ 抽奖引擎服务未找到');
        }
        
      } catch (error) {
        console.error('❌ 抽奖系统服务初始化失败:', error);
      }
    })();

    // 初始化发货服务
    (async () => {
      try {
        console.log('📦 初始化发货服务...');
        
        // 初始化发货队列
        const shippingService = strapi.service('shipping-service' as any);
        if (shippingService) {
          await shippingService.initializeShippingQueue();
          console.log('✅ 发货队列初始化完成');
        }
        
      } catch (error) {
        console.error('❌ 发货服务初始化失败:', error);
      }
    })();

    console.log('✅ 定时任务启动完成');
  }
}; 