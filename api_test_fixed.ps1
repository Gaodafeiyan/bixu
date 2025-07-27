# Bixu 系统全面API测试脚本
# 测试服务器: 118.107.4.158:1337
# 邀请码: KQJ1ZG

$baseUrl = "http://118.107.4.158:1337"
$inviteCode = "KQJ1ZG"
$testUser = "testuser_$(Get-Random)"
$testEmail = "test_$(Get-Random)@example.com"
$testPassword = "TestPassword123!"

# 全局变量
$global:authToken = ""
$global:userId = ""
$global:walletId = ""
$global:planId = ""
$global:orderId = ""

Write-Host "=== Bixu 系统全面API测试 ===" -ForegroundColor Green
Write-Host "服务器: $baseUrl" -ForegroundColor Yellow
Write-Host "邀请码: $inviteCode" -ForegroundColor Yellow
Write-Host "测试用户: $testUser" -ForegroundColor Yellow
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

# 1. 验证邀请码
Write-Host "=== 1. 验证邀请码 ===" -ForegroundColor Magenta
$inviteValidation = Test-API -Name "验证邀请码" -Method "GET" -Url "$baseUrl/api/auth/validate-invite-code/$inviteCode"

if (-not $inviteValidation) {
    Write-Host "邀请码验证失败，停止测试" -ForegroundColor Red
    exit 1
}

# 2. 邀请注册
Write-Host "=== 2. 邀请注册 ===" -ForegroundColor Magenta
$registerData = @{
    username = $testUser
    email = $testEmail
    password = $testPassword
    inviteCode = $inviteCode
}

$registerResponse = Test-API -Name "邀请注册" -Method "POST" -Url "$baseUrl/api/auth/invite-register" -Body $registerData

if (-not $registerResponse) {
    Write-Host "注册失败，停止测试" -ForegroundColor Red
    exit 1
}

$global:userId = $registerResponse.data.id
Write-Host "用户ID: $global:userId" -ForegroundColor Yellow

# 3. 用户登录
Write-Host "=== 3. 用户登录 ===" -ForegroundColor Magenta
$loginData = @{
    identifier = $testUser
    password = $testPassword
}

$loginResponse = Test-API -Name "用户登录" -Method "POST" -Url "$baseUrl/api/auth/local" -Body $loginData

if (-not $loginResponse) {
    Write-Host "登录失败，停止测试" -ForegroundColor Red
    exit 1
}

$global:authToken = $loginResponse.jwt
Write-Host "获取到JWT Token" -ForegroundColor Yellow

# 4. 获取我的邀请码
Write-Host "=== 4. 获取我的邀请码 ===" -ForegroundColor Magenta
$headers = @{
    "Authorization" = "Bearer $global:authToken"
}

$myInviteCode = Test-API -Name "获取我的邀请码" -Method "GET" -Url "$baseUrl/api/auth/my-invite-code" -Headers $headers

# 5. 获取我的团队
Write-Host "=== 5. 获取我的团队 ===" -ForegroundColor Magenta
$myTeam = Test-API -Name "获取我的团队" -Method "GET" -Url "$baseUrl/api/auth/my-team?page=1`&pageSize=10" -Headers $headers

# 6. 获取用户钱包
Write-Host "=== 6. 获取用户钱包 ===" -ForegroundColor Magenta
$userWallet = Test-API -Name "获取用户钱包" -Method "GET" -Url "$baseUrl/api/qianbao-yues/user-wallet" -Headers $headers

if ($userWallet) {
    $global:walletId = $userWallet.data.id
    Write-Host "钱包ID: $global:walletId" -ForegroundColor Yellow
}

# 7. 更新钱包余额
Write-Host "=== 7. 更新钱包余额 ===" -ForegroundColor Magenta
$updateWalletData = @{
    usdtYue = "1000.00"
    aiYue = "50.00"
}

$updateWallet = Test-API -Name "更新钱包余额" -Method "PUT" -Url "$baseUrl/api/qianbao-yues/update-wallet" -Body $updateWalletData -Headers $headers

# 8. 充值钱包
Write-Host "=== 8. 充值钱包 ===" -ForegroundColor Magenta
$rechargeData = @{
    data = @{
        user = $global:userId
        usdtYue = "500.00"
        aiYue = "25.00"
    }
}

$rechargeWallet = Test-API -Name "充值钱包" -Method "POST" -Url "$baseUrl/api/qianbao-yues/recharge" -Body $rechargeData -Headers $headers

# 9. 获取认购计划列表
Write-Host "=== 9. 获取认购计划列表 ===" -ForegroundColor Magenta
$plans = Test-API -Name "获取认购计划列表" -Method "GET" -Url "$baseUrl/api/dinggou-jihuas"

if ($plans -and $plans.data.Count -gt 0) {
    $global:planId = $plans.data[0].id
    Write-Host "选择计划ID: $global:planId" -ForegroundColor Yellow
}

# 10. 获取计划统计
if ($global:planId) {
    Write-Host "=== 10. 获取计划统计 ===" -ForegroundColor Magenta
    $planStats = Test-API -Name "获取计划统计" -Method "GET" -Url "$baseUrl/api/dinggou-jihuas/$global:planId/stats" -Headers $headers
}

# 11. 投资认购计划
if ($global:planId) {
    Write-Host "=== 11. 投资认购计划 ===" -ForegroundColor Magenta
    $investData = @{
        amount = "100.00"
    }
    
    $investment = Test-API -Name "投资认购计划" -Method "POST" -Url "$baseUrl/api/dinggou-jihuas/$global:planId/invest" -Body $investData -Headers $headers
    
    if ($investment) {
        $global:orderId = $investment.data.id
        Write-Host "订单ID: $global:orderId" -ForegroundColor Yellow
    }
}

# 12. 获取我的投资
Write-Host "=== 12. 获取我的投资 ===" -ForegroundColor Magenta
$myInvestments = Test-API -Name "获取我的投资" -Method "GET" -Url "$baseUrl/api/dinggou-jihuas/my-investments?page=1`&pageSize=10" -Headers $headers

# 13. 获取用户订单
Write-Host "=== 13. 获取用户订单 ===" -ForegroundColor Magenta
$userOrders = Test-API -Name "获取用户订单" -Method "GET" -Url "$baseUrl/api/dinggou-dingdans/user-orders?page=1`&pageSize=10" -Headers $headers

# 14. 获取订单详情
if ($global:orderId) {
    Write-Host "=== 14. 获取订单详情 ===" -ForegroundColor Magenta
    $orderDetail = Test-API -Name "获取订单详情" -Method "GET" -Url "$baseUrl/api/dinggou-dingdans/$global:orderId/detail" -Headers $headers
}

# 15. 创建邀请奖励
Write-Host "=== 15. 创建邀请奖励 ===" -ForegroundColor Magenta
$rewardData = @{
    data = @{
        tuijianRen = $inviteValidation.data.inviter.id
        laiyuanRen = $global:userId
        shouyiUSDT = "25.00"
        laiyuanDan = $global:orderId
    }
}

$createReward = Test-API -Name "创建邀请奖励" -Method "POST" -Url "$baseUrl/api/yaoqing-jianglis/create-reward" -Body $rewardData -Headers $headers

# 16. 获取用户邀请奖励
Write-Host "=== 16. 获取用户邀请奖励 ===" -ForegroundColor Magenta
$userRewards = Test-API -Name "获取用户邀请奖励" -Method "GET" -Url "$baseUrl/api/yaoqing-jianglis/user-rewards?page=1`&pageSize=10" -Headers $headers

# 17. 获取团队统计
Write-Host "=== 17. 获取团队统计 ===" -ForegroundColor Magenta
$teamStats = Test-API -Name "获取团队统计" -Method "GET" -Url "$baseUrl/api/yaoqing-jianglis/team-stats" -Headers $headers

# 18. 测试赎回投资（如果订单状态允许）
if ($global:orderId) {
    Write-Host "=== 18. 测试赎回投资 ===" -ForegroundColor Magenta
    $redeemInvestment = Test-API -Name "赎回投资" -Method "POST" -Url "$baseUrl/api/dinggou-jihuas/$global:orderId/redeem" -Headers $headers
}

# 19. 测试健康检查
Write-Host "=== 19. 健康检查 ===" -ForegroundColor Magenta
$healthCheck = Test-API -Name "健康检查" -Method "GET" -Url "$baseUrl/api/health"

# 20. 测试系统信息
Write-Host "=== 20. 系统信息 ===" -ForegroundColor Magenta
$systemInfo = Test-API -Name "系统信息" -Method "GET" -Url "$baseUrl/api/system-info"

Write-Host ""
Write-Host "=== 测试完成 ===" -ForegroundColor Green
Write-Host "测试用户: $testUser" -ForegroundColor Yellow
Write-Host "用户ID: $global:userId" -ForegroundColor Yellow
Write-Host "钱包ID: $global:walletId" -ForegroundColor Yellow
Write-Host "计划ID: $global:planId" -ForegroundColor Yellow
Write-Host "订单ID: $global:orderId" -ForegroundColor Yellow
Write-Host ""
Write-Host "All API functionality tests completed!" -ForegroundColor Green 