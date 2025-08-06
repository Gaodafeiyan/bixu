export default ({ env }) => ({
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d'
      },
      register: {
        enabled: false,      // 彻底关掉默认注册
        defaultRole: 'authenticated'
      },
      // 禁用默认的注册路由，使用我们自定义的路由
      routes: {
        register: false,
        'auth/register': false  // 明确禁用 /api/auth/register 路由
      }
    }
  },
  upload: {
    config: {
      provider: 'local',
    },
  },
});
