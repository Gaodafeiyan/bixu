export default {
  type: 'content-api',
  routes: [
    // 健康检查路由
    {
      method: 'GET',
      path: '/health',
      handler: 'auth.health',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // 邀请注册
    {
      method: 'POST',
      path: '/auth/invite-register',
      handler: 'auth.inviteRegister',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // 用户登录
    {
      method: 'POST',
      path: '/auth/local',
      handler: 'auth.local',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // 获取完整邀请信息
    {
      method: 'GET',
      path: '/auth/invite-info',
      handler: 'auth.getInviteInfo',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    // 获取团队信息
    {
      method: 'GET',
      path: '/auth/team-info',
      handler: 'auth.getTeamInfo',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    // 获取收益信息
    {
      method: 'GET',
      path: '/auth/reward-info',
      handler: 'auth.getRewardInfo',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    // 获取当前档位信息
    {
      method: 'GET',
      path: '/auth/current-tier-info',
      handler: 'auth.getCurrentTierInfo',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    // 记录分享行为
    {
      method: 'POST',
      path: '/auth/track-invite-share',
      handler: 'auth.trackInviteShare',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    // 更新用户资料
    {
      method: 'PUT',
      path: '/auth/update-profile',
      handler: 'auth.updateProfile',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    // 获取安全设置
    {
      method: 'GET',
      path: '/auth/security-settings',
      handler: 'auth.getSecuritySettings',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    // 更新安全设置
    {
      method: 'PUT',
      path: '/auth/security-settings',
      handler: 'auth.updateSecuritySettings',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    // 获取应用设置
    {
      method: 'GET',
      path: '/auth/app-settings',
      handler: 'auth.getAppSettings',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    // 更新应用设置
    {
      method: 'PUT',
      path: '/auth/app-settings',
      handler: 'auth.updateAppSettings',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    // 获取团队订单信息
    {
      method: 'GET',
      path: '/auth/team-orders',
      handler: 'auth.getTeamOrders',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
  ],
}; 