const fs = require('fs');
const path = require('path');

console.log('🔧 修复Strapi v5中间件配置...\n');

// 1. 创建正确的v5中间件配置
const createCorrectV5Middlewares = () => {
  console.log('1. 创建正确的v5中间件配置...');
  
  // 在v5中，users-permissions中间件可能需要不同的配置方式
  const v5Middlewares = `export default ({ env }) => [
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
  // 在v5中，users-permissions中间件可能需要作为插件中间件
  // 或者完全移除，让插件自己处理
];`;

  fs.writeFileSync(path.join(__dirname, 'config', 'middlewares.ts'), v5Middlewares);
  console.log('✅ 已更新middlewares.ts，移除了users-permissions中间件');
};

// 2. 创建v5兼容的插件配置
const createV5PluginsConfig = () => {
  console.log('\n2. 创建v5兼容的插件配置...');
  
  const v5Plugins = `export default ({ env }) => ({
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
        secret: env('JWT_SECRET', 'your-jwt-secret-key-here')
      },
      register: {
        enabled: false,
        defaultRole: 'authenticated'
      },
      routes: {
        register: false,
        'auth/register': false
      }
    }
  },
  upload: {
    config: {
      provider: 'local',
    },
  },
});`;

  fs.writeFileSync(path.join(__dirname, 'config', 'plugins.ts'), v5Plugins);
  console.log('✅ 已更新plugins.ts为v5兼容配置');
};

// 3. 创建服务器修复脚本
const createServerFixScript = () => {
  console.log('\n3. 创建服务器修复脚本...');
  
  const serverScript = `#!/bin/bash
# 修复Strapi v5中间件问题

echo "🔧 修复Strapi v5中间件配置..."

cd /root/strapi-v5-ts

# 停止当前服务
echo "停止当前服务..."
pkill -f "strapi develop" || true
pkill -f "yarn develop" || true
pkill -f "npm run develop" || true

# 清理缓存
echo "清理缓存..."
rm -rf .strapi dist node_modules/.cache .cache

# 重新安装依赖
echo "重新安装依赖..."
npm install

# 重新构建
echo "重新构建..."
npm run build

# 启动服务
echo "启动服务..."
npm run develop

echo "✅ 修复完成！"
echo "如果仍有问题，请检查日志输出。"`;

  fs.writeFileSync(path.join(__dirname, 'fix_v5_middleware.sh'), serverScript);
  console.log('✅ 已生成服务器修复脚本: fix_v5_middleware.sh');
};

// 4. 创建降级到v4的脚本
const createDowngradeScript = () => {
  console.log('\n4. 创建降级到v4的脚本...');
  
  const downgradeScript = `#!/bin/bash
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

echo "✅ 已降级到Strapi v4.25.23"`;

  fs.writeFileSync(path.join(__dirname, 'downgrade_to_v4_final.sh'), downgradeScript);
  console.log('✅ 已生成降级脚本: downgrade_to_v4_final.sh');
};

// 5. 创建Git提交脚本
const createGitCommitScript = () => {
  console.log('\n5. 创建Git提交脚本...');
  
  const gitScript = `#!/bin/bash
# Git提交脚本

echo "🔧 准备提交v5中间件修复..."

# 添加所有更改
git add .

# 提交修复
git commit -m "修复Strapi v5中间件配置

- 移除strapi::users-permissions中间件（v5中由插件自动处理）
- 更新middlewares.ts为v5兼容配置
- 更新plugins.ts为v5兼容配置
- 添加服务器修复脚本
- 添加降级到v4的备选方案"

# 推送到远程仓库
git push origin main

echo "✅ 修复已提交到Git"
echo "🚀 请在服务器上运行: bash fix_v5_middleware.sh"
echo "🔄 如果v5仍有问题，运行: bash downgrade_to_v4_final.sh"`;

  fs.writeFileSync(path.join(__dirname, 'git_commit_v5_fix.sh'), gitScript);
  console.log('✅ 已生成Git提交脚本: git_commit_v5_fix.sh');
};

// 执行修复
const runFix = () => {
  try {
    createCorrectV5Middlewares();
    createV5PluginsConfig();
    createServerFixScript();
    createDowngradeScript();
    createGitCommitScript();
    
    console.log('\n🎉 v5中间件修复完成！');
    console.log('\n📋 下一步操作：');
    console.log('1. 运行: bash git_commit_v5_fix.sh');
    console.log('2. 在服务器上运行: bash fix_v5_middleware.sh');
    console.log('3. 如果v5仍有问题，运行: bash downgrade_to_v4_final.sh');
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error.message);
  }
};

runFix(); 