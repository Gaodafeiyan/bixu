#!/bin/bash

# 开发环境启动脚本
# 设置环境变量并启动Strapi

export NODE_ENV=development
export ENABLE_CHAIN_JOBS=true
export DEBUG_VERBOSE=1

echo "🔧 启动开发环境..."
echo "NODE_ENV: $NODE_ENV"
echo "ENABLE_CHAIN_JOBS: $ENABLE_CHAIN_JOBS"
echo "DEBUG_VERBOSE: $DEBUG_VERBOSE"

# 启动开发服务
echo "🌟 启动Strapi开发服务..."
yarn develop
