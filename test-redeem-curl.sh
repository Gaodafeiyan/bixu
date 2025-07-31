#!/bin/bash

# 配置
BASE_URL="http://118.107.4.158:1337"
USERNAME="123"
PASSWORD="123456"

echo "🔍 🔍 🔍 === 开始测试赎回API === 🔍 🔍 🔍"

# 1. 登录获取token
echo -e "\n1. 登录获取认证token..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/local" \
  -H "Content-Type: application/json" \
  -d "{
    \"identifier\": \"$USERNAME\",
    \"password\": \"$PASSWORD\"
  }")

echo "登录响应: $LOGIN_RESPONSE"

# 提取JWT token
JWT_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"jwt":"[^"]*"' | cut -d'"' -f4)

if [ -z "$JWT_TOKEN" ]; then
    echo "❌ 登录失败，无法获取token"
    exit 1
fi

echo "✅ 登录成功，获取到token: ${JWT_TOKEN:0:20}..."

# 2. 获取用户的投资订单
echo -e "\n2. 获取用户的投资订单..."
ORDERS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/dinggou-dingdans/user-orders?page=1&pageSize=10" \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "订单列表响应: $ORDERS_RESPONSE"

# 3. 查找可赎回的订单（这里需要手动指定一个订单ID进行测试）
# 由于curl脚本无法复杂解析JSON，我们直接测试一个已知的订单ID
TEST_ORDER_ID="50"  # 请根据实际情况修改这个订单ID

echo -e "\n3. 测试订单ID: $TEST_ORDER_ID"

# 4. 执行赎回操作
echo -e "\n4. 执行赎回操作..."
echo "调用API: POST $BASE_URL/api/dinggou-jihuas/$TEST_ORDER_ID/redeem"

REDEEM_RESPONSE=$(curl -s -X POST "$BASE_URL/api/dinggou-jihuas/$TEST_ORDER_ID/redeem" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{}")

echo -e "\n🔍 🔍 🔍 === 赎回API响应 === 🔍 🔍 🔍"
echo "完整响应: $REDEEM_RESPONSE"

# 5. 分析响应数据
if echo "$REDEEM_RESPONSE" | grep -q '"success":true'; then
    echo -e "\n🔍 🔍 🔍 === 响应数据分析 === 🔍 🔍 🔍"
    
    # 提取lotteryChances值
    LOTTERY_CHANCES=$(echo "$REDEEM_RESPONSE" | grep -o '"lotteryChances":[0-9]*' | cut -d':' -f2)
    
    echo "lotteryChances 值: $LOTTERY_CHANCES"
    
    if [ "$LOTTERY_CHANCES" -gt 0 ]; then
        echo "✅ 赎回成功，lotteryChances = $LOTTERY_CHANCES，应该显示动态弹窗！"
    else
        echo "❌ 赎回成功，但lotteryChances = $LOTTERY_CHANCES，不会显示动态弹窗"
    fi
else
    echo "❌ 赎回失败"
    echo "错误信息: $REDEEM_RESPONSE"
fi

echo -e "\n🔍 🔍 🔍 === 测试完成 === 🔍 🔍 🔍" 