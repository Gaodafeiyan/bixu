$baseUrl = "http://118.107.4.158:1337"
$inviteCode = "I6C8N7"

Write-Host "=== 测试标准CRUD API ===" -ForegroundColor Green

# 1. 用户登录
$username = "testuser$(Get-Random -Minimum 1000 -Maximum 9999)"
Write-Host "1. 注册并登录用户: $username" -ForegroundColor Yellow

try {
    # 注册
    $body = @{
        username = $username
        email = "test$($username)@example.com"
        password = "password123"
        inviteCode = $inviteCode
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/invite-register" -Method POST -Body $body -ContentType "application/json"
    Write-Host "注册成功: $($response.StatusCode)" -ForegroundColor Green
    
    # 登录
    $body = @{
        identifier = $username
        password = "password123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/local" -Method POST -Body $body -ContentType "application/json"
    Write-Host "登录成功: $($response.StatusCode)" -ForegroundColor Green
    
    $loginData = $response.Content | ConvertFrom-Json
    $jwtToken = $loginData.jwt
    $userId = $loginData.user.id
    
    Write-Host "用户ID: $userId" -ForegroundColor Gray
    Write-Host "JWT Token: $($jwtToken.Substring(0, 50))..." -ForegroundColor Gray
} catch {
    Write-Host "登录失败: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 2. 测试标准CRUD API
Write-Host "`n2. 测试标准CRUD API" -ForegroundColor Yellow

$headers = @{Authorization = "Bearer $jwtToken"}

# 2.1 测试钱包标准CRUD
Write-Host "`n2.1 测试钱包标准CRUD" -ForegroundColor Cyan

# GET /qianbao-yues (公开)
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues" -Method GET
    Write-Host "✅ GET /qianbao-yues (公开): $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ GET /qianbao-yues (公开): $($_.Exception.Message)" -ForegroundColor Red
}

# GET /qianbao-yues/:id (需要认证)
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/1" -Method GET -Headers $headers
    Write-Host "✅ GET /qianbao-yues/1 (认证): $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ GET /qianbao-yues/1 (认证): $($_.Exception.Message)" -ForegroundColor Red
}

# POST /qianbao-yues (创建)
try {
    $body = @{
        usdtYue = "100"
        aiYue = "50"
        aiTokenBalances = "{}"
        user = $userId
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues" -Method POST -Body $body -ContentType "application/json" -Headers $headers
    Write-Host "✅ POST /qianbao-yues (创建): $($response.StatusCode)" -ForegroundColor Green
    $walletData = $response.Content | ConvertFrom-Json
    $walletId = $walletData.data.id
    Write-Host "创建的钱包ID: $walletId" -ForegroundColor Gray
} catch {
    Write-Host "❌ POST /qianbao-yues (创建): $($_.Exception.Message)" -ForegroundColor Red
    $walletId = 1
}

# PUT /qianbao-yues/:id (更新)
try {
    $body = @{
        usdtYue = "200"
        aiYue = "100"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/$walletId" -Method PUT -Body $body -ContentType "application/json" -Headers $headers
    Write-Host "✅ PUT /qianbao-yues/$walletId (更新): $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ PUT /qianbao-yues/$walletId (更新): $($_.Exception.Message)" -ForegroundColor Red
}

# 2.2 测试投资计划标准CRUD
Write-Host "`n2.2 测试投资计划标准CRUD" -ForegroundColor Cyan

# GET /dinggou-jihuas (公开)
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-jihuas" -Method GET
    Write-Host "✅ GET /dinggou-jihuas (公开): $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ GET /dinggou-jihuas (公开): $($_.Exception.Message)" -ForegroundColor Red
}

# GET /dinggou-jihuas/:id (需要认证)
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-jihuas/1" -Method GET -Headers $headers
    Write-Host "✅ GET /dinggou-jihuas/1 (认证): $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ GET /dinggou-jihuas/1 (认证): $($_.Exception.Message)" -ForegroundColor Red
}

# 3. 测试自定义路由
Write-Host "`n3. 测试自定义路由" -ForegroundColor Yellow

# 3.1 测试钱包自定义路由
Write-Host "`n3.1 测试钱包自定义路由" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/user-wallet" -Method GET -Headers $headers
    Write-Host "✅ GET /qianbao-yues/user-wallet (自定义): $($response.StatusCode)" -ForegroundColor Green
    Write-Host "响应: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ GET /qianbao-yues/user-wallet (自定义): $($_.Exception.Message)" -ForegroundColor Red
}

# 3.2 测试投资自定义路由
Write-Host "`n3.2 测试投资自定义路由" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-jihuas/my-investments" -Method GET -Headers $headers
    Write-Host "✅ GET /dinggou-jihuas/my-investments (自定义): $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ GET /dinggou-jihuas/my-investments (自定义): $($_.Exception.Message)" -ForegroundColor Red
}

# 4. 测试用户API
Write-Host "`n4. 测试用户API" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/users/me" -Method GET -Headers $headers
    Write-Host "✅ GET /users/me: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "响应: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ GET /users/me: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green 