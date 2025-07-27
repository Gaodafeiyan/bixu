# Bixu 简化API测试脚本
$baseUrl = "http://118.107.4.158:1337"
$inviteCode = "1Q814C"

Write-Host "=== Bixu API 功能测试 ===" -ForegroundColor Green
Write-Host "服务器: $baseUrl" -ForegroundColor Cyan
Write-Host "邀请码: $inviteCode" -ForegroundColor Cyan
Write-Host "开始时间: $(Get-Date)" -ForegroundColor Cyan

# 1. 健康检查测试
Write-Host "`n=== 1. 健康检查测试 ===" -ForegroundColor Yellow

# 钱包API健康检查
Write-Host "测试钱包API健康检查..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/health" -Method GET -TimeoutSec 10
    Write-Host "✅ 钱包API健康检查: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "响应: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 钱包API健康检查失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 认购计划API健康检查
Write-Host "测试认购计划API健康检查..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-jihuas/health" -Method GET -TimeoutSec 10
    Write-Host "✅ 认购计划API健康检查: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "响应: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 认购计划API健康检查失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. 邀请码验证测试
Write-Host "`n=== 2. 邀请码验证测试 ===" -ForegroundColor Yellow
Write-Host "测试邀请码验证..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/validate-invite-code/$inviteCode" -Method GET -TimeoutSec 10
    Write-Host "✅ 邀请码验证: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "响应: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 邀请码验证失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. 用户注册测试
Write-Host "`n=== 3. 用户注册测试 ===" -ForegroundColor Yellow
$username = "testuser$(Get-Random -Minimum 1000 -Maximum 9999)"
$email = "test$($username)@example.com"
Write-Host "测试用户注册 (用户名: $username)..." -ForegroundColor Yellow
try {
    $body = @{
        username = $username
        email = $email
        password = "password123"
        inviteCode = $inviteCode
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/invite-register" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "✅ 用户注册: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "响应: $($response.Content)" -ForegroundColor Gray
    
    # 解析用户ID
    $userData = $response.Content | ConvertFrom-Json
    $userId = $userData.data.id
} catch {
    Write-Host "❌ 用户注册失败: $($_.Exception.Message)" -ForegroundColor Red
    $userId = 1  # 使用默认用户ID
}

# 4. 用户登录测试
Write-Host "`n=== 4. 用户登录测试 ===" -ForegroundColor Yellow
Write-Host "测试用户登录..." -ForegroundColor Yellow
try {
    $body = @{
        identifier = $username
        password = "password123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/local" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "✅ 用户登录: $($response.StatusCode)" -ForegroundColor Green
    
    # 解析JWT token
    $loginData = $response.Content | ConvertFrom-Json
    $jwtToken = $loginData.jwt
    Write-Host "获取到JWT token" -ForegroundColor Green
} catch {
    Write-Host "❌ 用户登录失败: $($_.Exception.Message)" -ForegroundColor Red
    $jwtToken = ""
}

# 5. 钱包功能测试
if ($jwtToken) {
    Write-Host "`n=== 5. 钱包功能测试 ===" -ForegroundColor Yellow
    $headers = @{Authorization = "Bearer $jwtToken"}
    
    # 获取用户钱包
    Write-Host "测试获取用户钱包..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/user-wallet" -Method GET -Headers $headers -TimeoutSec 10
        Write-Host "✅ 获取用户钱包: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "响应: $($response.Content)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ 获取用户钱包失败: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # 钱包充值
    Write-Host "测试钱包充值..." -ForegroundColor Yellow
    try {
        $body = @{
            data = @{
                user = $userId
                usdtYue = 1000
                aiYue = 500
            }
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/recharge" -Method POST -Body $body -Headers $headers -ContentType "application/json" -TimeoutSec 10
        Write-Host "✅ 钱包充值: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "响应: $($response.Content)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ 钱包充值失败: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 6. 认购计划功能测试
Write-Host "`n=== 6. 认购计划功能测试 ===" -ForegroundColor Yellow

# 获取所有认购计划
Write-Host "测试获取认购计划列表..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-jihuas" -Method GET -TimeoutSec 10
    Write-Host "✅ 获取认购计划列表: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "响应: $($response.Content)" -ForegroundColor Gray
    
    # 解析计划ID
    $plansData = $response.Content | ConvertFrom-Json
    $planId = $plansData.data[0].id
} catch {
    Write-Host "❌ 获取认购计划列表失败: $($_.Exception.Message)" -ForegroundColor Red
    $planId = 1
}

if ($jwtToken -and $planId) {
    $headers = @{Authorization = "Bearer $jwtToken"}
    
    # 获取我的投资
    Write-Host "测试获取我的投资..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-jihuas/my-investments" -Method GET -Headers $headers -TimeoutSec 10
        Write-Host "✅ 获取我的投资: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "响应: $($response.Content)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ 获取我的投资失败: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 7. 认购订单功能测试
Write-Host "`n=== 7. 认购订单功能测试 ===" -ForegroundColor Yellow

# 获取所有订单
Write-Host "测试获取订单列表..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-dingdans" -Method GET -TimeoutSec 10
    Write-Host "✅ 获取订单列表: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "响应: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 获取订单列表失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. 邀请奖励功能测试
Write-Host "`n=== 8. 邀请奖励功能测试 ===" -ForegroundColor Yellow

if ($jwtToken) {
    $headers = @{Authorization = "Bearer $jwtToken"}
    
    # 获取我的邀请码
    Write-Host "测试获取我的邀请码..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/my-invite-code" -Method GET -Headers $headers -TimeoutSec 10
        Write-Host "✅ 获取我的邀请码: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "响应: $($response.Content)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ 获取我的邀请码失败: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # 获取我的团队
    Write-Host "测试获取我的团队..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/my-team" -Method GET -Headers $headers -TimeoutSec 10
        Write-Host "✅ 获取我的团队: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "响应: $($response.Content)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ 获取我的团队失败: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n测试完成时间: $(Get-Date)" -ForegroundColor Cyan
Write-Host "=== 测试结束 ===" -ForegroundColor Green 