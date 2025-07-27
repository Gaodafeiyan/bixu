$baseUrl = "http://118.107.4.158:1337"
$inviteCode = "I6C8N7"

Write-Host "=== 403问题调试脚本 ===" -ForegroundColor Green

# 1. 测试健康检查
Write-Host "`n1. 测试健康检查" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/health" -Method GET
    Write-Host "✅ 健康检查: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ 健康检查失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. 测试用户注册
$username = "debuguser$(Get-Random -Minimum 1000 -Maximum 9999)"
Write-Host "`n2. 测试用户注册: $username" -ForegroundColor Yellow
try {
    $body = @{
        username = $username
        email = "debug$($username)@example.com"
        password = "password123"
        inviteCode = $inviteCode
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/invite-register" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ 用户注册: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "响应: $($response.Content)" -ForegroundColor Gray
    
    $userData = $response.Content | ConvertFrom-Json
    $userId = $userData.data.id
} catch {
    Write-Host "❌ 用户注册失败: $($_.Exception.Message)" -ForegroundColor Red
    $userId = 14
}

# 3. 测试用户登录
Write-Host "`n3. 测试用户登录" -ForegroundColor Yellow
try {
    $body = @{
        identifier = $username
        password = "password123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/local" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ 用户登录: $($response.StatusCode)" -ForegroundColor Green
    
    $loginData = $response.Content | ConvertFrom-Json
    $jwtToken = $loginData.jwt
    $userRole = $loginData.user.role
    
    Write-Host "JWT Token: $($jwtToken.Substring(0, 50))..." -ForegroundColor Gray
    Write-Host "用户角色: $($userRole.type) (ID: $($userRole.id))" -ForegroundColor Gray
    Write-Host "用户ID: $($loginData.user.id)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 用户登录失败: $($_.Exception.Message)" -ForegroundColor Red
    $jwtToken = ""
}

# 4. 测试不同的认证方式
if ($jwtToken) {
    Write-Host "`n4. 测试认证API访问" -ForegroundColor Yellow
    
    # 测试1: 使用Bearer token
    Write-Host "`n4.1 测试Bearer token认证" -ForegroundColor Cyan
    try {
        $headers = @{Authorization = "Bearer $jwtToken"}
        $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/user-wallet" -Method GET -Headers $headers
        Write-Host "✅ Bearer token认证成功: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "响应: $($response.Content)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Bearer token认证失败: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "状态码: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
            Write-Host "响应内容: $($_.Exception.Response.Content)" -ForegroundColor Red
        }
    }
    
    # 测试2: 使用Authorization header (不带Bearer)
    Write-Host "`n4.2 测试直接Authorization header" -ForegroundColor Cyan
    try {
        $headers = @{Authorization = $jwtToken}
        $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/user-wallet" -Method GET -Headers $headers
        Write-Host "✅ 直接Authorization成功: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "❌ 直接Authorization失败: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # 测试3: 使用查询参数传递用户ID
    Write-Host "`n4.3 测试查询参数方式" -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/user-wallet?userId=$userId" -Method GET
        Write-Host "✅ 查询参数方式: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "❌ 查询参数方式失败: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # 测试4: 检查用户角色API
    Write-Host "`n4.4 测试用户角色API" -ForegroundColor Cyan
    try {
        $headers = @{Authorization = "Bearer $jwtToken"}
        $response = Invoke-WebRequest -Uri "$baseUrl/api/users/$userId" -Method GET -Headers $headers
        Write-Host "✅ 用户角色API: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "响应: $($response.Content)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ 用户角色API失败: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 5. 测试公开API
Write-Host "`n5. 测试公开API" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues" -Method GET
    Write-Host "✅ 公开API: $($response.StatusCode)" -ForegroundColor Green
    $walletData = $response.Content | ConvertFrom-Json
    Write-Host "钱包数量: $($walletData.results.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 公开API失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Debug Complete ===" -ForegroundColor Green 