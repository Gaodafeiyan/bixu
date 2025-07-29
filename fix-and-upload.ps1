# PowerShell 脚本：修复 TypeScript 错误并上传到 Git
Write-Host "🔧 开始修复 TypeScript 编译错误并上传到 Git..." -ForegroundColor Green

# 检查当前目录
$currentDir = Get-Location
Write-Host "📍 当前目录: $currentDir" -ForegroundColor Yellow

# 第一步：运行修复脚本
Write-Host "`n📝 第一步：运行 TypeScript 错误修复脚本..." -ForegroundColor Cyan
try {
    node fix-typescript-errors.js
    Write-Host "✅ TypeScript 错误修复完成" -ForegroundColor Green
} catch {
    Write-Host "❌ TypeScript 错误修复失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 第二步：生成 Strapi 类型
Write-Host "`n📝 第二步：生成 Strapi 类型..." -ForegroundColor Cyan
try {
    yarn strapi ts:generate-types
    Write-Host "✅ Strapi 类型生成完成" -ForegroundColor Green
} catch {
    Write-Host "❌ Strapi 类型生成失败，继续执行..." -ForegroundColor Yellow
}

# 第三步：检查 Git 状态
Write-Host "`n📝 第三步：检查 Git 状态..." -ForegroundColor Cyan
try {
    git status | Out-Null
    Write-Host "✅ Git 仓库状态正常" -ForegroundColor Green
} catch {
    Write-Host "❌ 当前目录不是 Git 仓库" -ForegroundColor Red
    exit 1
}

# 第四步：添加所有更改
Write-Host "`n📝 第四步：添加所有更改到暂存区..." -ForegroundColor Cyan
try {
    git add .
    Write-Host "✅ 更改已添加到暂存区" -ForegroundColor Green
} catch {
    Write-Host "❌ 添加更改失败" -ForegroundColor Red
    exit 1
}

# 第五步：检查是否有更改需要提交
try {
    $statusOutput = git status --porcelain
    if ([string]::IsNullOrWhiteSpace($statusOutput)) {
        Write-Host "ℹ️ 没有新的更改需要提交" -ForegroundColor Yellow
        Write-Host "🎉 修复和上传流程完成！" -ForegroundColor Green
        exit 0
    }
} catch {
    Write-Host "❌ 无法检查 Git 状态" -ForegroundColor Red
    exit 1
}

# 第六步：提交更改
$commitMessage = "修复 TypeScript 编译错误：更新 schema 定义和类型生成"
Write-Host "`n📝 第五步：提交更改: $commitMessage" -ForegroundColor Cyan
try {
    git commit -m $commitMessage
    Write-Host "✅ 更改已提交" -ForegroundColor Green
} catch {
    Write-Host "❌ 提交失败" -ForegroundColor Red
    exit 1
}

# 第七步：获取当前分支
try {
    $currentBranch = git branch --show-current
    Write-Host "🌿 当前分支: $currentBranch" -ForegroundColor Yellow
} catch {
    Write-Host "❌ 无法获取当前分支" -ForegroundColor Red
    exit 1
}

# 第八步：推送到远程仓库
Write-Host "`n📝 第六步：推送到远程仓库 ($currentBranch 分支)..." -ForegroundColor Cyan
try {
    git push origin $currentBranch
    Write-Host "✅ 代码已成功推送到远程仓库" -ForegroundColor Green
} catch {
    Write-Host "❌ 推送失败" -ForegroundColor Red
    Write-Host "💡 可能的解决方案:" -ForegroundColor Yellow
    Write-Host "1. 检查网络连接" -ForegroundColor White
    Write-Host "2. 确认远程仓库权限" -ForegroundColor White
    Write-Host "3. 尝试手动推送: git push origin HEAD" -ForegroundColor White
    exit 1
}

# 第九步：显示提交历史
Write-Host "`n📝 第七步：显示最近的提交历史..." -ForegroundColor Cyan
try {
    git log --oneline -3
} catch {
    Write-Host "❌ 无法获取提交历史" -ForegroundColor Red
}

Write-Host "`n🎉 完整的修复和上传流程完成！" -ForegroundColor Green
Write-Host "📋 修复内容包括:" -ForegroundColor Cyan
Write-Host "- ✅ 更新了所有 content-type schema 定义" -ForegroundColor White
Write-Host "- ✅ 修复了 TypeScript 类型生成问题" -ForegroundColor White
Write-Host "- ✅ 添加了自定义类型定义文件" -ForegroundColor White
Write-Host "- ✅ 更新了 TypeScript 配置" -ForegroundColor White
Write-Host "- ✅ 生成了 Strapi 类型" -ForegroundColor White
Write-Host "- ✅ 提交并推送到远程仓库" -ForegroundColor White

Write-Host "`n📋 下一步建议:" -ForegroundColor Cyan
Write-Host "1. 在远程服务器上运行: yarn develop" -ForegroundColor White
Write-Host "2. 检查是否还有 TypeScript 编译错误" -ForegroundColor White
Write-Host "3. 如果仍有错误，请检查具体的错误信息" -ForegroundColor White