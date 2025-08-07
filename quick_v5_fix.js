const fs = require('fs');
const path = require('path');

console.log('🔧 快速修复Strapi v5问题...\n');

// 1. 移除users-permissions中间件（在v5中由插件自动处理）
const removeUsersPermissionsMiddleware = () => {
  console.log('1. 移除users-permissions中间件...');
  
  const middlewaresPath = path.join(__dirname, 'config', 'middlewares.ts');
  let content = fs.readFileSync(middlewaresPath, 'utf8');
  
  // 移除strapi::users-permissions中间件
  content = content.replace(/,\s*'strapi::users-permissions',?\s*\/\/.*$/gm, '');
  content = content.replace(/,\s*{\s*name:\s*'strapi::users-permissions'.*?},?\s*$/gm, '');
  
  fs.writeFileSync(middlewaresPath, content);
  console.log('✅ 已移除users-permissions中间件');
};

// 2. 创建服务器修复命令
const createServerCommands = () => {
  console.log('\n2. 创建服务器修复命令...');
  
  const commands = `#!/bin/bash
# 快速修复Strapi v5问题

echo "🔧 快速修复Strapi v5中间件问题..."

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

echo "✅ 修复完成！"`;

  fs.writeFileSync(path.join(__dirname, 'quick_fix_v5.sh'), commands);
  console.log('✅ 已生成快速修复脚本: quick_fix_v5.sh');
};

// 3. 创建Git提交脚本
const createGitScript = () => {
  console.log('\n3. 创建Git提交脚本...');
  
  const gitScript = `#!/bin/bash
# Git提交脚本

echo "🔧 准备提交快速修复..."

# 添加所有更改
git add .

# 提交修复
git commit -m "快速修复Strapi v5中间件问题

- 移除strapi::users-permissions中间件（v5中由插件自动处理）
- 解决middlewareFactory is not a function错误"

# 推送到远程仓库
git push origin main

echo "✅ 修复已提交到Git"
echo "🚀 请在服务器上运行: bash quick_fix_v5.sh"`;

  fs.writeFileSync(path.join(__dirname, 'git_quick_fix.sh'), gitScript);
  console.log('✅ 已生成Git提交脚本: git_quick_fix.sh');
};

// 执行修复
const runQuickFix = () => {
  try {
    removeUsersPermissionsMiddleware();
    createServerCommands();
    createGitScript();
    
    console.log('\n🎉 快速修复完成！');
    console.log('\n📋 下一步操作：');
    console.log('1. 运行: bash git_quick_fix.sh');
    console.log('2. 在服务器上运行: bash quick_fix_v5.sh');
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error.message);
  }
};

runQuickFix(); 