export default {
  // 定时任务配置
  cron: '*/5 * * * *', // 每5分钟执行一次
  
  // 任务处理函数
  async handler({ strapi }) {
    try {
      console.log('🕐 开始检查到期投资...');
      
      // 调用投资服务检查到期投资
      await strapi.service('investment-service').checkAndProcessExpiredInvestments();
      
      console.log('✅ 到期投资检查完成');
    } catch (error) {
      console.error('❌ 到期投资检查失败:', error);
    }
  }
}; 