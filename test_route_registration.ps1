# 测试路由注册情况
$API_BASE = "http://118.107.4.158:1337"

Write-Host "=== 测试路由注册情况 ===" -ForegroundColor Green

# 1. 测试公开路由（应该工作）
Write-Host "`n1. 测试公开路由 /api/qianbao-yues/health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/api/qianbao-yues/health" -Method GET -TimeoutSec 10
    Write-Host "✅ 公开路由: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   响应: $($data.message)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ 公开路由失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. 测试标准CRUD路由（应该工作）
Write-Host "`n2. 测试标准CRUD路由 /api/qianbao-yues..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/api/qianbao-yues" -Method GET -TimeoutSec 10
    Write-Host "✅ 标准CRUD路由: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ 标准CRUD路由失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. 测试自定义路由（可能403）
Write-Host "`n3. 测试自定义路由 /api/qianbao-yues/user-wallet..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/api/qianbao-yues/user-wallet" -Method GET -TimeoutSec 10
    Write-Host "✅ 自定义路由: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ 自定义路由失败: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   状态码: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "`n=== 路由测试完成 ===" -ForegroundColor Green 