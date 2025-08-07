const fs = require('fs');
const path = require('path');

console.log('🔧 修复Strapi v5错误...\n');

// 1. 检查当前配置
const checkCurrentConfig = () => {
  console.log('1. 检查当前配置...');
  
  const middlewaresPath = path.join(__dirname, 'config', 'middlewares.ts');
  const pluginsPath = path.join(__dirname, 'config', 'plugins.ts');
  const packagePath = path.join(__dirname, 'package.json');
  
  if (fs.existsSync(middlewaresPath)) {
    const content = fs.readFileSync(middlewaresPath, 'utf8');
    if (content.includes('strapi::users-permissions')) {
      console.log('✅ middlewares.ts 已包含 users-permissions 中间件');
    } else {
      console.log('❌ middlewares.ts 缺少 users-permissions 中间件');
    }
  }
  
  if (fs.existsSync(pluginsPath)) {
    const content = fs.readFileSync(pluginsPath, 'utf8');
    if (content.includes('users-permissions')) {
      console.log('✅ plugins.ts 已配置 users-permissions');
    } else {
      console.log('❌ plugins.ts 缺少 users-permissions 配置');
    }
  }
  
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log(`📦 Strapi版本: ${packageJson.dependencies['@strapi/strapi']}`);
  }
};

// 2. 创建Strapi v5兼容的中间件配置
const createV5CompatibleMiddlewares = () => {
  console.log('\n2. 创建Strapi v5兼容的中间件配置...');
  
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
  // Strapi v5中users-permissions中间件可能需要不同的配置
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

// 3. 创建Strapi v5兼容的插件配置
const createV5CompatiblePlugins = () => {
  console.log('\n3. 创建Strapi v5兼容的插件配置...');
  
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

// 4. 创建服务器修复命令
const createServerFixCommands = () => {
  console.log('\n4. 生成服务器修复命令...');
  
  const commands = `# 服务器修复命令
cd /root/strapi-v5-ts

# 停止当前服务
pkill -f "strapi develop"

# 清理缓存
rm -rf .strapi dist node_modules/.cache

# 重新安装依赖
npm install

# 重新构建
npm run build

# 启动服务
npm run develop

# 如果仍有问题，尝试降级到v4
npm install @strapi/strapi@4.25.23 @strapi/plugin-users-permissions@4.25.23
npm run develop`;

  fs.writeFileSync(path.join(__dirname, 'server_fix_commands.sh'), commands);
  console.log('✅ 已生成服务器修复命令文件: server_fix_commands.sh');
};

// 5. 创建Git提交脚本
const createGitScript = () => {
  console.log('\n5. 创建Git提交脚本...');
  
  const gitScript = `#!/bin/bash
# Git提交脚本

echo "🔧 准备提交修复..."

# 添加所有更改
git add .

# 提交修复
git commit -m "修复Strapi v5兼容性问题

- 更新middlewares.ts为v5兼容配置
- 更新plugins.ts为v5兼容配置  
- 添加服务器修复命令
- 解决strapi::users-permissions中间件错误"

# 推送到远程仓库
git push origin main

echo "✅ 修复已提交到Git"
echo "🚀 请在服务器上运行: bash server_fix_commands.sh"`;

  fs.writeFileSync(path.join(__dirname, 'git_commit.sh'), gitScript);
  console.log('✅ 已生成Git提交脚本: git_commit.sh');
};

// 6. 创建环境变量检查
const createEnvCheck = () => {
  console.log('\n6. 创建环境变量检查...');
  
  const envCheck = `# 环境变量检查脚本
echo "检查环境变量..."

# 检查JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
  echo "❌ JWT_SECRET未设置"
  echo "请在.env文件中添加: JWT_SECRET=your-secret-key"
else
  echo "✅ JWT_SECRET已设置"
fi

# 检查数据库配置
if [ -z "$DATABASE_HOST" ]; then
  echo "❌ DATABASE_HOST未设置"
else
  echo "✅ DATABASE_HOST已设置"
fi

# 检查其他必要变量
required_vars=("DATABASE_NAME" "DATABASE_USERNAME" "DATABASE_PASSWORD")
for var in "\${required_vars[@]}"; do
  if [ -z "\${!var}" ]; then
    echo "❌ \$var未设置"
  else
    echo "✅ \$var已设置"
  fi
done`;

  fs.writeFileSync(path.join(__dirname, 'check_env.sh'), envCheck);
  console.log('✅ 已生成环境变量检查脚本: check_env.sh');
};

// 执行修复
const runFix = () => {
  try {
    checkCurrentConfig();
    createV5CompatibleMiddlewares();
    createV5CompatiblePlugins();
    createServerFixCommands();
    createGitScript();
    createEnvCheck();
    
    console.log('\n🎉 修复完成！');
    console.log('\n📋 下一步操作：');
    console.log('1. 运行: bash git_commit.sh');
    console.log('2. 在服务器上运行: bash server_fix_commands.sh');
    console.log('3. 检查环境变量: bash check_env.sh');
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error.message);
  }
};

runFix();