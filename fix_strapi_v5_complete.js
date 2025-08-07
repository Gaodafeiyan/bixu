const fs = require('fs');
const path = require('path');

console.log('🔧 完整修复Strapi v5兼容性问题...\n');

// 1. 更新package.json为v5版本
const updatePackageJson = () => {
  console.log('1. 更新package.json为Strapi v5...');
  
  const packagePath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // 更新为v5版本
  packageJson.dependencies['@strapi/strapi'] = '5.0.0';
  packageJson.dependencies['@strapi/plugin-users-permissions'] = '5.0.0';
  packageJson.dependencies['@strapi/plugin-i18n'] = '5.0.0';
  packageJson.dependencies['@strapi/plugin-cloud'] = '5.0.0';
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ 已更新package.json为v5版本');
};

// 2. 创建v5兼容的中间件配置
const createV5Middlewares = () => {
  console.log('\n2. 创建v5兼容的中间件配置...');
  
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
  // v5中users-permissions中间件配置
  {
    name: 'strapi::users-permissions',
    config: {
      // v5特定配置
    },
  },
];`;

  fs.writeFileSync(path.join(__dirname, 'config', 'middlewares.ts'), v5Middlewares);
  console.log('✅ 已更新middlewares.ts为v5兼容配置');
};

// 3. 创建v5兼容的插件配置
const createV5Plugins = () => {
  console.log('\n3. 创建v5兼容的插件配置...');
  
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

// 4. 创建v5兼容的数据库配置
const createV5DatabaseConfig = () => {
  console.log('\n4. 创建v5兼容的数据库配置...');
  
  const v5Database = `export default ({ env }) => ({
  connection: {
    client: env('DATABASE_CLIENT', 'postgres'),
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'bixu'),
      user: env('DATABASE_USERNAME', 'postgres'),
      password: env('DATABASE_PASSWORD', ''),
      ssl: env.bool('DATABASE_SSL', false) ? {
        rejectUnauthorized: env.bool('DATABASE_SSL_SELF', false),
      } : false,
    },
    pool: {
      min: env.int('DATABASE_POOL_MIN', 2),
      max: env.int('DATABASE_POOL_MAX', 10),
    },
    acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    debug: env.bool('DATABASE_DEBUG', false),
  },
});`;

  fs.writeFileSync(path.join(__dirname, 'config', 'database.ts'), v5Database);
  console.log('✅ 已更新database.ts为v5兼容配置');
};

// 5. 创建服务器修复脚本
const createServerFixScript = () => {
  console.log('\n5. 创建服务器修复脚本...');
  
  const serverScript = `#!/bin/bash
# 完整服务器修复脚本

echo "🔧 开始修复Strapi v5兼容性问题..."

cd /root/strapi-v5-ts

# 停止当前服务
echo "停止当前服务..."
pkill -f "strapi develop" || true
pkill -f "yarn develop" || true
pkill -f "npm run develop" || true

# 清理缓存和构建文件
echo "清理缓存..."
rm -rf .strapi dist node_modules/.cache .cache

# 删除node_modules重新安装
echo "重新安装依赖..."
rm -rf node_modules package-lock.json yarn.lock
npm install

# 重新构建
echo "重新构建..."
npm run build

# 启动服务
echo "启动服务..."
npm run develop

echo "✅ 修复完成！"
echo "如果仍有问题，请检查日志输出。"`;

  fs.writeFileSync(path.join(__dirname, 'server_fix_complete.sh'), serverScript);
  console.log('✅ 已生成完整服务器修复脚本: server_fix_complete.sh');
};

// 6. 创建降级到v4的脚本
const createDowngradeScript = () => {
  console.log('\n6. 创建降级到v4的脚本...');
  
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

# 重新构建
npm run build

# 启动服务
npm run develop

echo "✅ 已降级到Strapi v4.25.23"`;

  fs.writeFileSync(path.join(__dirname, 'downgrade_to_v4.sh'), downgradeScript);
  console.log('✅ 已生成降级脚本: downgrade_to_v4.sh');
};

// 7. 创建Git提交脚本
const createGitCommitScript = () => {
  console.log('\n7. 创建Git提交脚本...');
  
  const gitScript = `#!/bin/bash
# Git提交脚本

echo "🔧 准备提交v5兼容性修复..."

# 添加所有更改
git add .

# 提交修复
git commit -m "修复Strapi v5兼容性问题

- 更新package.json为v5版本
- 更新middlewares.ts为v5兼容配置
- 更新plugins.ts为v5兼容配置
- 更新database.ts为v5兼容配置
- 添加服务器修复脚本
- 添加降级到v4的备选方案"

# 推送到远程仓库
git push origin main

echo "✅ 修复已提交到Git"
echo "🚀 请在服务器上运行: bash server_fix_complete.sh"
echo "🔄 如果v5仍有问题，运行: bash downgrade_to_v4.sh"`;

  fs.writeFileSync(path.join(__dirname, 'git_commit_v5.sh'), gitScript);
  console.log('✅ 已生成Git提交脚本: git_commit_v5.sh');
};

// 8. 创建环境检查脚本
const createEnvCheckScript = () => {
  console.log('\n8. 创建环境检查脚本...');
  
  const envScript = `#!/bin/bash
# 环境检查脚本

echo "🔍 检查环境配置..."

# 检查.env文件
if [ ! -f ".env" ]; then
  echo "❌ .env文件不存在"
  echo "创建.env文件..."
  cat > .env << EOF
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys-here
API_TOKEN_SALT=your-api-token-salt-here
ADMIN_JWT_SECRET=your-admin-jwt-secret-here
JWT_SECRET=your-jwt-secret-here

# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=bixu
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-password-here
DATABASE_SSL=false

# 其他配置
NODE_ENV=development
EOF
  echo "✅ 已创建.env文件"
else
  echo "✅ .env文件存在"
fi

# 检查必要环境变量
required_vars=("JWT_SECRET" "DATABASE_HOST" "DATABASE_NAME" "DATABASE_USERNAME" "DATABASE_PASSWORD")
for var in "\${required_vars[@]}"; do
  if grep -q "^$var=" .env; then
    echo "✅ \$var已配置"
  else
    echo "❌ \$var未配置"
  fi
done

echo "🔍 环境检查完成"`;

  fs.writeFileSync(path.join(__dirname, 'check_env_v5.sh'), envScript);
  console.log('✅ 已生成环境检查脚本: check_env_v5.sh');
};

// 执行完整修复
const runCompleteFix = () => {
  try {
    updatePackageJson();
    createV5Middlewares();
    createV5Plugins();
    createV5DatabaseConfig();
    createServerFixScript();
    createDowngradeScript();
    createGitCommitScript();
    createEnvCheckScript();
    
    console.log('\n🎉 完整修复完成！');
    console.log('\n📋 下一步操作：');
    console.log('1. 运行: bash git_commit_v5.sh');
    console.log('2. 在服务器上运行: bash server_fix_complete.sh');
    console.log('3. 检查环境: bash check_env_v5.sh');
    console.log('4. 如果v5仍有问题，运行: bash downgrade_to_v4.sh');
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error.message);
  }
};

runCompleteFix(); 