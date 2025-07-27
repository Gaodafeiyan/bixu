# 测试自定义路由并查看调试信息
$API_BASE = "http://118.107.4.158:1337"

Write-Host "=== 测试自定义路由调试 ===" -ForegroundColor Green

# 1. 登录获取token
Write-Host "`n1. 登录获取token..." -ForegroundColor Yellow
try {
    $loginData = @{
        identifier = "testuser"
        password = "123456"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$API_BASE/api/auth/local" -Method POST -Body $loginData -ContentType "application/json" -TimeoutSec 10
    $loginResult = $response.Content | ConvertFrom-Json
    $token = $loginResult.jwt
    Write-Host "✅ 登录成功，Token: $($token.Substring(0,20))..." -ForegroundColor Green
} catch {
    Write-Host "❌ 登录失败: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 2. 测试自定义路由
Write-Host "`n2. 测试自定义路由 /api/qianbao-yues/user-wallet..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-WebRequest -Uri "$API_BASE/api/qianbao-yues/user-wallet" -Method GET -Headers $headers -TimeoutSec 10
    Write-Host "✅ 自定义路由成功: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   响应数据: $($data | ConvertTo-Json -Depth 2)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ 自定义路由失败: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   状态码: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "   响应内容: $($_.Exception.Response.Content)" -ForegroundColor Red
    }
}

Write-Host "`n=== 测试完成 ===" -ForegroundColor Green
Write-Host "请查看服务器日志中的调试信息..." -ForegroundColor Yellow 