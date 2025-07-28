export default {
  // 定时任务配置 - 每60秒执行一次
  cron: '0 * * * * *',
  
  // 任务处理函数
  async handler({ strapi }) {
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
      console.error('❌ 提现订单处理失败:', error);
    }
  }
}; 