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
        auth: {},  // 空对象表示需要登录
      },
    },
    // 获取完整邀请信息
    {
      method: 'GET',
      path: '/auth/invite-info',
      handler: 'auth.getInviteInfo',
      config: {
        type: 'content-api',
        auth: {},  // 空对象表示需要登录
      },
    },
    // 生成邀请链接
    {
      method: 'GET',
      path: '/auth/generate-invite-link',
      handler: 'auth.generateInviteLink',
      config: {
        type: 'content-api',
        auth: {},  // 空对象表示需要登录
      },
    },
    // 生成邀请二维码
    {
      method: 'GET',
      path: '/auth/invite-qr-code',
      handler: 'auth.getInviteQRCode',
      config: {
        type: 'content-api',
        auth: {},  // 空对象表示需要登录
      },
    },
    // 记录分享行为
    {
      method: 'POST',
      path: '/auth/track-invite-share',
      handler: 'auth.trackInviteShare',
      config: {
        type: 'content-api',
        auth: {},  // 空对象表示需要登录
      },
    },
    // 获取我的团队
    {
      method: 'GET',
      path: '/auth/my-team',
      handler: 'auth.getMyTeam',
      config: {
        type: 'content-api',
        auth: {},  // 空对象表示需要登录
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
    // APK下载路由
    {
      method: 'GET',
      path: '/auth/download-apk',
      handler: 'auth.downloadApk',
      config: {
        type: 'content-api',
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // 下载页面路由
    {
      method: 'GET',
      path: '/auth/download',
      handler: 'auth.downloadPage',
      config: {
        type: 'content-api',
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 