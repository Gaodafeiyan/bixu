#!/bin/bash

echo "========================================"
echo "502 错误诊断脚本 - 服务器问题排查"
echo "========================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取时间戳
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="502_diagnostic_${TIMESTAMP}.log"

# 记录函数
log() {
    echo "$1" | tee -a "$LOG_FILE"
}

log "诊断开始时间: $(date)"
log ""

# 1. 检查后端服务状态
echo "========================================"
log "1. 检查后端服务进程"
echo "========================================"

# 检查常见的后端服务
services=("node" "pm2" "nginx" "apache2" "strapi" "nest")
for service in "${services[@]}"; do
    if pgrep -x "$service" > /dev/null; then
        log -e "${GREEN}✓ $service 进程正在运行${NC}"
        log "   进程信息："
        ps aux | grep "$service" | grep -v grep | tee -a "$LOG_FILE"
    else
        log -e "${YELLOW}! $service 进程未运行${NC}"
    fi
done
log ""

# 2. 检查端口占用
echo "========================================"
log "2. 检查常用端口占用情况"
echo "========================================"

ports=(80 443 3000 3001 4000 5000 8000 8080 1337 3306 5432 6379 27017)
for port in "${ports[@]}"; do
    if command -v netstat &> /dev/null; then
        result=$(netstat -tuln | grep ":$port " 2>/dev/null)
    elif command -v ss &> /dev/null; then
        result=$(ss -tuln | grep ":$port " 2>/dev/null)
    else
        result=$(lsof -i ":$port" 2>/dev/null)
    fi

    if [ ! -z "$result" ]; then
        log -e "${GREEN}✓ 端口 $port 正在使用${NC}"
        log "$result"
    else
        log -e "${YELLOW}! 端口 $port 未被占用${NC}"
    fi
done
log ""

# 3. 检查 PM2 服务
echo "========================================"
log "3. 检查 PM2 服务状态"
echo "========================================"

if command -v pm2 &> /dev/null; then
    log -e "${GREEN}✓ PM2 已安装${NC}"
    log ""
    log "PM2 进程列表："
    pm2 list | tee -a "$LOG_FILE"
    log ""
    log "PM2 详细信息："
    pm2 info all 2>&1 | tee -a "$LOG_FILE"
else
    log -e "${RED}✗ PM2 未安装${NC}"
fi
log ""

# 4. 检查 Nginx 配置
echo "========================================"
log "4. 检查 Nginx 状态和配置"
echo "========================================"

if command -v nginx &> /dev/null; then
    log -e "${GREEN}✓ Nginx 已安装${NC}"

    # 检查 Nginx 状态
    if systemctl is-active --quiet nginx 2>/dev/null; then
        log -e "${GREEN}✓ Nginx 服务运行中${NC}"
    elif service nginx status &> /dev/null; then
        log -e "${GREEN}✓ Nginx 服务运行中${NC}"
    else
        log -e "${RED}✗ Nginx 服务未运行${NC}"
    fi

    # 测试配置
    log ""
    log "测试 Nginx 配置："
    nginx -t 2>&1 | tee -a "$LOG_FILE"

    # 查看错误日志
    log ""
    log "Nginx 错误日志 (最后20行)："
    if [ -f "/var/log/nginx/error.log" ]; then
        tail -20 /var/log/nginx/error.log | tee -a "$LOG_FILE"
    else
        log "错误日志文件不存在"
    fi
else
    log -e "${YELLOW}! Nginx 未安装${NC}"
fi
log ""

# 5. 检查应用日志
echo "========================================"
log "5. 检查应用程序日志"
echo "========================================"

log "查找最近的错误日志..."

# PM2 日志
if command -v pm2 &> /dev/null; then
    log ""
    log "=== PM2 错误日志 (最后50行) ==="
    pm2 logs --err --lines 50 2>&1 | tee -a "$LOG_FILE"
fi

# 常见日志位置
log_dirs=(
    "/var/log/nginx"
    "/var/log/apache2"
    "$HOME/.pm2/logs"
    "./logs"
    "../logs"
)

for dir in "${log_dirs[@]}"; do
    if [ -d "$dir" ]; then
        log ""
        log "=== 检查 $dir ==="
        find "$dir" -name "*.log" -type f -mtime -1 -exec sh -c '
            echo "文件: {}"
            tail -20 "{}"
        ' \; 2>/dev/null | tee -a "$LOG_FILE"
    fi
done
log ""

# 6. 检查系统资源
echo "========================================"
log "6. 检查系统资源使用情况"
echo "========================================"

log "CPU 和内存使用："
if command -v top &> /dev/null; then
    top -bn1 | head -20 | tee -a "$LOG_FILE"
elif command -v htop &> /dev/null; then
    htop -n 1 2>&1 | head -20 | tee -a "$LOG_FILE"
fi

log ""
log "磁盘使用："
df -h | tee -a "$LOG_FILE"

log ""
log "内存使用："
free -h | tee -a "$LOG_FILE"
log ""

# 7. 测试后端连接
echo "========================================"
log "7. 测试后端服务连接"
echo "========================================"

# 常见后端端口
backend_ports=(1337 3000 3001 4000 5000 8000 8080)

for port in "${backend_ports[@]}"; do
    log "测试 localhost:$port ..."

    if command -v curl &> /dev/null; then
        response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://localhost:$port" 2>&1)
        if [ "$response" = "000" ]; then
            log -e "${RED}✗ 端口 $port 无法连接${NC}"
        else
            log -e "${GREEN}✓ 端口 $port 返回状态码: $response${NC}"
        fi
    elif command -v wget &> /dev/null; then
        if wget --spider --timeout=5 "http://localhost:$port" 2>&1 | grep -q "200"; then
            log -e "${GREEN}✓ 端口 $port 可访问${NC}"
        else
            log -e "${RED}✗ 端口 $port 无法访问${NC}"
        fi
    else
        if nc -z localhost $port 2>/dev/null; then
            log -e "${GREEN}✓ 端口 $port 开放${NC}"
        else
            log -e "${RED}✗ 端口 $port 未开放${NC}"
        fi
    fi
done
log ""

# 8. 检查数据库连接
echo "========================================"
log "8. 检查数据库服务"
echo "========================================"

# MySQL
if command -v mysql &> /dev/null || pgrep -x mysqld > /dev/null; then
    log -e "${GREEN}✓ MySQL 已安装/运行${NC}"
    if systemctl is-active --quiet mysql 2>/dev/null || systemctl is-active --quiet mysqld 2>/dev/null; then
        log "MySQL 状态: 运行中"
    fi
else
    log -e "${YELLOW}! MySQL 未运行${NC}"
fi

# PostgreSQL
if command -v psql &> /dev/null || pgrep -x postgres > /dev/null; then
    log -e "${GREEN}✓ PostgreSQL 已安装/运行${NC}"
    if systemctl is-active --quiet postgresql 2>/dev/null; then
        log "PostgreSQL 状态: 运行中"
    fi
else
    log -e "${YELLOW}! PostgreSQL 未运行${NC}"
fi

# MongoDB
if command -v mongo &> /dev/null || pgrep -x mongod > /dev/null; then
    log -e "${GREEN}✓ MongoDB 已安装/运行${NC}"
    if systemctl is-active --quiet mongod 2>/dev/null; then
        log "MongoDB 状态: 运行中"
    fi
else
    log -e "${YELLOW}! MongoDB 未运行${NC}"
fi

# Redis
if command -v redis-cli &> /dev/null || pgrep -x redis-server > /dev/null; then
    log -e "${GREEN}✓ Redis 已安装/运行${NC}"
    if systemctl is-active --quiet redis 2>/dev/null; then
        log "Redis 状态: 运行中"
    fi
else
    log -e "${YELLOW}! Redis 未运行${NC}"
fi
log ""

# 9. 检查环境变量和配置
echo "========================================"
log "9. 检查环境配置"
echo "========================================"

# 查找 .env 文件
log "查找 .env 配置文件..."
env_files=$(find . -maxdepth 3 -name ".env*" -type f 2>/dev/null)
if [ ! -z "$env_files" ]; then
    log -e "${GREEN}找到以下环境配置文件:${NC}"
    echo "$env_files" | while read file; do
        log "  - $file"
        log "    配置项数量: $(grep -c "=" "$file" 2>/dev/null || echo 0)"
    done
else
    log -e "${YELLOW}! 未找到 .env 文件${NC}"
fi
log ""

# 10. 生成修复建议
echo "========================================"
log "10. 502 错误常见原因和解决方案"
echo "========================================"

cat << 'EOF' | tee -a "$LOG_FILE"

502 错误表示网关错误，通常是因为：

【常见原因】
1. 后端服务未启动或已崩溃
2. 后端服务响应超时
3. 端口配置错误
4. 防火墙阻止连接
5. 反向代理配置错误（Nginx/Apache）
6. 内存/CPU 资源不足导致服务无响应
7. 数据库连接失败

【立即检查】
1. 检查后端服务是否运行：
   pm2 list
   pm2 logs

2. 重启后端服务：
   pm2 restart all
   或
   pm2 start ecosystem.config.js

3. 检查 Nginx 配置：
   nginx -t
   systemctl restart nginx

4. 查看实时日志：
   pm2 logs --lines 100
   tail -f /var/log/nginx/error.log

【详细排查步骤】

步骤1: 确认后端服务状态
---------------------------------------
cd /path/to/your/backend
pm2 list
# 如果服务显示 "stopped" 或 "errored"，重启：
pm2 restart <app-name>

步骤2: 检查后端日志
---------------------------------------
pm2 logs <app-name> --lines 100
# 查找错误信息，常见错误：
# - 数据库连接失败
# - 端口被占用
# - 环境变量缺失
# - 依赖包缺失

步骤3: 测试后端直接访问
---------------------------------------
curl http://localhost:1337/api/health
# 或您的实际后端端口

步骤4: 检查 Nginx 配置
---------------------------------------
cat /etc/nginx/sites-available/default
# 确认 proxy_pass 指向正确的后端地址

nginx -t
sudo systemctl restart nginx

步骤5: 检查防火墙
---------------------------------------
sudo ufw status
sudo firewall-cmd --list-all

步骤6: 检查系统资源
---------------------------------------
free -h
df -h
top -bn1 | head -20

【快速修复命令】
---------------------------------------
# 1. 重启所有服务
pm2 restart all
sudo systemctl restart nginx

# 2. 如果还是不行，重新启动：
pm2 delete all
cd /path/to/backend
npm install  # 或 yarn install
pm2 start ecosystem.config.js

# 3. 清理 PM2 日志
pm2 flush

# 4. 查看详细错误
pm2 logs --err --lines 50

【检查清单】
---------------------------------------
□ 后端服务进程正在运行
□ 端口正确且未被占用
□ Nginx/反向代理配置正确
□ 数据库服务运行正常
□ .env 环境变量配置完整
□ 磁盘空间充足
□ 内存未耗尽
□ 防火墙规则允许连接

EOF

log ""
log "========================================"
log "诊断完成！"
log "========================================"
log "详细日志已保存到: $LOG_FILE"
log ""
log "下一步操作建议："
log "1. 查看上述诊断结果"
log "2. 运行快速修复命令"
log "3. 检查后端日志找到具体错误原因"
log "4. 如需帮助，请将 $LOG_FILE 发送给技术支持"
