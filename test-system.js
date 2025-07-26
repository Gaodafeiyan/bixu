const axios = require('axios');
const Decimal = require('decimal.js');

// 配置
const BASE_URL = 'http://localhost:1337';
const API_URL = `${BASE_URL}/api`;

// 测试数据
const testUsers = [
  {
    username: 'testuser1',
    email: 'test1@example.com',
    password: 'Test123456',
    inviteCode: 'INVITE001'
  },
  {
    username: 'testuser2', 
    email: 'test2@example.com',
    password: 'Test123456',
    inviteCode: 'INVITE002'
  }
];

let authTokens = {};
let testData = {};

// 工具函数
const log = (message, data = null) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

const makeRequest = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    log(`请求失败: ${endpoint}`, {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    throw error;
  }
};

// 测试用例
const tests = {
  // 1. 测试邀请码验证
  async testInviteCodeValidation() {
    log('=== 测试邀请码验证 ===');
    
    // 测试无效邀请码
    try {
      await makeRequest('GET', '/auth/validate-invite-code/INVALID_CODE');
      log('❌ 应该返回错误但成功了');
    } catch (error) {
      if (error.response?.status === 400) {
        log('✅ 无效邀请码验证正确');
      }
    }
    
    // 测试有效邀请码（需要先创建用户）
    try {
      await makeRequest('GET', '/auth/validate-invite-code/INVITE001');
      log('✅ 邀请码验证功能正常');
    } catch (error) {
      log('❌ 邀请码验证失败', error.response?.data);
    }
  },

  // 2. 测试用户注册
  async testUserRegistration() {
    log('=== 测试用户注册 ===');
    
    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      try {
        const result = await makeRequest('POST', '/auth/invite-register', {
          username: user.username,
          email: user.email,
          password: user.password,
          inviteCode: user.inviteCode
        });
        
        authTokens[user.username] = result.jwt;
        testData[user.username] = result.user;
        
        log(`✅ 用户 ${user.username} 注册成功`, {
          id: result.user.id,
          inviteCode: result.user.inviteCode
        });
      } catch (error) {
        log(`❌ 用户 ${user.username} 注册失败`, error.response?.data);
      }
    }
  },

  // 3. 测试钱包功能
  async testWalletOperations() {
    log('=== 测试钱包功能 ===');
    
    for (const username of Object.keys(authTokens)) {
      const token = authTokens[username];
      
      try {
        // 获取用户钱包
        const wallet = await makeRequest('GET', '/qianbao-yues/get-user-wallet', null, token);
        log(`✅ 用户 ${username} 钱包获取成功`, wallet);
        
        // 充值钱包
        const rechargeData = {
          usdtAmount: '1000.00',
          aiAmount: '500.00'
        };
        
        const rechargeResult = await makeRequest('POST', '/qianbao-yues/recharge', rechargeData, token);
        log(`✅ 用户 ${username} 钱包充值成功`, rechargeResult);
        
      } catch (error) {
        log(`❌ 用户 ${username} 钱包操作失败`, error.response?.data);
      }
    }
  },

  // 4. 测试认购计划
  async testSubscriptionPlans() {
    log('=== 测试认购计划 ===');
    
    try {
      // 获取所有计划
      const plans = await makeRequest('GET', '/dinggou-jihuas');
      log('✅ 获取认购计划列表成功', plans);
      
      if (plans.data && plans.data.length > 0) {
        testData.selectedPlan = plans.data[0];
        log(`选择计划: ${testData.selectedPlan.attributes.name}`);
      } else {
        log('⚠️ 没有可用的认购计划');
      }
      
    } catch (error) {
      log('❌ 获取认购计划失败', error.response?.data);
    }
  },

  // 5. 测试投资功能
  async testInvestment() {
    log('=== 测试投资功能 ===');
    
    if (!testData.selectedPlan) {
      log('⚠️ 跳过投资测试 - 没有可用计划');
      return;
    }
    
    const username = testUsers[0].username;
    const token = authTokens[username];
    
    try {
      const investmentData = {
        planId: testData.selectedPlan.id,
        amount: '100.00'
      };
      
      const result = await makeRequest('POST', '/dinggou-jihuas/invest', investmentData, token);
      log(`✅ 用户 ${username} 投资成功`, result);
      
      testData.investmentOrder = result.order;
      
    } catch (error) {
      log(`❌ 用户 ${username} 投资失败`, error.response?.data);
    }
  },

  // 6. 测试订单查询
  async testOrderQueries() {
    log('=== 测试订单查询 ===');
    
    for (const username of Object.keys(authTokens)) {
      const token = authTokens[username];
      
      try {
        // 获取用户订单
        const orders = await makeRequest('GET', '/dinggou-dingdans/get-user-orders', null, token);
        log(`✅ 用户 ${username} 订单查询成功`, orders);
        
        // 获取我的投资
        const investments = await makeRequest('GET', '/dinggou-jihuas/get-my-investments', null, token);
        log(`✅ 用户 ${username} 投资查询成功`, investments);
        
      } catch (error) {
        log(`❌ 用户 ${username} 订单查询失败`, error.response?.data);
      }
    }
  },

  // 7. 测试邀请奖励
  async testInvitationRewards() {
    log('=== 测试邀请奖励 ===');
    
    for (const username of Object.keys(authTokens)) {
      const token = authTokens[username];
      
      try {
        // 获取我的邀请码
        const inviteCode = await makeRequest('GET', '/auth/my-invite-code', null, token);
        log(`✅ 用户 ${username} 邀请码获取成功`, inviteCode);
        
        // 获取我的团队
        const team = await makeRequest('GET', '/auth/my-team', null, token);
        log(`✅ 用户 ${username} 团队信息获取成功`, team);
        
        // 获取邀请奖励
        const rewards = await makeRequest('GET', '/yaoqing-jianglis/get-user-rewards', null, token);
        log(`✅ 用户 ${username} 邀请奖励查询成功`, rewards);
        
      } catch (error) {
        log(`❌ 用户 ${username} 邀请相关查询失败`, error.response?.data);
      }
    }
  },

  // 8. 测试计划统计
  async testPlanStats() {
    log('=== 测试计划统计 ===');
    
    if (!testData.selectedPlan) {
      log('⚠️ 跳过计划统计测试 - 没有可用计划');
      return;
    }
    
    try {
      const stats = await makeRequest('GET', `/dinggou-jihuas/get-plan-stats/${testData.selectedPlan.id}`);
      log('✅ 计划统计获取成功', stats);
      
    } catch (error) {
      log('❌ 计划统计获取失败', error.response?.data);
    }
  },

  // 9. 测试赎回功能
  async testRedemption() {
    log('=== 测试赎回功能 ===');
    
    if (!testData.investmentOrder) {
      log('⚠️ 跳过赎回测试 - 没有投资订单');
      return;
    }
    
    const username = testUsers[0].username;
    const token = authTokens[username];
    
    try {
      const redemptionData = {
        orderId: testData.investmentOrder.id
      };
      
      const result = await makeRequest('POST', '/dinggou-jihuas/redeem', redemptionData, token);
      log(`✅ 用户 ${username} 赎回成功`, result);
      
    } catch (error) {
      log(`❌ 用户 ${username} 赎回失败`, error.response?.data);
    }
  }
};

// 主测试函数
async function runTests() {
  log('🚀 开始系统功能测试');
  
  try {
    // 按顺序执行测试
    await tests.testInviteCodeValidation();
    await tests.testUserRegistration();
    await tests.testWalletOperations();
    await tests.testSubscriptionPlans();
    await tests.testInvestment();
    await tests.testOrderQueries();
    await tests.testInvitationRewards();
    await tests.testPlanStats();
    await tests.testRedemption();
    
    log('🎉 所有测试完成');
    
  } catch (error) {
    log('❌ 测试过程中发生错误', error);
  }
}

// 运行测试
if (require.main === module) {
  runTests();
}

module.exports = { tests, runTests }; 