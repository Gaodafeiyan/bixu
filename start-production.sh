#!/bin/bash

# 生产环境启动脚本
# 设置环境变量并启动Strapi

export NODE_ENV=production
export ENABLE_CHAIN_JOBS=true
export DEBUG_VERBOSE=0

echo "🚀 启动生产环境..."
echo "NODE_ENV: $NODE_ENV"
echo "ENABLE_CHAIN_JOBS: $ENABLE_CHAIN_JOBS"
echo "DEBUG_VERBOSE: $DEBUG_VERBOSE"

# 构建项目
echo "📦 构建项目..."
yarn build

# 启动服务
echo "🌟 启动Strapi服务..."
yarn start
