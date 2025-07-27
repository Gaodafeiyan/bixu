$baseUrl = "http://118.107.4.158:1337"
$inviteCode = "I6C8N7"

Write-Host "=== JWT Token Debug ===" -ForegroundColor Green

# 1. Login and get token
$username = "debuguser$(Get-Random -Minimum 1000 -Maximum 9999)"
Write-Host "1. Login: $username" -ForegroundColor Yellow

try {
    # Register
    $body = @{
        username = $username
        email = "debug$($username)@example.com"
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
    Write-Host "JWT Token: $($jwtToken.Substring(0, 50))..." -ForegroundColor Gray
    Write-Host "Full JWT Token: $jwtToken" -ForegroundColor Gray
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 2. Test different header formats
Write-Host "`n2. Test different header formats" -ForegroundColor Yellow

# 2.1 Bearer token
Write-Host "`n2.1 Bearer token" -ForegroundColor Cyan
try {
    $headers = @{Authorization = "Bearer $jwtToken"}
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/user-wallet" -Method GET -Headers $headers
    Write-Host "✅ Bearer token: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Bearer token: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Content: $($_.Exception.Response.Content)" -ForegroundColor Red
    }
}

# 2.2 Direct token
Write-Host "`n2.2 Direct token" -ForegroundColor Cyan
try {
    $headers = @{Authorization = $jwtToken}
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/user-wallet" -Method GET -Headers $headers
    Write-Host "✅ Direct token: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Direct token: $($_.Exception.Message)" -ForegroundColor Red
}

# 2.3 Token in query parameter
Write-Host "`n2.3 Token in query parameter" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/user-wallet?token=$jwtToken" -Method GET
    Write-Host "✅ Query token: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Query token: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Test standard CRUD with same token
Write-Host "`n3. Test standard CRUD" -ForegroundColor Yellow

$headers = @{Authorization = "Bearer $jwtToken"}

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/1" -Method GET -Headers $headers
    Write-Host "✅ GET /qianbao-yues/1: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ GET /qianbao-yues/1: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Test users/me endpoint
Write-Host "`n4. Test users/me" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/users/me" -Method GET -Headers $headers
    Write-Host "✅ GET /users/me: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ GET /users/me: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Debug Complete ===" -ForegroundColor Green 