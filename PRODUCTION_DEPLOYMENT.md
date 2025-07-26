# 生产环境部署指南

## 🚨 版本选择建议

### 当前问题
- Strapi v5 还在beta阶段，不适合生产环境
- 可能存在稳定性和安全性问题

### 推荐方案：使用 Strapi v4 稳定版

#### 1. 切换到稳定版本
```bash
# 备份当前配置
cp package.json package.json.backup

# 使用生产环境配置
cp package-production.json package.json

# 清理并重新安装依赖
rm -rf node_modules yarn.lock
yarn install
```

#### 2. 验证安装
```bash
yarn develop
```

## 🏭 生产环境配置

### 1. 环境变量配置
创建 `.env` 文件：
```bash
# 数据库配置
DATABASE_CLIENT=postgres
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
DATABASE_NAME=your-db-name
DATABASE_USERNAME=your-db-user
DATABASE_PASSWORD=your-db-password

# 应用配置
NODE_ENV=production
PORT=1337
APP_KEYS=your-app-keys
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
JWT_SECRET=your-jwt-secret

# 安全配置
CORS_ORIGIN=https://your-domain.com
```

### 2. 数据库配置
推荐使用 PostgreSQL：
```bash
# 安装 PostgreSQL 驱动
yarn add pg
```

### 3. 性能优化
```bash
# 安装性能监控
yarn add @strapi/plugin-performance-monitor

# 安装缓存插件
yarn add @strapi/plugin-redis
```

## 🚀 部署步骤

### 1. 构建应用
```bash
yarn build
```

### 2. 启动生产服务
```bash
yarn start
```

### 3. 使用 PM2 管理进程
```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.js

# 设置开机自启
pm2 startup
pm2 save
```

## 🔒 安全配置

### 1. 防火墙设置
```bash
# 只开放必要端口
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### 2. SSL 证书
```bash
# 使用 Let's Encrypt
sudo apt install certbot
sudo certbot --nginx -d your-domain.com
```

### 3. 定期备份
```bash
# 创建备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump your-db-name > backup_$DATE.sql
```

## 📊 监控和日志

### 1. 日志配置
```javascript
// config/logger.js
module.exports = {
  level: 'info',
  format: 'json',
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
};
```

### 2. 健康检查
```bash
# 创建健康检查端点
curl http://your-domain.com/api/health
```

## 🔄 版本升级策略

### 1. 测试环境
- 先在测试环境验证新版本
- 运行完整的测试套件
- 检查所有功能正常

### 2. 灰度发布
- 先部署到部分服务器
- 监控性能和错误率
- 逐步扩大部署范围

### 3. 回滚计划
- 保留旧版本备份
- 准备快速回滚脚本
- 监控关键指标

## 📈 性能优化

### 1. 数据库优化
```sql
-- 创建索引
CREATE INDEX idx_user_email ON users_permissions_user(email);
CREATE INDEX idx_order_status ON dinggou_dingdans(status);
```

### 2. 缓存策略
```javascript
// 使用 Redis 缓存
const cache = require('redis').createClient();
```

### 3. CDN 配置
- 静态资源使用 CDN
- 图片和文件存储使用对象存储

## 🆘 故障排除

### 常见问题：
1. **内存不足**：增加服务器内存或使用集群
2. **数据库连接超时**：优化数据库配置
3. **API 响应慢**：添加缓存和索引
4. **SSL 证书过期**：设置自动续期

### 监控指标：
- CPU 使用率
- 内存使用率
- 磁盘空间
- 网络流量
- 错误率
- 响应时间

## 📞 技术支持

如果遇到问题：
1. 查看日志文件
2. 检查系统资源
3. 验证配置正确性
4. 联系技术支持 