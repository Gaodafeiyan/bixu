export default {
  type: 'content-api',
  routes: [
    // 获取限购设置
    {
      method: 'GET',
      path: '/system-configs/limit-settings',
      handler: 'system-config.getLimitSettings',
      config: {
        auth: false,
      },
    },
    // 更新限购设置
    {
      method: 'PUT',
      path: '/system-configs/limit-settings',
      handler: 'system-config.updateLimitSettings',
      config: {
        auth: false,
      },
    },
    // 获取每日投资统计
    {
      method: 'GET',
      path: '/system-configs/daily-stats',
      handler: 'system-config.getDailyInvestmentStats',
      config: {
        auth: false,
      },
    },
    // 手动重置每日限购计数
    {
      method: 'POST',
      path: '/system-configs/reset-daily-counts',
      handler: 'system-config.resetDailyCounts',
      config: {
        auth: false,
      },
    },
    // 重置指定计划的每日限购计数
    {
      method: 'POST',
      path: '/system-configs/reset-daily-counts/:planId',
      handler: 'system-config.resetDailyCounts',
      config: {
        auth: false,
      },
    },
    // 默认的CRUD路由
    {
      method: 'GET',
      path: '/system-configs',
      handler: 'system-config.find',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/system-configs',
      handler: 'system-config.create',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/system-configs/:id',
      handler: 'system-config.findOne',
      config: {
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/system-configs/:id',
      handler: 'system-config.update',
      config: {
        auth: false,
      },
    },
    {
      method: 'DELETE',
      path: '/system-configs/:id',
      handler: 'system-config.delete',
      config: {
        auth: false,
      },
    },
  ],
}; 