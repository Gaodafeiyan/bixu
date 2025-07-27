# Bixu API 测试脚本
$baseUrl = "http://118.107.4.158:1337"
$inviteCode = "I6C8N7"

Write-Host "=== Bixu API 功能测试 ===" -ForegroundColor Green

# 1. 测试健康检查
Write-Host "`n1. 测试钱包API健康检查" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/health" -Method GET
    Write-Host "✅ 钱包API健康检查: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "响应: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 钱包API健康检查失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. 测试认购计划API健康检查" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-jihuas/health" -Method GET
    Write-Host "✅ 认购计划API健康检查: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "响应: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 认购计划API健康检查失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. 测试邀请码验证
Write-Host "`n3. 测试邀请码验证" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/validate-invite-code/$inviteCode" -Method GET
    Write-Host "✅ 邀请码验证: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "响应: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 邀请码验证失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. 测试用户注册
$username = "testuser$(Get-Random -Minimum 1000 -Maximum 9999)"
$email = "test$($username)@example.com"
Write-Host "`n4. 测试用户注册 (用户名: $username)" -ForegroundColor Yellow
try {
    $body = @{
        username = $username
        email = $email
        password = "password123"
        inviteCode = $inviteCode
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/invite-register" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ 用户注册: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "响应: $($response.Content)" -ForegroundColor Gray
    
    # 解析用户ID
    $userData = $response.Content | ConvertFrom-Json
    $userId = $userData.data.id
} catch {
    Write-Host "❌ 用户注册失败: $($_.Exception.Message)" -ForegroundColor Red
    $userId = 14  # 使用默认用户ID
}

# 4. 测试用户登录
Write-Host "`n5. 测试用户登录" -ForegroundColor Yellow
try {
    $body = @{
        identifier = $username
        password = "password123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/local" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ 用户登录: $($response.StatusCode)" -ForegroundColor Green
    
    # 解析JWT token
    $loginData = $response.Content | ConvertFrom-Json
    $jwtToken = $loginData.jwt
    Write-Host "获取到JWT token" -ForegroundColor Green
} catch {
    Write-Host "❌ 用户登录失败: $($_.Exception.Message)" -ForegroundColor Red
    $jwtToken = ""
}

# 5. 测试钱包相关功能
if ($jwtToken) {
    $headers = @{Authorization = "Bearer $jwtToken"}
    
    Write-Host "`n6. 测试获取用户钱包" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/user-wallet" -Method GET -Headers $headers
        Write-Host "✅ 获取用户钱包: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "响应: $($response.Content)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ 获取用户钱包失败: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "`n7. 测试钱包充值" -ForegroundColor Yellow
    try {
        $body = @{
            data = @{
                user = $userId
                usdtYue = 1000
                aiYue = 500
            }
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/recharge" -Method POST -Body $body -ContentType "application/json" -Headers $headers
        Write-Host "✅ 钱包充值: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "响应: $($response.Content)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ 钱包充值失败: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 6. 测试公开API
Write-Host "`n8. 测试钱包列表API" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues" -Method GET
    Write-Host "✅ 钱包列表: $($response.StatusCode)" -ForegroundColor Green
    $walletData = $response.Content | ConvertFrom-Json
    Write-Host "钱包数量: $($walletData.results.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 钱包列表失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n9. 测试认购计划列表API" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-jihuas" -Method GET
    Write-Host "✅ 认购计划列表: $($response.StatusCode)" -ForegroundColor Green
    $planData = $response.Content | ConvertFrom-Json
    Write-Host "计划数量: $($planData.results.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 认购计划列表失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n10. 测试认购订单列表API" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-dingdans" -Method GET
    Write-Host "✅ 认购订单列表: $($response.StatusCode)" -ForegroundColor Green
    $orderData = $response.Content | ConvertFrom-Json
    Write-Host "订单数量: $($orderData.results.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 认购订单列表失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n11. 测试邀请奖励列表API" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/yaoqing-jianglis" -Method GET
    Write-Host "✅ 邀请奖励列表: $($response.StatusCode)" -ForegroundColor Green
    $rewardData = $response.Content | ConvertFrom-Json
    Write-Host "奖励记录数量: $($rewardData.results.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 邀请奖励列表失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== 测试完成 ===" -ForegroundColor Green 