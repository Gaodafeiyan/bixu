#!/bin/bash

echo "🔧 开始完整修复 Strapi v4 版本..."

# 1. 切换到v4稳定版
echo "📦 切换到 Strapi v4 稳定版..."
cp package-production.json package.json

# 2. 清理依赖
echo "🧹 清理旧依赖..."
rm -rf node_modules yarn.lock

# 3. 安装v4依赖
echo "📥 安装 Strapi v4 依赖..."
yarn install

# 4. 安装decimal.js
echo "📊 安装 decimal.js..."
yarn add decimal.js

# 5. 清理构建缓存
echo "🗑️ 清理构建缓存..."
yarn build --clean

# 6. 重新生成类型定义
echo "🔄 重新生成类型定义..."
yarn strapi ts:generate-types

echo "✅ 修复完成！现在可以运行 yarn develop"
echo "🚀 启动命令: yarn develop" 