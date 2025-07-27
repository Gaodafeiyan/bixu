export default {
  type: 'content-api',
  routes: [
    // 公开测试路由
    {
      method: 'GET',
      path: '/dinggou-jihuas/health',
      handler: 'dinggou-jihua.testConnection',
      config: {
        type: 'content-api',
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // 自定义路由
    {
      method: 'POST',
      path: '/dinggou-jihuas/:planId/invest',
      handler: 'dinggou-jihua.invest',
      config: { 
        type: 'content-api',
        auth: true
      },
    },
    {
      method: 'POST',
      path: '/dinggou-jihuas/:orderId/redeem',
      handler: 'dinggou-jihua.redeem',
      config: { 
        type: 'content-api',
        auth: true
      },
    },
    {
      method: 'GET',
      path: '/dinggou-jihuas/:planId/stats',
      handler: 'dinggou-jihua.getPlanStats',
      config: { 
        type: 'content-api',
        auth: true
      },
    },
    {
      method: 'GET',
      path: '/dinggou-jihuas/my-investments',
      handler: 'dinggou-jihua.getMyInvestments',
      config: { 
        type: 'content-api',
        auth: true
      },
    },
    // 获取计划参与者列表
    {
      method: 'GET',
      path: '/dinggou-jihuas/:planId/participants',
      handler: 'dinggou-jihua.getPlanParticipants',
      config: { 
        type: 'content-api',
        auth: true
      },
    },
    // 默认的CRUD路由
    {
      method: 'GET',
      path: '/dinggou-jihuas',
      handler: 'dinggou-jihua.find',
      config: {
        auth: false,  // 临时允许公开访问用于测试
      },
    },
    {
      method: 'GET',
      path: '/dinggou-jihuas/:id',
      handler: 'dinggou-jihua.findOne',
    },
    {
      method: 'POST',
      path: '/dinggou-jihuas',
      handler: 'dinggou-jihua.create',
    },
    {
      method: 'PUT',
      path: '/dinggou-jihuas/:id',
      handler: 'dinggou-jihua.update',
    },
    {
      method: 'DELETE',
      path: '/dinggou-jihuas/:id',
      handler: 'dinggou-jihua.delete',
    },
  ],
}; 