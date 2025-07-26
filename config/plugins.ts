export default () => ({
  'users-permissions': {
    config: {
      jwt: { 
        expiresIn: '7d' 
      },
      register: {
        defaultRole: 'authenticated'  // 设置默认角色
      }
    }
  }
});
