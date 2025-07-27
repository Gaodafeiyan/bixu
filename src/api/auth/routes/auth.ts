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
    // 获取我的邀请码
    {
      method: 'GET',
      path: '/auth/my-invite-code',
      handler: 'auth.getMyInviteCode',
      config: {
        type: 'content-api',
        auth: {
          scope: ['authenticated'],
        },
        policies: [],
        middlewares: [],
      },
    },
    // 获取我的团队
    {
      method: 'GET',
      path: '/auth/my-team',
      handler: 'auth.getMyTeam',
      config: {
        type: 'content-api',
        auth: {
          scope: ['authenticated'],
        },
        policies: [],
        middlewares: [],
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