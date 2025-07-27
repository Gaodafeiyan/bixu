# Bixu 全面API测试脚本
$baseUrl = "http://118.107.4.158:1337"
$inviteCode = "1Q814C"
$testResults = @()

function Write-TestResult {
    param($testName, $success, $message, $response = "")
    $result = @{
        TestName = $testName
        Success = $success
        Message = $message
        Response = $response
        Timestamp = Get-Date
    }
    $testResults += $result
    
    if ($success) {
        Write-Host "✅ $testName : $message" -ForegroundColor Green
    } else {
        Write-Host "❌ $testName : $message" -ForegroundColor Red
    }
    if ($response) {
        Write-Host "   响应: $response" -ForegroundColor Gray
    }
}

Write-Host "=== Bixu 全面API功能测试 ===" -ForegroundColor Green
Write-Host "服务器: $baseUrl" -ForegroundColor Cyan
Write-Host "邀请码: $inviteCode" -ForegroundColor Cyan
Write-Host "开始时间: $(Get-Date)" -ForegroundColor Cyan

# ==================== 1. 健康检查测试 ====================
Write-Host "`n=== 1. 健康检查测试 ===" -ForegroundColor Yellow

# 钱包API健康检查
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/health" -Method GET -TimeoutSec 10
    Write-TestResult "钱包API健康检查" $true "状态码: $($response.StatusCode)" $response.Content
} catch {
    Write-TestResult "钱包API健康检查" $false $_.Exception.Message
}

# 认购计划API健康检查
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-jihuas/health" -Method GET -TimeoutSec 10
    Write-TestResult "认购计划API健康检查" $true "状态码: $($response.StatusCode)" $response.Content
} catch {
    Write-TestResult "认购计划API健康检查" $false $_.Exception.Message
}

# ==================== 2. 认证相关测试 ====================
Write-Host "`n=== 2. 认证相关测试 ===" -ForegroundColor Yellow

# 邀请码验证
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/validate-invite-code/$inviteCode" -Method GET -TimeoutSec 10
    Write-TestResult "邀请码验证" $true "状态码: $($response.StatusCode)" $response.Content
} catch {
    Write-TestResult "邀请码验证" $false $_.Exception.Message
}

# 用户注册
$username = "testuser$(Get-Random -Minimum 1000 -Maximum 9999)"
$email = "test$($username)@example.com"
try {
    $body = @{
        username = $username
        email = $email
        password = "password123"
        inviteCode = $inviteCode
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/invite-register" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-TestResult "用户注册" $true "状态码: $($response.StatusCode)" $response.Content
    
    # 解析用户ID
    $userData = $response.Content | ConvertFrom-Json
    $userId = $userData.data.id
} catch {
    Write-TestResult "用户注册" $false $_.Exception.Message
    $userId = 1  # 使用默认用户ID
}

# 用户登录
try {
    $body = @{
        identifier = $username
        password = "password123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/local" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-TestResult "用户登录" $true "状态码: $($response.StatusCode)" "登录成功"
    
    # 解析JWT token
    $loginData = $response.Content | ConvertFrom-Json
    $jwtToken = $loginData.jwt
} catch {
    Write-TestResult "用户登录" $false $_.Exception.Message
    $jwtToken = ""
}

# ==================== 3. 钱包功能测试 ====================
Write-Host "`n=== 3. 钱包功能测试 ===" -ForegroundColor Yellow

if ($jwtToken) {
    $headers = @{Authorization = "Bearer $jwtToken"}
    
    # 获取用户钱包
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/user-wallet" -Method GET -Headers $headers -TimeoutSec 10
        Write-TestResult "获取用户钱包" $true "状态码: $($response.StatusCode)" $response.Content
    } catch {
        Write-TestResult "获取用户钱包" $false $_.Exception.Message
    }
    
    # 钱包充值
    try {
        $body = @{
            data = @{
                user = $userId
                usdtYue = 1000
                aiYue = 500
            }
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/recharge" -Method POST -Body $body -Headers $headers -ContentType "application/json" -TimeoutSec 10
        Write-TestResult "钱包充值" $true "状态码: $($response.StatusCode)" $response.Content
    } catch {
        Write-TestResult "钱包充值" $false $_.Exception.Message
    }
    
    # 更新钱包
    try {
        $body = @{
            data = @{
                usdtYue = 1500
                aiYue = 800
            }
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/update-wallet" -Method PUT -Body $body -Headers $headers -ContentType "application/json" -TimeoutSec 10
        Write-TestResult "更新钱包" $true "状态码: $($response.StatusCode)" $response.Content
    } catch {
        Write-TestResult "更新钱包" $false $_.Exception.Message
    }
}

# ==================== 4. 认购计划功能测试 ====================
Write-Host "`n=== 4. 认购计划功能测试 ===" -ForegroundColor Yellow

# 获取所有认购计划
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-jihuas" -Method GET -TimeoutSec 10
    Write-TestResult "获取认购计划列表" $true "状态码: $($response.StatusCode)" $response.Content
    
    # 解析计划ID
    $plansData = $response.Content | ConvertFrom-Json
    $planId = $plansData.data[0].id
} catch {
    Write-TestResult "获取认购计划列表" $false $_.Exception.Message
    $planId = 1
}

if ($jwtToken -and $planId) {
    $headers = @{Authorization = "Bearer $jwtToken"}
    
    # 投资认购计划
    try {
        $body = @{
            data = @{
                plan = $planId
                investmentAmount = 100
                user = $userId
            }
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-jihuas/$planId/invest" -Method POST -Body $body -Headers $headers -ContentType "application/json" -TimeoutSec 10
        Write-TestResult "投资认购计划" $true "状态码: $($response.StatusCode)" $response.Content
    } catch {
        Write-TestResult "投资认购计划" $false $_.Exception.Message
    }
    
    # 获取我的投资
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-jihuas/my-investments" -Method GET -Headers $headers -TimeoutSec 10
        Write-TestResult "获取我的投资" $true "状态码: $($response.StatusCode)" $response.Content
    } catch {
        Write-TestResult "获取我的投资" $false $_.Exception.Message
    }
    
    # 获取计划统计
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-jihuas/$planId/stats" -Method GET -Headers $headers -TimeoutSec 10
        Write-TestResult "获取计划统计" $true "状态码: $($response.StatusCode)" $response.Content
    } catch {
        Write-TestResult "获取计划统计" $false $_.Exception.Message
    }
    
    # 获取计划参与者
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-jihuas/$planId/participants" -Method GET -Headers $headers -TimeoutSec 10
        Write-TestResult "获取计划参与者" $true "状态码: $($response.StatusCode)" $response.Content
    } catch {
        Write-TestResult "获取计划参与者" $false $_.Exception.Message
    }
}

# ==================== 5. 认购订单功能测试 ====================
Write-Host "`n=== 5. 认购订单功能测试 ===" -ForegroundColor Yellow

# 获取所有订单
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-dingdans" -Method GET -TimeoutSec 10
    Write-TestResult "获取订单列表" $true "状态码: $($response.StatusCode)" $response.Content
    
    # 解析订单ID
    $ordersData = $response.Content | ConvertFrom-Json
    $orderId = $ordersData.data[0].id
} catch {
    Write-TestResult "获取订单列表" $false $_.Exception.Message
    $orderId = 1
}

if ($jwtToken -and $orderId) {
    $headers = @{Authorization = "Bearer $jwtToken"}
    
    # 获取用户订单
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-dingdans/user-orders" -Method GET -Headers $headers -TimeoutSec 10
        Write-TestResult "获取用户订单" $true "状态码: $($response.StatusCode)" $response.Content
    } catch {
        Write-TestResult "获取用户订单" $false $_.Exception.Message
    }
    
    # 获取订单详情
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-dingdans/$orderId/detail" -Method GET -Headers $headers -TimeoutSec 10
        Write-TestResult "获取订单详情" $true "状态码: $($response.StatusCode)" $response.Content
    } catch {
        Write-TestResult "获取订单详情" $false $_.Exception.Message
    }
    
    # 更新订单状态
    try {
        $body = @{
            data = @{
                status = "completed"
            }
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$baseUrl/api/dinggou-dingdans/$orderId/status" -Method PUT -Body $body -Headers $headers -ContentType "application/json" -TimeoutSec 10
        Write-TestResult "更新订单状态" $true "状态码: $($response.StatusCode)" $response.Content
    } catch {
        Write-TestResult "更新订单状态" $false $_.Exception.Message
    }
}

# ==================== 6. 邀请奖励功能测试 ====================
Write-Host "`n=== 6. 邀请奖励功能测试 ===" -ForegroundColor Yellow

if ($jwtToken) {
    $headers = @{Authorization = "Bearer $jwtToken"}
    
    # 获取我的邀请码
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/my-invite-code" -Method GET -Headers $headers -TimeoutSec 10
        Write-TestResult "获取我的邀请码" $true "状态码: $($response.StatusCode)" $response.Content
    } catch {
        Write-TestResult "获取我的邀请码" $false $_.Exception.Message
    }
    
    # 获取我的团队
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/my-team" -Method GET -Headers $headers -TimeoutSec 10
        Write-TestResult "获取我的团队" $true "状态码: $($response.StatusCode)" $response.Content
    } catch {
        Write-TestResult "获取我的团队" $false $_.Exception.Message
    }
    
    # 创建邀请奖励
    try {
        $body = @{
            data = @{
                inviter = $userId
                invitee = $userId
                rewardAmount = 50
                rewardType = "usdt"
            }
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$baseUrl/api/yaoqing-jianglis/create-reward" -Method POST -Body $body -Headers $headers -ContentType "application/json" -TimeoutSec 10
        Write-TestResult "创建邀请奖励" $true "状态码: $($response.StatusCode)" $response.Content
    } catch {
        Write-TestResult "创建邀请奖励" $false $_.Exception.Message
    }
    
    # 获取用户奖励
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/yaoqing-jianglis/user-rewards" -Method GET -Headers $headers -TimeoutSec 10
        Write-TestResult "获取用户奖励" $true "状态码: $($response.StatusCode)" $response.Content
    } catch {
        Write-TestResult "获取用户奖励" $false $_.Exception.Message
    }
    
    # 获取团队统计
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/yaoqing-jianglis/team-stats" -Method GET -Headers $headers -TimeoutSec 10
        Write-TestResult "获取团队统计" $true "状态码: $($response.StatusCode)" $response.Content
    } catch {
        Write-TestResult "获取团队统计" $false $_.Exception.Message
    }
}

# ==================== 7. 标准CRUD操作测试 ====================
Write-Host "`n=== 7. 标准CRUD操作测试 ===" -ForegroundColor Yellow

# 钱包CRUD测试
try {
    $body = @{
        data = @{
            user = $userId
            usdtYue = 2000
            aiYue = 1000
        }
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-TestResult "创建钱包记录" $true "状态码: $($response.StatusCode)" $response.Content
    
    $walletData = $response.Content | ConvertFrom-Json
    $walletId = $walletData.data.id
    
    # 获取单个钱包
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/$walletId" -Method GET -TimeoutSec 10
    Write-TestResult "获取单个钱包" $true "状态码: $($response.StatusCode)" $response.Content
    
    # 更新钱包
    $updateBody = @{
        data = @{
            usdtYue = 2500
            aiYue = 1200
        }
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/$walletId" -Method PUT -Body $updateBody -ContentType "application/json" -TimeoutSec 10
    Write-TestResult "更新钱包记录" $true "状态码: $($response.StatusCode)" $response.Content
    
    # 删除钱包
    $response = Invoke-WebRequest -Uri "$baseUrl/api/qianbao-yues/$walletId" -Method DELETE -TimeoutSec 10
    Write-TestResult "删除钱包记录" $true "状态码: $($response.StatusCode)" $response.Content
} catch {
    Write-TestResult "钱包CRUD操作" $false $_.Exception.Message
}

# ==================== 8. 测试结果统计 ====================
Write-Host "`n=== 8. 测试结果统计 ===" -ForegroundColor Yellow

$totalTests = $testResults.Count
$successTests = ($testResults | Where-Object { $_.Success }).Count
$failedTests = $totalTests - $successTests

Write-Host "总测试数: $totalTests" -ForegroundColor Cyan
Write-Host "成功: $successTests" -ForegroundColor Green
Write-Host "失败: $failedTests" -ForegroundColor Red
Write-Host "成功率: $([math]::Round(($successTests / $totalTests) * 100, 2))%" -ForegroundColor Cyan

# 显示失败的测试
if ($failedTests -gt 0) {
    Write-Host "`n失败的测试:" -ForegroundColor Red
    $testResults | Where-Object { -not $_.Success } | ForEach-Object {
        Write-Host "  - $($_.TestName): $($_.Message)" -ForegroundColor Red
    }
}

# 保存测试结果到文件
$testResults | ConvertTo-Json -Depth 10 | Out-File -FilePath "api_test_results_$(Get-Date -Format 'yyyyMMdd_HHmmss').json" -Encoding UTF8

Write-Host "`n测试完成时间: $(Get-Date)" -ForegroundColor Cyan
Write-Host "测试结果已保存到 JSON 文件" -ForegroundColor Cyan 