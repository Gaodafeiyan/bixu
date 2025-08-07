# 服务器修复命令
cd /root/strapi-v5-ts

# 停止当前服务
pkill -f "strapi develop"

# 清理缓存
rm -rf .strapi dist node_modules/.cache

# 重新安装依赖
npm install

# 重新构建
npm run build

# 启动服务
npm run develop

# 如果仍有问题，尝试降级到v4
npm install @strapi/strapi@4.25.23 @strapi/plugin-users-permissions@4.25.23
npm run develop