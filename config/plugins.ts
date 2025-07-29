export default () => ({
  'users-permissions': {
    config: {
      jwt: { 
        expiresIn: '7d',
        secret: process.env.JWT_SECRET || 'bixu-jwt-secret-2024'
      },
      register: {
        defaultRole: 'authenticated'  // 设置默认角色
      }
    }
  }
});
