const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 测试用户信息
const TEST_USER = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Test123456',
  inviteCode: '1Q814C'
};

let authToken = '';
let userId = null;
let userWalletId = null;

// 工具函数
const log = (message, data = null) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

// 1. 用户注册
async function registerUser() {
  try {
    log('=== 用户注册 ===');
    const response = await axios.post(`${BASE_URL}/api/auth/invite-register`, TEST_USER);
    log('✅ 用户注册成功', {
      id: response.data.user.id,
      username: response.data.user.username,
      inviteCode: response.data.user.inviteCode
    });
    userId = response.data.user.id;
    return response.data.user;
  } catch (error) {
    if (error.response?.status === 400 && error.response.data.error.message.includes('已存在')) {
      log('⚠️ 用户已存在，尝试登录');
      return await loginUser();
    } else {
      log('❌ 用户注册失败', error.response?.data || error.message);
      throw error;
    }
  }
}

// 2. 用户登录
async function loginUser() {
  try {
    log('=== 用户登录 ===');
    const response = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: TEST_USER.email,
      password: TEST_USER.password
    });
    
    authToken = response.data.jwt;
    userId = response.data.user.id;
    
    log('✅ 用户登录成功', {
      id: response.data.user.id,
      username: response.data.user.username,
      token: authToken.substring(0, 20) + '...'
    });
    
    return response.data.user;
  } catch (error) {
    log('❌ 用户登录失败', error.response?.data || error.message);
    throw error;
  }
}

// 3. 获取用户钱包
async function getUserWallet() {
  try {
    log('=== 获取用户钱包 ===');
    const response = await axios.get(`${BASE_URL}/api/qianbao-yues/user-wallet`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    userWalletId = response.data.data.id;
    log('✅ 获取钱包成功', {
      id: response.data.data.id,
      usdtYue: response.data.data.usdtYue,
      aiYue: response.data.data.aiYue
    });
    
    return response.data.data;
  } catch (error) {
    log('❌ 获取钱包失败', error.response?.data || error.message);
    throw error;
  }
}

// 4. 充值钱包
async function rechargeWallet(amount = '1000') {
  try {
    log(`=== 充值钱包 ${amount} USDT ===`);
    const response = await axios.post(`${BASE_URL}/api/qianbao-yues/recharge`, {
      data: {
        user: userId,
        usdtYue: amount
      }
    }, {
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    });
    
    log('✅ 充值成功', {
      usdtYue: response.data.data.usdtYue
    });
    
    return response.data.data;
  } catch (error) {
    log('❌ 充值失败', error.response?.data || error.message);
    throw error;
  }
}

// 5. 获取认购计划列表
async function getSubscriptionPlans() {
  try {
    log('=== 获取认购计划列表 ===');
    const response = await axios.get(`${BASE_URL}/api/dinggou-jihuas`);
    
    log('✅ 获取计划列表成功', {
      count: response.data.data.length,
      plans: response.data.data.map(p => ({
        id: p.id,
        name: p.name,
        benjinUSDT: p.benjinUSDT,
        jingtaiBili: p.jingtaiBili,
        aiBili: p.aiBili,
        zhouQiTian: p.zhouQiTian
      }))
    });
    
    return response.data.data;
  } catch (error) {
    log('❌ 获取计划列表失败', error.response?.data || error.message);
    throw error;
  }
}

// 6. 投资认购计划
async function investInPlan(planId) {
  try {
    log(`=== 投资计划 ${planId} ===`);
    const response = await axios.post(`${BASE_URL}/api/dinggou-jihuas/${planId}/invest`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    log('✅ 投资成功', {
      orderId: response.data.data.orderId,
      investmentAmount: response.data.data.investmentAmount,
      planName: response.data.data.planName,
      newBalance: response.data.data.newBalance,
      status: response.data.data.status
    });
    
    return response.data.data;
  } catch (error) {
    log('❌ 投资失败', error.response?.data || error.message);
    throw error;
  }
}

// 7. 获取我的投资
async function getMyInvestments() {
  try {
    log('=== 获取我的投资 ===');
    const response = await axios.get(`${BASE_URL}/api/dinggou-jihuas/my-investments`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    log('✅ 获取投资列表成功', {
      count: response.data.data.orders.length,
      orders: response.data.data.orders.map(o => ({
        id: o.id,
        amount: o.amount,
        status: o.status,
        start_at: o.start_at,
        end_at: o.end_at
      }))
    });
    
    return response.data.data.orders;
  } catch (error) {
    log('❌ 获取投资列表失败', error.response?.data || error.message);
    throw error;
  }
}

// 8. 模拟订单到期（手动更新状态）
async function simulateOrderExpiration(orderId) {
  try {
    log(`=== 模拟订单 ${orderId} 到期 ===`);
    
    // 直接更新订单状态为redeemable
    const response = await axios.put(`${BASE_URL}/api/dinggou-dingdans/${orderId}`, {
      data: { status: 'redeemable' }
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    log('✅ 订单状态更新成功', {
      id: response.data.data.id,
      status: response.data.data.status
    });
    
    return response.data.data;
  } catch (error) {
    log('❌ 更新订单状态失败', error.response?.data || error.message);
    throw error;
  }
}

// 9. 赎回投资
async function redeemInvestment(orderId) {
  try {
    log(`=== 赎回订单 ${orderId} ===`);
    const response = await axios.post(`${BASE_URL}/api/dinggou-jihuas/redeem/${orderId}`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    log('✅ 赎回成功', {
      orderId: response.data.data.orderId,
      investmentAmount: response.data.data.investmentAmount,
      staticYield: response.data.data.staticYield,
      totalPayout: response.data.data.totalPayout,
      aiTokenReward: response.data.data.aiTokenReward,
      lotteryChances: response.data.data.lotteryChances
    });
    
    return response.data.data;
  } catch (error) {
    log('❌ 赎回失败', error.response?.data || error.message);
    throw error;
  }
}

// 10. 验证最终余额
async function verifyFinalBalance() {
  try {
    log('=== 验证最终余额 ===');
    const response = await axios.get(`${BASE_URL}/api/qianbao-yues/user-wallet`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    log('✅ 最终余额', {
      usdtYue: response.data.data.usdtYue,
      aiYue: response.data.data.aiYue
    });
    
    return response.data.data;
  } catch (error) {
    log('❌ 获取最终余额失败', error.response?.data || error.message);
    throw error;
  }
}

// 主测试流程
async function runInvestmentFlowTest() {
  try {
    log('🚀 开始投资流程测试');
    
    // 1. 用户注册/登录
    await registerUser();
    
    // 2. 获取钱包
    await getUserWallet();
    
    // 3. 充值钱包
    await rechargeWallet('1000');
    
    // 4. 获取认购计划
    const plans = await getSubscriptionPlans();
    
    if (plans.length === 0) {
      log('❌ 没有可用的认购计划，请先运行 init-test-data.js');
      return;
    }
    
    // 5. 投资第一个计划
    const firstPlan = plans[0];
    await investInPlan(firstPlan.id);
    
    // 6. 查看投资状态
    await getMyInvestments();
    
    // 7. 模拟订单到期
    const investments = await getMyInvestments();
    if (investments.length > 0) {
      await simulateOrderExpiration(investments[0].id);
    }
    
    // 8. 赎回投资
    if (investments.length > 0) {
      await redeemInvestment(investments[0].id);
    }
    
    // 9. 验证最终余额
    await verifyFinalBalance();
    
    log('🎉 投资流程测试完成');
    
  } catch (error) {
    log('❌ 测试过程中发生错误', error.message);
  }
}

// 运行测试
runInvestmentFlowTest(); 