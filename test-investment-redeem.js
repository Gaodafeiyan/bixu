const axios = require('axios');

// 配置
const BASE_URL = 'http://localhost:1337';
const ADMIN_TOKEN = 'your-admin-token-here'; // 请替换为实际的admin token

// 测试用户信息
const TEST_USER = {
  id: 30, // 用户ID 30
  username: '789'
};

async function testInvestmentRedeem() {
  try {
    console.log('🔍 开始测试投资赎回功能...\n');

    // 1. 获取用户的投资订单
    console.log('1. 获取用户投资订单...');
    const ordersResponse = await axios.get(`${BASE_URL}/api/dinggou-dingdans`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      },
      params: {
        'filters[user][id]': TEST_USER.id,
        'populate': ['jihua'],
        'pagination[pageSize]': 100
      }
    });

    const orders = ordersResponse.data.data || [];
    console.log(`找到 ${orders.length} 个投资订单`);

    // 查找可赎回的订单
    const redeemableOrders = orders.filter(order => 
      order.attributes.status === 'redeemable' || 
      (order.attributes.status === 'running' && new Date(order.attributes.end_at) <= new Date())
    );

    if (redeemableOrders.length === 0) {
      console.log('❌ 没有找到可赎回的订单');
      return;
    }

    const testOrder = redeemableOrders[0];
    console.log(`选择订单 ID: ${testOrder.id}, 状态: ${testOrder.attributes.status}`);

    // 2. 执行赎回
    console.log('\n2. 执行投资赎回...');
    const redeemResponse = await axios.post(`${BASE_URL}/api/dinggou-jihuas/${testOrder.id}/redeem`, {}, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });

    console.log('✅ 赎回成功:', redeemResponse.data);

    // 3. 检查抽奖机会
    console.log('\n3. 检查抽奖机会...');
    const chancesResponse = await axios.get(`${BASE_URL}/api/choujiang-jihuis`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      },
      params: {
        'filters[user][id]': TEST_USER.id,
        'populate': ['jiangpin']
      }
    });

    const chances = chancesResponse.data.data || [];
    console.log(`用户抽奖机会: ${chances.length} 个`);
    chances.forEach((chance, index) => {
      console.log(`  机会 ${index + 1}: ID=${chance.id}, 次数=${chance.attributes.count}, 已用=${chance.attributes.usedCount}`);
    });

    // 4. 检查钱包余额
    console.log('\n4. 检查钱包余额...');
    const walletResponse = await axios.get(`${BASE_URL}/api/qianbao-yues/user-wallet`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      },
      params: {
        'filters[user][id]': TEST_USER.id
      }
    });

    const wallet = walletResponse.data.data;
    console.log(`钱包余额: USDT=${wallet.usdtYue}, AI=${wallet.aiYue}`);

    // 5. 检查订单状态
    console.log('\n5. 检查订单状态...');
    const updatedOrderResponse = await axios.get(`${BASE_URL}/api/dinggou-dingdans/${testOrder.id}`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });

    const updatedOrder = updatedOrderResponse.data.data;
    console.log(`订单状态: ${updatedOrder.attributes.status}`);
    console.log(`赎回时间: ${updatedOrder.attributes.redeemed_at}`);
    console.log(`赎回金额: ${updatedOrder.attributes.payout_amount}`);

    console.log('\n✅ 测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testInvestmentRedeem(); 