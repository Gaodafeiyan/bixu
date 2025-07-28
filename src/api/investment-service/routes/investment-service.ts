export default {
  type: 'content-api',
  routes: [
    // 手动触发投资完成处理
    {
      method: 'POST',
      path: '/investment-service/handle-completion',
      handler: 'investment-service.handleCompletion',
      config: { 
        type: 'content-api',
        auth: {},  // 需要登录
      },
    },
    // 手动触发邀请奖励处理
    {
      method: 'POST',
      path: '/investment-service/process-invitation-reward',
      handler: 'investment-service.processInvitationReward',
      config: { 
        type: 'content-api',
        auth: {},  // 需要登录
      },
    },
    // 手动触发到期投资检查
    {
      method: 'POST',
      path: '/investment-service/check-expired',
      handler: 'investment-service.checkExpiredInvestments',
      config: { 
        type: 'content-api',
        auth: {},  // 需要登录
      },
    },
    // 获取投资统计
    {
      method: 'GET',
      path: '/investment-service/stats',
      handler: 'investment-service.getInvestmentStats',
      config: { 
        type: 'content-api',
        auth: {},  // 需要登录
      },
    },
  ],
}; 