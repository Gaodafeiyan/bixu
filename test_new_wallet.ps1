# 测试重新创建的钱包API
$API_BASE = "http://118.107.4.158:1337"

Write-Host "=== Testing New Wallet API ===" -ForegroundColor Green

# 1. 测试健康检查
Write-Host "`n1. Testing health check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/api/qianbao-yues/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Health check: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. 测试标准CRUD API - 获取所有钱包
Write-Host "`n2. Testing GET /api/qianbao-yues (standard CRUD)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/api/qianbao-yues" -Method GET -TimeoutSec 10
    Write-Host "✅ GET /api/qianbao-yues: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Found $($data.data.Count) wallet records" -ForegroundColor Cyan
} catch {
    Write-Host "❌ GET /api/qianbao-yues failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. 测试创建钱包
Write-Host "`n3. Testing POST /api/qianbao-yues (create wallet)..." -ForegroundColor Yellow
try {
    $walletData = @{
        data = @{
            usdtYue = "100.00"
            aiYue = "50.00"
            aiTokenBalances = "{}"
            user = 21  # 使用测试用户ID
        }
    } | ConvertTo-Json -Depth 3

    $response = Invoke-WebRequest -Uri "$API_BASE/api/qianbao-yues" -Method POST -Body $walletData -ContentType "application/json" -TimeoutSec 10
    Write-Host "✅ POST /api/qianbao-yues: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Created wallet ID: $($data.data.id)" -ForegroundColor Cyan
    $walletId = $data.data.id
} catch {
    Write-Host "❌ POST /api/qianbao-yues failed: $($_.Exception.Message)" -ForegroundColor Red
    $walletId = 1  # 使用默认ID继续测试
}

# 4. 测试获取单个钱包
Write-Host "`n4. Testing GET /api/qianbao-yues/$walletId..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/api/qianbao-yues/$walletId" -Method GET -TimeoutSec 10
    Write-Host "✅ GET /api/qianbao-yues/$walletId: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Wallet USDT: $($data.data.usdtYue)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ GET /api/qianbao-yues/$walletId failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. 测试用户登录获取token
Write-Host "`n5. Testing user login to get token..." -ForegroundColor Yellow
try {
    $loginData = @{
        identifier = "testuser"
        password = "123456"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$API_BASE/api/auth/local" -Method POST -Body $loginData -ContentType "application/json" -TimeoutSec 10
    $loginResult = $response.Content | ConvertFrom-Json
    $token = $loginResult.jwt
    Write-Host "✅ Login successful, got token" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    $token = $null
}

# 6. 测试自定义路由（如果token存在）
if ($token) {
    Write-Host "`n6. Testing custom route with token..." -ForegroundColor Yellow
    
    # 测试自定义路由
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-WebRequest -Uri "$API_BASE/api/qianbao-yues/user-wallet" -Method GET -Headers $headers -TimeoutSec 10
        Write-Host "✅ GET /api/qianbao-yues/user-wallet: $($response.StatusCode)" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   User wallet USDT: $($data.data.usdtYue)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ GET /api/qianbao-yues/user-wallet failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green 