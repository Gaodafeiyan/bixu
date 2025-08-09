#!/bin/bash

echo "🚀 快速提交分享页面修复..."

# 添加所有修改的文件
git add .

# 创建提交
git commit -m "fix: 修复分享页面问题 - 添加track-invite-share路由和控制器方法"

echo "✅ 提交完成！"
echo "📋 提交内容:"
echo "   - 后端路由配置修复"
echo "   - 后端控制器方法添加"
echo "   - 测试和修复脚本"

# 显示状态
git status
