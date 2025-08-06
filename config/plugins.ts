export default ({ env }) => ({
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d'
      },
      register: {
        defaultRole: 'authenticated'
      },
      // 禁用默认的注册路由，使用我们自定义的路由
      routes: {
        register: false
      }
    }
  },
  upload: {
    config: {
      provider: 'local',
    },
  },
});
