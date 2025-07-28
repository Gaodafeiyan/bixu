# 测试邀请奖励功能
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzUzNjk3Njc0LCJleHAiOjE3NTQzMDI0NzR9.n4CM2trL0kCLqnwZB0GjbvrwvaCDKGewI9Mqrxus2ys"
$baseUrl = "http://118.107.4.158:1337"

Write-Host "=== 测试邀请奖励功能 ===" -ForegroundColor Green

# 1. 查看订单1的详细信息
Write-Host "1. 查看订单1的详细信息..." -ForegroundColor Yellow
$orderResponse = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-dingdans/1?populate=user,jihua" -Method GET
$order = $orderResponse.Content | ConvertFrom-Json
Write-Host "订单状态: $($order.status)" -ForegroundColor Cyan
Write-Host "投资金额: $($order.amount)" -ForegroundColor Cyan
Write-Host "用户ID: $($order.user.id)" -ForegroundColor Cyan
Write-Host "邀请人ID: $($order.user.invitedBy.id)" -ForegroundColor Cyan

# 2. 查看邀请人(用户4)的钱包余额
Write-Host "`n2. 查看邀请人(用户4)的钱包余额..." -ForegroundColor Yellow
$walletResponse = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues?filters[user][id][`$eq]=4" -Method GET
$wallets = $walletResponse.Content | ConvertFrom-Json
if ($wallets.results.Count -eq 0) {
    Write-Host "用户4还没有钱包记录" -ForegroundColor Red
} else {
    Write-Host "用户4钱包余额: $($wallets.results[0].usdtYue)" -ForegroundColor Cyan
}

# 3. 查看邀请人(用户4)的邀请奖励记录
Write-Host "`n3. 查看邀请人(用户4)的邀请奖励记录..." -ForegroundColor Yellow
$rewardResponse = Invoke-WebRequest -Uri "$baseUrl/api/yaoqing-jianglis?filters[user][id][`$eq]=4" -Method GET
$rewards = $rewardResponse.Content | ConvertFrom-Json
Write-Host "邀请奖励记录数量: $($rewards.results.Count)" -ForegroundColor Cyan
foreach ($reward in $rewards.results) {
    Write-Host "奖励ID: $($reward.id), 收益USDT: $($reward.shouyiUSDT)" -ForegroundColor Cyan
}

# 4. 尝试手动触发邀请奖励处理
Write-Host "`n4. 尝试手动触发邀请奖励处理..." -ForegroundColor Yellow
try {
    $body = @{
        orderId = 1
    } | ConvertTo-Json
    
    $rewardProcessResponse = Invoke-WebRequest -Uri "$baseUrl/api/investment-service/process-invitation-reward" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $token"} -Body $body
    Write-Host "邀请奖励处理响应: $($rewardProcessResponse.Content)" -ForegroundColor Green
} catch {
    Write-Host "邀请奖励处理失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. 再次查看邀请人(用户4)的钱包余额
Write-Host "`n5. 再次查看邀请人(用户4)的钱包余额..." -ForegroundColor Yellow
$walletResponse2 = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues?filters[user][id][`$eq]=4" -Method GET
$wallets2 = $walletResponse2.Content | ConvertFrom-Json
if ($wallets2.results.Count -eq 0) {
    Write-Host "用户4仍然没有钱包记录" -ForegroundColor Red
} else {
    Write-Host "用户4钱包余额: $($wallets2.results[0].usdtYue)" -ForegroundColor Cyan
}

# 6. 再次查看邀请人(用户4)的邀请奖励记录
Write-Host "`n6. 再次查看邀请人(用户4)的邀请奖励记录..." -ForegroundColor Yellow
$rewardResponse2 = Invoke-WebRequest -Uri "$baseUrl/api/yaoqing-jianglis?filters[user][id][`$eq]=4" -Method GET
$rewards2 = $rewardResponse2.Content | ConvertFrom-Json
Write-Host "邀请奖励记录数量: $($rewards2.results.Count)" -ForegroundColor Cyan
foreach ($reward in $rewards2.results) {
    Write-Host "奖励ID: $($reward.id), 收益USDT: $($reward.shouyiUSDT)" -ForegroundColor Cyan
}

Write-Host "`n=== 测试完成 ===" -ForegroundColor Green 