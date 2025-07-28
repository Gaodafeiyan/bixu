const axios = require('axios');

// 配置
const BASE_URL = 'http://localhost:1337';
const ADMIN_TOKEN = 'your-admin-token-here'; // 请替换为实际的admin token

// 测试用户信息
const TEST_USER = {
  id: 30, // 用户ID 30
  username: '789'
};

async function debugLotteryChances() {
  try {
    console.log('🔍 开始调试抽奖机会问题...\n');

    // 1. 检查用户的抽奖机会
    console.log('1. 检查用户抽奖机会...');
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
      console.log(`  机会 ${index + 1}: ID=${chance.id}, 次数=${chance.attributes.count}, 已用=${chance.attributes.usedCount}, 原因=${chance.attributes.reason}`);
    });

    // 2. 检查用户的投资订单
    console.log('\n2. 检查用户投资订单...');
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
    console.log(`投资订单: ${orders.length} 个`);
    orders.forEach((order, index) => {
      console.log(`  订单 ${index + 1}: ID=${order.id}, 状态=${order.attributes.status}, 金额=${order.attributes.amount}, 赎回时间=${order.attributes.redeemed_at}`);
    });

    // 3. 检查认购计划的抽奖机会配置
    console.log('\n3. 检查认购计划配置...');
    const plansResponse = await axios.get(`${BASE_URL}/api/dinggou-jihuas`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      },
      params: {
        'pagination[pageSize]': 100
      }
    });

    const plans = plansResponse.data.data || [];
    console.log(`认购计划: ${plans.length} 个`);
    plans.forEach((plan, index) => {
      console.log(`  计划 ${index + 1}: ID=${plan.id}, 名称=${plan.attributes.name}, 抽奖机会=${plan.attributes.lottery_chances}`);
    });

    // 4. 检查奖品池
    console.log('\n4. 检查奖品池...');
    const prizesResponse = await axios.get(`${BASE_URL}/api/choujiang-jiangpins`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      },
      params: {
        'filters[kaiQi]': true,
        'pagination[pageSize]': 100
      }
    });

    const prizes = prizesResponse.data.data || [];
    console.log(`可用奖品: ${prizes.length} 个`);
    prizes.forEach((prize, index) => {
      console.log(`  奖品 ${index + 1}: ID=${prize.id}, 名称=${prize.attributes.name}, 概率=${prize.attributes.zhongJiangLv}%, 库存=${prize.attributes.currentQuantity || 0}/${prize.attributes.maxQuantity || '无限制'}`);
    });

    // 5. 尝试手动创建抽奖机会
    console.log('\n5. 尝试手动创建抽奖机会...');
    try {
      const createResponse = await axios.post(`${BASE_URL}/api/choujiang-jihuis/give-chance`, {
        userId: TEST_USER.id,
        count: 3,
        reason: '手动测试 - 投资赎回奖励',
        type: 'investment_redeem',
        sourceOrderId: 1
      }, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      });

      console.log('✅ 手动创建抽奖机会成功:', createResponse.data);
    } catch (error) {
      console.error('❌ 手动创建抽奖机会失败:', error.response?.data || error.message);
    }

    console.log('\n✅ 调试完成！');

  } catch (error) {
    console.error('❌ 调试失败:', error.response?.data || error.message);
  }
}

// 运行调试
debugLotteryChances(); 