#!/bin/bash
# 降级到Strapi v4脚本

echo "🔄 降级到Strapi v4..."

cd /root/strapi-v5-ts

# 停止服务
pkill -f "strapi develop" || true

# 清理缓存
rm -rf .strapi dist node_modules/.cache

# 降级到v4
npm install @strapi/strapi@4.25.23 @strapi/plugin-users-permissions@4.25.23 @strapi/plugin-i18n@4.25.23 @strapi/plugin-cloud@4.25.23

# 恢复v4的中间件配置
cat > config/middlewares.ts << 'EOF'
export default ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https:'],
          'media-src': ["'self'", 'data:', 'blob:', 'https:'],
          objectSrc: ["'none'"],
          'script-src': ["'self'", "'unsafe-inline'"],
          'script-src-attr': ["'unsafe-inline'"],
          'style-src': ["'self'", "'unsafe-inline'"],
          'frame-ancestors': ["'self'"],
        },
        upgradeInsecureRequests: null,
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:3000', 'http://localhost:8080', 'http://118.107.4.158', 'http://118.107.4.158:3000', 'http://118.107.4.158:8080', 'https://118.107.4.158'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  'strapi::users-permissions',
];
EOF

# 重新构建
npm run build

# 启动服务
npm run develop

echo "✅ 已降级到Strapi v4.25.23"