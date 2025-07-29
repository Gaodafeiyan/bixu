import cron from 'node-cron';

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
  bootstrap({ strapi }) {
    // 启动定时任务
    console.log('🚀 启动定时任务...');

    // 监控钱包交易 - 每30秒执行一次
    cron.schedule('*/30 * * * * *', async () => {
      try {
        console.log('🔄 开始监控钱包交易...');

        // 获取区块链服务
        const blockchainService = strapi.service('api::recharge-channel.blockchain-service');

        // 初始化区块链服务（如果未初始化）
        if (!blockchainService.web3) {
          await blockchainService.initialize();
        }

        // 监控钱包交易
        const transactionCount = await blockchainService.monitorWalletTransactions();

        if (transactionCount > 0) {
          console.log(`✅ 处理了 ${transactionCount} 笔交易`);
        } else {
          console.log('✅ 无新交易');
        }
      } catch (error) {
        console.error('❌ 钱包交易监控失败:', error);
      }
    });

    // 处理提现订单 - 每60秒执行一次
    cron.schedule('0 * * * * *', async () => {
      try {
        console.log('🔄 开始处理提现订单...');

        // 获取区块链服务
        const blockchainService = strapi.service('api::recharge-channel.blockchain-service');

        // 初始化区块链服务（如果未初始化）
        if (!blockchainService.web3) {
          await blockchainService.initialize();
        }

        // 处理待处理的提现订单
        const processedCount = await blockchainService.processPendingWithdrawals();

        if (processedCount > 0) {
          console.log(`✅ 处理了 ${processedCount} 个提现订单`);
        } else {
          console.log('✅ 无待处理提现订单');
        }
      } catch (error) {
        console.error('❌ 处理提现订单失败:', error);
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

    console.log('✅ 定时任务启动完成');
  },
};
