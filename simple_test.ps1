# 简单API测试脚本
$baseUrl = "http://118.107.4.158:1337"
$inviteCode = "KQJ1ZG"

Write-Host "=== Bixu API 简单测试 ===" -ForegroundColor Green
Write-Host "服务器: $baseUrl" -ForegroundColor Yellow
Write-Host "邀请码: $inviteCode" -ForegroundColor Yellow
Write-Host ""

# 测试函数
function Test-API {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    Write-Host "测试: $Name" -ForegroundColor Cyan
    
    try {
        $params = @{
            Method = $Method
            Uri = $Url
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = $Body | ConvertTo-Json -Depth 10
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "✅ 成功" -ForegroundColor Green
        Write-Host "响应: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
        return $response
    }
    catch {
        Write-Host "❌ 失败" -ForegroundColor Red
        Write-Host "错误: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "响应体: $responseBody" -ForegroundColor Red
        }
        return $null
    }
    Write-Host ""
}

# 1. 测试服务器连接
Write-Host "=== 1. 测试服务器连接 ===" -ForegroundColor Magenta
try {
    $response = Invoke-WebRequest -Uri $baseUrl -Method GET -TimeoutSec 10
    Write-Host "✅ 服务器连接成功 - 状态码: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ 服务器连接失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. 验证邀请码
Write-Host "=== 2. 验证邀请码 ===" -ForegroundColor Magenta
$inviteValidation = Test-API -Name "验证邀请码" -Method "GET" -Url "$baseUrl/api/auth/validate-invite-code/$inviteCode"

if (-not $inviteValidation) {
    Write-Host "邀请码验证失败" -ForegroundColor Red
} else {
    Write-Host "邀请码验证成功" -ForegroundColor Green
}

# 3. 获取认购计划列表
Write-Host "=== 3. 获取认购计划列表 ===" -ForegroundColor Magenta
$plans = Test-API -Name "获取认购计划列表" -Method "GET" -Url "$baseUrl/api/dinggou-jihuas"

if ($plans -and $plans.data.Count -gt 0) {
    Write-Host "找到 $($plans.data.Count) 个认购计划" -ForegroundColor Green
} else {
    Write-Host "没有找到认购计划" -ForegroundColor Yellow
}

# 4. 测试用户注册
Write-Host "=== 4. 测试用户注册 ===" -ForegroundColor Magenta
$testUser = "testuser_$(Get-Random)"
$testEmail = "test_$(Get-Random)@example.com"
$testPassword = "TestPassword123!"

$registerData = @{
    username = $testUser
    email = $testEmail
    password = $testPassword
    inviteCode = $inviteCode
}

$registerResponse = Test-API -Name "邀请注册" -Method "POST" -Url "$baseUrl/api/auth/invite-register" -Body $registerData

if ($registerResponse) {
    Write-Host "用户注册成功: $testUser" -ForegroundColor Green
    
    # 5. 测试用户登录
    Write-Host "=== 5. 测试用户登录 ===" -ForegroundColor Magenta
    $loginData = @{
        identifier = $testUser
        password = $testPassword
    }
    
    $loginResponse = Test-API -Name "用户登录" -Method "POST" -Url "$baseUrl/api/auth/local" -Body $loginData
    
    if ($loginResponse) {
        $authToken = $loginResponse.jwt
        Write-Host "登录成功，获取到JWT Token" -ForegroundColor Green
        
        $headers = @{
            "Authorization" = "Bearer $authToken"
        }
        
        # 6. 测试获取用户钱包
        Write-Host "=== 6. 测试获取用户钱包 ===" -ForegroundColor Magenta
        $userWallet = Test-API -Name "获取用户钱包" -Method "GET" -Url "$baseUrl/api/qianbao-yues/user-wallet" -Headers $headers
        
        # 7. 测试获取我的邀请码
        Write-Host "=== 7. 测试获取我的邀请码 ===" -ForegroundColor Magenta
        $myInviteCode = Test-API -Name "获取我的邀请码" -Method "GET" -Url "$baseUrl/api/auth/my-invite-code" -Headers $headers
        
        # 8. 测试获取我的团队
        Write-Host "=== 8. 测试获取我的团队 ===" -ForegroundColor Magenta
        $myTeam = Test-API -Name "获取我的团队" -Method "GET" -Url "$baseUrl/api/auth/my-team?page=1`&pageSize=10" -Headers $headers
    }
} else {
    Write-Host "用户注册失败" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== 测试完成 ===" -ForegroundColor Green 