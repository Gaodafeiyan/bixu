export default {
  // 定时任务配置 - 每60秒执行一次
  cron: '0 * * * * *',
  
  // 任务处理函数
  async handler({ strapi }) {
    try {
      console.log('🔄 开始处理提现订单...');
      
      // 调用充值通道服务处理提现订单
      await strapi.service('api::recharge-channel.recharge-channel').processWithdrawalOrders();
      
      console.log('✅ 提现订单处理完成');
    } catch (error) {
      console.error('❌ 提现订单处理失败:', error);
    }
  }
}; 