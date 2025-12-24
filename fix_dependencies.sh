#!/bin/bash

echo "========================================"
echo "修复后端依赖问题脚本"
echo "========================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目路径
PROJECT_DIR="/root/strapi-v4-ts"

echo -e "${BLUE}步骤 1/6: 进入项目目录${NC}"
cd "$PROJECT_DIR" || {
    echo -e "${RED}✗ 无法进入项目目录: $PROJECT_DIR${NC}"
    exit 1
}
echo -e "${GREEN}✓ 当前目录: $(pwd)${NC}"
echo ""

echo -e "${BLUE}步骤 2/6: 停止 PM2 服务${NC}"
pm2 stop bixu-api
echo -e "${GREEN}✓ 服务已停止${NC}"
echo ""

echo -e "${BLUE}步骤 3/6: 检查 package.json${NC}"
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓ package.json 存在${NC}"
    echo ""
    echo "当前依赖包含："
    cat package.json | grep -A 50 '"dependencies"' | head -30
else
    echo -e "${RED}✗ package.json 不存在${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}步骤 4/6: 安装缺失的依赖包${NC}"
echo "安装 node-cron, qrcode 及其他可能缺失的包..."

# 安装已知缺失的包
npm install node-cron qrcode

# 常用的其他依赖包（根据 Strapi 项目常见需求）
echo ""
echo "安装其他常用依赖..."
npm install \
    axios \
    bcryptjs \
    jsonwebtoken \
    moment \
    uuid \
    lodash \
    @types/node-cron \
    @types/qrcode

echo -e "${GREEN}✓ 依赖包安装完成${NC}"
echo ""

echo -e "${BLUE}步骤 5/6: 运行完整依赖安装（确保所有依赖齐全）${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ npm install 成功${NC}"
else
    echo -e "${RED}✗ npm install 失败${NC}"
    echo "尝试清理缓存后重新安装..."
    npm cache clean --force
    rm -rf node_modules package-lock.json
    npm install
fi
echo ""

echo -e "${BLUE}步骤 6/6: 重启 PM2 服务${NC}"
pm2 restart bixu-api
sleep 3

echo ""
echo "========================================"
echo "检查服务状态"
echo "========================================"
echo ""

# 显示 PM2 状态
echo "PM2 进程状态："
pm2 list

echo ""
echo "最新日志（等待5秒让服务启动）："
sleep 5
pm2 logs bixu-api --lines 30 --nostream

echo ""
echo "========================================"
echo "检查端口监听状态"
echo "========================================"
echo ""

# 检查端口
if netstat -tlnp | grep -q ":1337"; then
    echo -e "${GREEN}✓ 端口 1337 正在监听${NC}"
    netstat -tlnp | grep ":1337"
else
    echo -e "${RED}✗ 端口 1337 未监听${NC}"
    echo "请查看日志排查问题："
    echo "  pm2 logs bixu-api --lines 100"
fi

echo ""
echo "========================================"
echo "测试后端连接"
echo "========================================"
echo ""

# 等待服务完全启动
sleep 3

# 测试连接
echo "测试 http://localhost:1337 ..."
if command -v curl &> /dev/null; then
    response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "http://localhost:1337" 2>&1)
    if [ "$response" = "000" ]; then
        echo -e "${RED}✗ 无法连接到后端服务${NC}"
        echo ""
        echo "故障排查步骤："
        echo "1. 查看完整日志："
        echo "   pm2 logs bixu-api --lines 200"
        echo ""
        echo "2. 检查是否还有其他依赖缺失"
        echo ""
        echo "3. 查看环境变量配置："
        echo "   cat $PROJECT_DIR/.env"
        echo ""
        echo "4. 手动启动测试："
        echo "   cd $PROJECT_DIR"
        echo "   npm run start"
    else
        echo -e "${GREEN}✓ 后端服务响应，状态码: $response${NC}"
        echo ""
        echo -e "${GREEN}====================================${NC}"
        echo -e "${GREEN}修复完成！服务正常运行${NC}"
        echo -e "${GREEN}====================================${NC}"
        echo ""
        echo "访问测试："
        echo "  curl http://localhost:1337"
        echo ""
        echo "重启 Nginx："
        echo "  sudo systemctl restart nginx"
        echo ""
        echo "查看实时日志："
        echo "  pm2 logs bixu-api"
    fi
else
    echo "curl 未安装，使用 netstat 检查"
    if netstat -tlnp | grep -q ":1337"; then
        echo -e "${GREEN}✓ 端口 1337 正在监听，服务可能正常${NC}"
    fi
fi

echo ""
echo "========================================"
echo "依赖修复完成"
echo "========================================"
