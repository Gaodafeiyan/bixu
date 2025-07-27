export default {
  type: 'content-api',
  routes: [
    // 邀请注册
    {
      method: 'POST',
      path: '/auth/invite-register',
      handler: 'auth.inviteRegister',
      config: {
        type: 'content-api',
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // 用户登录 - 添加缺失的登录路由
    {
      method: 'POST',
      path: '/auth/local',
      handler: 'auth.local',
      config: {
        type: 'content-api',
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // 获取我的邀请码
    {
      method: 'GET',
      path: '/auth/my-invite-code',
      handler: 'auth.getMyInviteCode',
      config: {
        type: 'content-api',
        auth: true,  // 简化为只要求登录
      },
    },
    // 获取我的团队
    {
      method: 'GET',
      path: '/auth/my-team',
      handler: 'auth.getMyTeam',
      config: {
        type: 'content-api',
        auth: true,  // 简化为只要求登录
      },
    },
    // 验证邀请码
    {
      method: 'GET',
      path: '/auth/validate-invite-code/:inviteCode',
      handler: 'auth.validateInviteCode',
      config: {
        type: 'content-api',
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 