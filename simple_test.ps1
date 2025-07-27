$baseUrl = "http://118.107.4.158:1337"
$inviteCode = "I6C8N7"

Write-Host "=== Simple Test ===" -ForegroundColor Green

# 1. Login
$username = "testuser$(Get-Random -Minimum 1000 -Maximum 9999)"
Write-Host "1. Login user: $username" -ForegroundColor Yellow

try {
    # Register
    $body = @{
        username = $username
        email = "test$($username)@example.com"
        password = "password123"
        inviteCode = $inviteCode
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/invite-register" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Register: $($response.StatusCode)" -ForegroundColor Green
    
    # Login
    $body = @{
        identifier = $username
        password = "password123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/local" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Login: $($response.StatusCode)" -ForegroundColor Green
    
    $loginData = $response.Content | ConvertFrom-Json
    $jwtToken = $loginData.jwt
    $userId = $loginData.user.id
    
    Write-Host "User ID: $userId" -ForegroundColor Gray
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 2. Test standard CRUD
Write-Host "`n2. Test standard CRUD" -ForegroundColor Yellow

$headers = @{Authorization = "Bearer $jwtToken"}

# Test GET /qianbao-yues/1
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/1" -Method GET -Headers $headers
    Write-Host "GET /qianbao-yues/1: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "GET /qianbao-yues/1: $($_.Exception.Message)" -ForegroundColor Red
}

# Test POST /qianbao-yues
try {
    $body = @{
        usdtYue = "100"
        aiYue = "50"
        aiTokenBalances = "{}"
        user = $userId
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues" -Method POST -Body $body -ContentType "application/json" -Headers $headers
    Write-Host "POST /qianbao-yues: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "POST /qianbao-yues: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Test custom routes
Write-Host "`n3. Test custom routes" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/user-wallet" -Method GET -Headers $headers
    Write-Host "GET /qianbao-yues/user-wallet: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "GET /qianbao-yues/user-wallet: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Test Complete" -ForegroundColor Green 