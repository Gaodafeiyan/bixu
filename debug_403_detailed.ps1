# 详细调试403错误
$API_BASE = "http://118.107.4.158:1337"

Write-Host "=== 详细调试403错误 ===" -ForegroundColor Red

# 1. 先测试登录获取token
Write-Host "`n1. 获取JWT Token..." -ForegroundColor Yellow
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

# 2. 测试标准CRUD API（应该工作）
Write-Host "`n2. 测试标准CRUD API..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-WebRequest -Uri "$API_BASE/api/qianbao-yues" -Method GET -Headers $headers -TimeoutSec 10
    Write-Host "✅ 标准CRUD API: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ 标准CRUD API失败: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   状态码: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "   响应: $($_.Exception.Response.Content)" -ForegroundColor Red
    }
}

# 3. 测试自定义路由（可能403）
Write-Host "`n3. 测试自定义路由..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-WebRequest -Uri "$API_BASE/api/qianbao-yues/user-wallet" -Method GET -Headers $headers -TimeoutSec 10
    Write-Host "✅ 自定义路由: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   响应数据: $($data | ConvertTo-Json -Depth 2)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ 自定义路由失败: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   状态码: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "   响应内容: $($_.Exception.Response.Content)" -ForegroundColor Red
    }
}

# 4. 测试不带token的自定义路由
Write-Host "`n4. 测试不带token的自定义路由..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/api/qianbao-yues/user-wallet" -Method GET -TimeoutSec 10
    Write-Host "✅ 无token访问: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ 无token访问失败: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   状态码: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "`n=== 调试完成 ===" -ForegroundColor Red 