#!/bin/bash

echo "========================================"
echo "批量安装所有缺失依赖"
echo "========================================"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/root/strapi-v4-ts"

echo -e "${BLUE}进入项目目录...${NC}"
cd "$PROJECT_DIR" || exit 1
echo -e "${GREEN}✓ 当前目录: $(pwd)${NC}"
echo ""

echo -e "${BLUE}停止 PM2 服务...${NC}"
pm2 stop bixu-api
pm2 delete bixu-api 2>/dev/null
echo ""

echo -e "${BLUE}安装所有缺失的依赖包...${NC}"
echo ""

# 已知缺失的依赖列表
DEPENDENCIES=(
    "node-cron"
    "qrcode"
    "ioredis"
    "web3"
    "axios"
    "bcryptjs"
    "jsonwebtoken"
    "moment"
    "uuid@9.0.1"
    "lodash"
    "multer"
    "nodemailer"
    "crypto-js"
    "express-rate-limit"
    "@types/node"
    "@types/node-cron"
    "@types/qrcode"
)

echo "将安装以下依赖包："
printf '%s\n' "${DEPENDENCIES[@]}"
echo ""

# 批量安装
npm install "${DEPENDENCIES[@]}"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 依赖包安装成功${NC}"
else
    echo -e "${RED}✗ 部分依赖包安装失败，继续...${NC}"
fi
echo ""

echo -e "${BLUE}运行 npm install 确保所有依赖完整...${NC}"
npm install
echo ""

echo -e "${BLUE}检查 package.json 中的依赖...${NC}"
cat package.json | grep -A 30 '"dependencies"'
echo ""

echo -e "${BLUE}重新启动服务...${NC}"

# 找到 ecosystem 配置或使用默认启动
if [ -f "ecosystem.config.js" ]; then
    echo "使用 ecosystem.config.js 启动..."
    pm2 start ecosystem.config.js
elif [ -f "package.json" ]; then
    echo "使用 npm start 启动..."
    pm2 start npm --name "bixu-api" -- start
else
    echo -e "${RED}无法找到启动配置${NC}"
    exit 1
fi

echo ""
echo "等待服务启动 (10秒)..."
sleep 10
echo ""

echo "========================================"
echo "检查服务状态"
echo "========================================"
pm2 list
echo ""

echo "查看最新日志..."
pm2 logs bixu-api --lines 50 --nostream
echo ""

echo "========================================"
echo "检查端口监听"
echo "========================================"
if netstat -tlnp | grep -q ":1337"; then
    echo -e "${GREEN}✓ 端口 1337 正在监听${NC}"
    netstat -tlnp | grep ":1337"
    echo ""

    echo "测试后端连接..."
    sleep 2
    curl -I http://localhost:1337 2>&1 | head -5
    echo ""

    echo -e "${GREEN}========================================"
    echo "✓ 修复成功！服务正常运行"
    echo "========================================${NC}"
    echo ""
    echo "接下来："
    echo "1. 重启 Nginx:"
    echo "   sudo systemctl restart nginx"
    echo ""
    echo "2. 测试网站访问"
    echo ""
    echo "3. 查看实时日志:"
    echo "   pm2 logs bixu-api"

else
    echo -e "${RED}✗ 端口 1337 未监听，服务启动失败${NC}"
    echo ""
    echo "查看完整错误日志："
    echo "  pm2 logs bixu-api --lines 200"
    echo ""
    echo "可能的原因："
    echo "1. 还有其他依赖缺失"
    echo "2. 数据库连接失败"
    echo "3. 环境变量配置错误"
    echo "4. 端口被占用"
    echo ""
    echo "手动调试："
    echo "  cd $PROJECT_DIR"
    echo "  npm run start"
fi

echo ""
echo "========================================"
echo "完成"
echo "========================================"
