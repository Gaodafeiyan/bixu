#!/bin/bash
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
echo "如果仍有问题，请检查日志输出。"