$baseUrl = "http://118.107.4.158:1337"
$inviteCode = "I6C8N7"

Write-Host "=== 403 Problem Debug ===" -ForegroundColor Green

# 1. Test health check
Write-Host "1. Testing health check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/health" -Method GET
    Write-Host "Health check: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Test user registration
$username = "testuser$(Get-Random -Minimum 1000 -Maximum 9999)"
Write-Host "2. Testing user registration: $username" -ForegroundColor Yellow
try {
    $body = @{
        username = $username
        email = "test$($username)@example.com"
        password = "password123"
        inviteCode = $inviteCode
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/invite-register" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Registration: $($response.StatusCode)" -ForegroundColor Green
    
    $userData = $response.Content | ConvertFrom-Json
    $userId = $userData.data.id
} catch {
    Write-Host "Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    $userId = 14
}

# 3. Test user login
Write-Host "3. Testing user login..." -ForegroundColor Yellow
try {
    $body = @{
        identifier = $username
        password = "password123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/local" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Login: $($response.StatusCode)" -ForegroundColor Green
    
    $loginData = $response.Content | ConvertFrom-Json
    $jwtToken = $loginData.jwt
    $userRole = $loginData.user.role
    
    Write-Host "JWT Token: $($jwtToken.Substring(0, 50))..." -ForegroundColor Gray
    Write-Host "User Role: $($userRole.type) (ID: $($userRole.id))" -ForegroundColor Gray
    Write-Host "User ID: $($loginData.user.id)" -ForegroundColor Gray
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    $jwtToken = ""
}

# 4. Test authenticated API access
if ($jwtToken) {
    Write-Host "4. Testing authenticated API access..." -ForegroundColor Yellow
    
    # Test Bearer token
    Write-Host "4.1 Testing Bearer token..." -ForegroundColor Cyan
    try {
        $headers = @{Authorization = "Bearer $jwtToken"}
        $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/user-wallet" -Method GET -Headers $headers
        Write-Host "Bearer token success: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response: $($response.Content)" -ForegroundColor Gray
    } catch {
        Write-Host "Bearer token failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
            Write-Host "Content: $($_.Exception.Response.Content)" -ForegroundColor Red
        }
    }
}

# 5. Test public API
Write-Host "5. Testing public API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues" -Method GET
    Write-Host "Public API: $($response.StatusCode)" -ForegroundColor Green
    $walletData = $response.Content | ConvertFrom-Json
    Write-Host "Wallet count: $($walletData.results.Count)" -ForegroundColor Gray
} catch {
    Write-Host "Public API failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Debug Complete" -ForegroundColor Green 