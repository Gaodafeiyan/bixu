$baseUrl = "http://118.107.4.158:1337"
$inviteCode = "I6C8N7"

Write-Host "=== Bixu API Test ===" -ForegroundColor Green

# Test health checks
Write-Host "1. Testing wallet health check" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/health" -Method GET
    Write-Host "SUCCESS: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "2. Testing plan health check" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-jihuas/health" -Method GET
    Write-Host "SUCCESS: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test invite code validation
Write-Host "3. Testing invite code validation" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/validate-invite-code/$inviteCode" -Method GET
    Write-Host "SUCCESS: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test user registration
$username = "testuser$(Get-Random -Minimum 1000 -Maximum 9999)"
Write-Host "4. Testing user registration: $username" -ForegroundColor Yellow
try {
    $body = @{
        username = $username
        email = "test$($username)@example.com"
        password = "password123"
        inviteCode = $inviteCode
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/invite-register" -Method POST -Body $body -ContentType "application/json"
    Write-Host "SUCCESS: $($response.StatusCode)" -ForegroundColor Green
    
    $userData = $response.Content | ConvertFrom-Json
    $userId = $userData.data.id
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $userId = 14
}

# Test user login
Write-Host "5. Testing user login" -ForegroundColor Yellow
try {
    $body = @{
        identifier = $username
        password = "password123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/local" -Method POST -Body $body -ContentType "application/json"
    Write-Host "SUCCESS: $($response.StatusCode)" -ForegroundColor Green
    
    $loginData = $response.Content | ConvertFrom-Json
    $jwtToken = $loginData.jwt
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $jwtToken = ""
}

# Test authenticated APIs
if ($jwtToken) {
    $headers = @{Authorization = "Bearer $jwtToken"}
    
    Write-Host "6. Testing get user wallet" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/user-wallet" -Method GET -Headers $headers
        Write-Host "SUCCESS: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "7. Testing wallet recharge" -ForegroundColor Yellow
    try {
        $body = @{
            data = @{
                user = $userId
                usdtYue = 1000
                aiYue = 500
            }
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/recharge" -Method POST -Body $body -ContentType "application/json" -Headers $headers
        Write-Host "SUCCESS: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test public APIs
Write-Host "8. Testing wallet list" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues" -Method GET
    Write-Host "SUCCESS: $($response.StatusCode)" -ForegroundColor Green
    $walletData = $response.Content | ConvertFrom-Json
    Write-Host "Wallet count: $($walletData.results.Count)" -ForegroundColor Gray
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "9. Testing plan list" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-jihuas" -Method GET
    Write-Host "SUCCESS: $($response.StatusCode)" -ForegroundColor Green
    $planData = $response.Content | ConvertFrom-Json
    Write-Host "Plan count: $($planData.results.Count)" -ForegroundColor Gray
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "10. Testing order list" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-dingdans" -Method GET
    Write-Host "SUCCESS: $($response.StatusCode)" -ForegroundColor Green
    $orderData = $response.Content | ConvertFrom-Json
    Write-Host "Order count: $($orderData.results.Count)" -ForegroundColor Gray
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "11. Testing reward list" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/yaoqing-jianglis" -Method GET
    Write-Host "SUCCESS: $($response.StatusCode)" -ForegroundColor Green
    $rewardData = $response.Content | ConvertFrom-Json
    Write-Host "Reward count: $($rewardData.results.Count)" -ForegroundColor Gray
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "=== Test Complete ===" -ForegroundColor Green 