export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  jwt: {
    secret: env('JWT_SECRET', 'your-jwt-secret-key-here'),
  },
  // 添加静态文件服务配置
  static: {
    enabled: true,
path: '/',
directory: './public',
},
});

