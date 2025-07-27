$baseUrl = "http://118.107.4.158:1337"
$inviteCode = "I6C8N7"

Write-Host "=== 详细认证调试 ===" -ForegroundColor Green

# 1. 测试用户注册和登录
$username = "debuguser$(Get-Random -Minimum 1000 -Maximum 9999)"
Write-Host "1. 注册用户: $username" -ForegroundColor Yellow

try {
    $body = @{
        username = $username
        email = "debug$($username)@example.com"
        password = "password123"
        inviteCode = $inviteCode
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/invite-register" -Method POST -Body $body -ContentType "application/json"
    Write-Host "注册成功: $($response.StatusCode)" -ForegroundColor Green
    
    $userData = $response.Content | ConvertFrom-Json
    $userId = $userData.data.id
    Write-Host "用户ID: $userId" -ForegroundColor Gray
} catch {
    Write-Host "注册失败: $($_.Exception.Message)" -ForegroundColor Red
    $userId = 17
}

# 2. 用户登录
Write-Host "`n2. 用户登录" -ForegroundColor Yellow
try {
    $body = @{
        identifier = $username
        password = "password123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/local" -Method POST -Body $body -ContentType "application/json"
    Write-Host "登录成功: $($response.StatusCode)" -ForegroundColor Green
    
    $loginData = $response.Content | ConvertFrom-Json
    $jwtToken = $loginData.jwt
    $userRole = $loginData.user.role
    
    Write-Host "JWT Token: $($jwtToken.Substring(0, 50))..." -ForegroundColor Gray
    Write-Host "用户角色: $($userRole.type) (ID: $($userRole.id))" -ForegroundColor Gray
    Write-Host "用户ID: $($loginData.user.id)" -ForegroundColor Gray
} catch {
    Write-Host "登录失败: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 3. 测试不同的认证方式
Write-Host "`n3. 测试认证方式" -ForegroundColor Yellow

# 3.1 测试Bearer token
Write-Host "`n3.1 Bearer Token认证" -ForegroundColor Cyan
try {
    $headers = @{Authorization = "Bearer $jwtToken"}
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/user-wallet" -Method GET -Headers $headers
    Write-Host "✅ Bearer Token成功: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "响应: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Bearer Token失败: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "状态码: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "响应内容: $($_.Exception.Response.Content)" -ForegroundColor Red
    }
}

# 3.2 测试直接Authorization header
Write-Host "`n3.2 直接Authorization Header" -ForegroundColor Cyan
try {
    $headers = @{Authorization = $jwtToken}
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/user-wallet" -Method GET -Headers $headers
    Write-Host "✅ 直接Authorization成功: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ 直接Authorization失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 3.3 测试查询参数方式
Write-Host "`n3.3 查询参数方式" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/user-wallet?userId=$userId" -Method GET
    Write-Host "✅ 查询参数成功: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ 查询参数失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. 测试其他需要认证的API
Write-Host "`n4. 测试其他认证API" -ForegroundColor Yellow

# 4.1 测试投资API
Write-Host "`n4.1 测试投资API" -ForegroundColor Cyan
try {
    $headers = @{Authorization = "Bearer $jwtToken"}
    $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-jihuas/my-investments" -Method GET -Headers $headers
    Write-Host "✅ 投资API成功: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ 投资API失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 4.2 测试订单API
Write-Host "`n4.2 测试订单API" -ForegroundColor Cyan
try {
    $headers = @{Authorization = "Bearer $jwtToken"}
    $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-dingdans/user-orders" -Method GET -Headers $headers
    Write-Host "✅ 订单API成功: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ 订单API失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 4.3 测试邀请奖励API
Write-Host "`n4.3 测试邀请奖励API" -ForegroundColor Cyan
try {
    $headers = @{Authorization = "Bearer $jwtToken"}
    $response = Invoke-WebRequest -Uri "$baseUrl/api/yaoqing-jianglis/user-rewards" -Method GET -Headers $headers
    Write-Host "✅ 邀请奖励API成功: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ 邀请奖励API失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. 测试公开API
Write-Host "`n5. 测试公开API" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues" -Method GET
    Write-Host "✅ 公开API成功: $($response.StatusCode)" -ForegroundColor Green
    $walletData = $response.Content | ConvertFrom-Json
    Write-Host "钱包数量: $($walletData.results.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 公开API失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== 调试完成 ===" -ForegroundColor Green 