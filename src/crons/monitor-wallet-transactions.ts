export default {
  // 定时任务配置 - 每30秒执行一次
  cron: '*/30 * * * * *',
  
  // 任务处理函数
  async handler({ strapi }) {
    try {
      console.log('🔄 开始监控钱包交易...');
      
      // 获取区块链服务
      const blockchainService = strapi.service('api::recharge-channel.blockchain-service');
      
      // 初始化区块链服务（如果未初始化）
      if (!blockchainService.web3) {
        await blockchainService.init();
      }

      // 扫描钱包交易
      const transactionCount = await blockchainService.scanNextWindow();

      if (typeof transactionCount === 'number') {
        if (transactionCount > 0) {
          console.log(`✅ 处理了 ${transactionCount} 笔交易`);
        } else {
          console.log('✅ 无新交易');
        }
      } else {
        console.log('✅ 钱包交易扫描完成');
      }
    } catch (error) {
      console.error('❌ 钱包交易监控失败:', error);
    }
  }
}; 