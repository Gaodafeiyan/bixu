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
    // 用户登录 - 添加缺失的登录路由
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
    // 获取我的邀请码
    {
      method: 'GET',
      path: '/auth/my-invite-code',
      handler: 'auth.getMyInviteCode',
      config: {
        auth: {},  // 空对象表示需要登录
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
    // 生成邀请链接
    {
      method: 'GET',
      path: '/auth/generate-invite-link',
      handler: 'auth.generateInviteLink',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    // 生成邀请二维码
    {
      method: 'GET',
      path: '/auth/invite-qr-code',
      handler: 'auth.getInviteQRCode',
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
    // 修改密码
    {
      method: 'PUT',
      path: '/auth/change-password',
      handler: 'auth.changePassword',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    // 获取我的团队
    {
      method: 'GET',
      path: '/auth/my-team',
      handler: 'auth.getMyTeam',
      config: {
        auth: {},  // 空对象表示需要登录
      },
    },
    // 验证邀请码
    {
      method: 'GET',
      path: '/auth/validate-invite-code/:inviteCode',
      handler: 'auth.validateInviteCode',
      config: {
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
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // 纯 HTTPS 邀请链接路由
    {
      method: 'GET',
      path: '/invite/:inviteCode',
      handler: 'auth.invitePage',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // 直接 AppLink 路由（不经过 API 前缀）
    {
      method: 'GET',
      path: '/invite/:inviteCode',
      handler: 'auth.invitePage',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // H5注册页面路由 - 修复路径
    {
      method: 'GET',
      path: '/auth/register',
      handler: 'auth.registerPage',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // 重定向旧路径到新路径
    {
      method: 'GET',
      path: '/register',
      handler: 'auth.redirectToRegister',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // 更新用户资料
    {
      method: 'PUT',
      path: '/auth/update-profile',
      handler: 'auth.updateProfile',
      config: {
        auth: {},
      },
    },
    // 安全设置
    {
      method: 'GET',
      path: '/auth/security-settings',
      handler: 'auth.getSecuritySettings',
      config: {
        auth: {},
      },
    },
    {
      method: 'PUT',
      path: '/auth/security-settings',
      handler: 'auth.updateSecuritySettings',
      config: {
        auth: {},
      },
    },

    // 应用设置
    {
      method: 'GET',
      path: '/auth/app-settings',
      handler: 'auth.getAppSettings',
      config: {
        auth: {},
      },
    },
    {
      method: 'PUT',
      path: '/auth/app-settings',
      handler: 'auth.updateAppSettings',
      config: {
        auth: {},
      },
    },


  ],
}; 