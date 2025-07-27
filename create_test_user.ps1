# 创建测试用户
$API_BASE = "http://118.107.4.158:1337"

Write-Host "=== 创建测试用户 ===" -ForegroundColor Green

# 使用邀请码注册用户
try {
    $registerData = @{
        username = "testuser"
        email = "test@example.com"
        password = "123456"
        inviteCode = "I6C8N7"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$API_BASE/api/auth/invite-register" -Method POST -Body $registerData -ContentType "application/json" -TimeoutSec 10
    Write-Host "✅ 用户注册成功: $($response.StatusCode)" -ForegroundColor Green
    $result = $response.Content | ConvertFrom-Json
    Write-Host "   用户ID: $($result.user.id)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ 用户注册失败: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   状态码: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "   响应: $($_.Exception.Response.Content)" -ForegroundColor Red
    }
}

Write-Host "`n=== 完成 ===" -ForegroundColor Green 