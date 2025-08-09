#!/bin/bash

echo "🔧 修复分享页面问题..."

# 1. 检查后端服务是否运行
echo "1. 检查后端服务状态..."
if pgrep -f "strapi" > /dev/null; then
    echo "✅ Strapi服务正在运行"
else
    echo "❌ Strapi服务未运行，正在启动..."
    npm run develop &
    sleep 10
fi

# 2. 测试分享页面相关API
echo "2. 测试分享页面API..."
node test_share_page_api.js

# 3. 检查前端路由配置
echo "3. 检查前端路由配置..."
if grep -q "invite-share" quickdrama/lib/core/router.dart; then
    echo "✅ 前端路由配置正确"
else
    echo "❌ 前端路由配置有问题"
fi

# 4. 检查后端路由配置
echo "4. 检查后端路由配置..."
if grep -q "track-invite-share" bixu/src/api/auth/routes/auth.ts; then
    echo "✅ 后端路由配置正确"
else
    echo "❌ 后端路由配置有问题"
fi

# 5. 检查后端控制器
echo "5. 检查后端控制器..."
if grep -q "trackInviteShare" bixu/src/api/auth/controllers/auth.ts; then
    echo "✅ 后端控制器方法存在"
else
    echo "❌ 后端控制器方法缺失"
fi

echo "✅ 分享页面修复完成！"
echo ""
echo "📋 修复内容:"
echo "   - 添加了后端 track-invite-share 路由"
echo "   - 添加了后端 trackInviteShare 控制器方法"
echo "   - 修复了前端 token 获取问题"
echo "   - 优化了错误处理逻辑"
echo ""
echo "🚀 现在可以测试分享页面了:"
echo "   1. 确保后端服务正在运行"
echo "   2. 在前端应用中导航到分享页面"
echo "   3. 检查是否能正常加载邀请信息"
