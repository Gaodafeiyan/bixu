export default () => ({
  'users-permissions': {
    config: {
      jwt: { 
        expiresIn: '7d',
        secret: process.env.JWT_SECRET || 'your-jwt-secret-key-here'
      },
      register: {
        defaultRole: 'authenticated'  // 设置默认角色
      }
    }
  }
});
