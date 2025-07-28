export default {
  // 定时任务配置 - 每30秒执行一次
  cron: '*/30 * * * * *',
  
  // 任务处理函数
  async handler({ strapi }) {
    try {
      console.log('🔄 开始监控钱包交易...');
      
      // 调用充值通道服务监控交易
      await strapi.service('api::recharge-channel.recharge-channel').monitorWalletTransactions();
      
      console.log('✅ 钱包交易监控完成');
    } catch (error) {
      console.error('❌ 钱包交易监控失败:', error);
    }
  }
}; 