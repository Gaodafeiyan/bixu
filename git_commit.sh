#!/bin/bash
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
echo "🚀 请在服务器上运行: bash server_fix_commands.sh"