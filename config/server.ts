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
  // 修改静态文件服务配置
  static: {
    enabled: true,
    path: '/public',
    directory: './public',
  },
});
