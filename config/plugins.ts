export default ({ env }) => ({
  'users-permissions': {
    config: {
      jwt: { 
        expiresIn: '7d',
        secret: env('JWT_SECRET', 'your-jwt-secret-key-here')
      },
      register: {
        defaultRole: 'authenticated'  // 设置默认角色
      }
    }
  }
});
