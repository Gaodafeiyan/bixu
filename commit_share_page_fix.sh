#!/bin/bash

echo "🚀 准备提交分享页面修复..."

# 1. 检查Git状态
echo "1. 检查Git状态..."
git status

# 2. 添加修改的文件
echo "2. 添加修改的文件..."
git add src/api/auth/routes/auth.ts
git add src/api/auth/controllers/auth.ts
git add test_share_page_api.js
git add fix_share_page.sh

# 3. 检查暂存区的文件
echo "3. 检查暂存区的文件..."
git diff --cached --name-only

# 4. 创建提交
echo "4. 创建提交..."
git commit -m "fix: 修复分享页面问题

- 添加后端 track-invite-share 路由
- 添加后端 trackInviteShare 控制器方法
- 创建分享页面API测试脚本
- 创建分享页面修复脚本

修复内容:
- 后端路由配置中添加了缺失的 track-invite-share 路由
- 后端控制器中添加了 trackInviteShare 方法
- 前端分享页面现在可以正常加载邀请信息
- 解决了分享页面打不开的问题

测试状态:
- /api/auth/invite-info 返回 200 状态码
- 分享页面可以正常访问和加载数据"

# 5. 显示提交历史
echo "5. 显示最近的提交..."
git log --oneline -5

echo "✅ 分享页面修复已提交到Git！"
echo ""
echo "📋 提交内容:"
echo "   - 后端路由配置修复"
echo "   - 后端控制器方法添加"
echo "   - 测试脚本创建"
echo "   - 修复脚本创建"
echo ""
echo "🚀 下一步可以推送到远程仓库:"
echo "   git push origin main"
