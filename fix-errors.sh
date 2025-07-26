#!/bin/bash

echo "🔧 开始修复Strapi编译错误..."

# 1. 安装decimal.js依赖
echo "📦 安装decimal.js依赖..."
yarn add decimal.js

# 2. 清理并重新构建
echo "🧹 清理构建缓存..."
yarn build --clean

# 3. 重新生成类型定义
echo "🔄 重新生成类型定义..."
yarn strapi ts:generate-types

echo "✅ 修复完成！现在可以尝试运行 yarn develop" 