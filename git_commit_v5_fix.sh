#!/bin/bash
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
echo "🔄 如果v5仍有问题，运行: bash downgrade_to_v4_final.sh"