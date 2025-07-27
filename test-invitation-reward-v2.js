const axios = require('axios');

const BASE_URL = 'http://localhost:1337';

// 测试用户信息
const TEST_USERS = {
  inviter: {
    username: 'inviter_test',
    email: 'inviter@example.com',
    password: 'Test123456',
    inviteCode: 'INVITER123'
  },
  invitee: {
    username: 'invitee_test',
    email: 'invitee@example.com',
    password: 'Test123456',
    inviteCode: 'INVITER123'
  }
};

let inviterToken = '';
let inviteeToken = '';
let inviterId = null;
let inviteeId = null;

// 工具函数
const log = (message, data = null) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

// 1. 创建邀请人账户
async function createInviter() {
  try {
    log('=== 创建邀请人账户 ===');
    const response = await axios.post(`${BASE_URL}/api/auth/invite-register`, TEST_USERS.inviter);
    
    if (response.data.success) {
      inviterId = response.data.data.id;
      log('✅ 邀请人创建成功', { id: inviterId, username: response.data.data.username });
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    if (error.response?.status === 400 && error.response.data.error.message.includes('已存在')) {
      log('⚠️ 邀请人已存在，尝试登录');
      return await loginInviter();
    } else {
      log('❌ 邀请人创建失败', error.response?.data || error.message);
      throw error;
    }
  }
}

// 2. 邀请人登录
async function loginInviter() {
  try {
    log('=== 邀请人登录 ===');
    const response = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: TEST_USERS.inviter.email,
      password: TEST_USERS.inviter.password
    });
    
    inviterToken = response.data.jwt;
    inviterId = response.data.user.id;
    
    log('✅ 邀请人登录成功', {
      id: inviterId,
      username: response.data.user.username,
      token: inviterToken.substring(0, 20) + '...'
    });
    
    return response.data.user;
  } catch (error) {
    log('❌ 邀请人登录失败', error.response?.data || error.message);
    throw error;
  }
}

// 3. 创建被邀请人账户
async function createInvitee() {
  try {
    log('=== 创建被邀请人账户 ===');
    const response = await axios.post(`${BASE_URL}/api/auth/invite-register`, TEST_USERS.invitee);
    
    if (response.data.success) {
      inviteeId = response.data.data.id;
      log('✅ 被邀请人创建成功', { id: inviteeId, username: response.data.data.username });
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    if (error.response?.status === 400 && error.response.data.error.message.includes('已存在')) {
      log('⚠️ 被邀请人已存在，尝试登录');
      return await loginInvitee();
    } else {
      log('❌ 被邀请人创建失败', error.response?.data || error.message);
      throw error;
    }
  }
}

// 4. 被邀请人登录
async function loginInvitee() {
  try {
    log('=== 被邀请人登录 ===');
    const response = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: TEST_USERS.invitee.email,
      password: TEST_USERS.invitee.password
    });
    
    inviteeToken = response.data.jwt;
    inviteeId = response.data.user.id;
    
    log('✅ 被邀请人登录成功', {
      id: inviteeId,
      username: response.data.user.username,
      token: inviteeToken.substring(0, 20) + '...'
    });
    
    return response.data.user;
  } catch (error) {
    log('❌ 被邀请人登录失败', error.response?.data || error.message);
    throw error;
  }
}

// 5. 获取邀请奖励档位配置
async function getRewardTiers() {
  try {
    log('=== 获取邀请奖励档位配置 ===');
    const response = await axios.get(`${BASE_URL}/api/yaoqing-jianglis/reward-tiers`, {
      headers: { Authorization: `Bearer ${inviterToken}` }
    });
    
    if (response.data.success) {
      log('✅ 档位配置获取成功', response.data.data);
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    log('❌ 获取档位配置失败', error.response?.data || error.message);
    throw error;
  }
}

// 6. 为邀请人充值钱包
async function rechargeInviterWallet(amount = '5000') {
  try {
    log(`=== 为邀请人充值 ${amount} USDT ===`);
    const response = await axios.post(`${BASE_URL}/api/qianbao-yues/recharge`, {
      data: {
        user: inviterId,
        usdtYue: amount
      }
    }, {
      headers: { Authorization: `Bearer ${inviterToken}` }
    });
    
    if (response.data.success) {
      log('✅ 邀请人钱包充值成功', response.data.data);
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    log('❌ 邀请人钱包充值失败', error.response?.data || error.message);
    throw error;
  }
}

// 7. 邀请人投资（PLAN 5K档位）
async function inviterInvest() {
  try {
    log('=== 邀请人投资 PLAN 5K ===');
    
    // 首先获取可用的投资计划
    const plansResponse = await axios.get(`${BASE_URL}/api/dinggou-jihuas`);
    if (!plansResponse.data.data || plansResponse.data.data.length === 0) {
      throw new Error('没有可用的投资计划');
    }
    
    const plan = plansResponse.data.data[0]; // 使用第一个计划
    log('使用投资计划:', plan);
    
    const response = await axios.post(`${BASE_URL}/api/dinggou-jihuas/${plan.id}/invest`, {
      data: {
        amount: '5000',
        principal: '5000',
        yield_rate: '0.10',
        cycle_days: 30
      }
    }, {
      headers: { Authorization: `Bearer ${inviterToken}` }
    });
    
    if (response.data.success) {
      log('✅ 邀请人投资成功', response.data.data);
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    log('❌ 邀请人投资失败', error.response?.data || error.message);
    throw error;
  }
}

// 8. 为被邀请人充值钱包
async function rechargeInviteeWallet(amount = '2000') {
  try {
    log(`=== 为被邀请人充值 ${amount} USDT ===`);
    const response = await axios.post(`${BASE_URL}/api/qianbao-yues/recharge`, {
      data: {
        user: inviteeId,
        usdtYue: amount
      }
    }, {
      headers: { Authorization: `Bearer ${inviteeToken}` }
    });
    
    if (response.data.success) {
      log('✅ 被邀请人钱包充值成功', response.data.data);
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    log('❌ 被邀请人钱包充值失败', error.response?.data || error.message);
    throw error;
  }
}

// 9. 被邀请人投资
async function inviteeInvest() {
  try {
    log('=== 被邀请人投资 ===');
    
    // 获取可用的投资计划
    const plansResponse = await axios.get(`${BASE_URL}/api/dinggou-jihuas`);
    if (!plansResponse.data.data || plansResponse.data.data.length === 0) {
      throw new Error('没有可用的投资计划');
    }
    
    const plan = plansResponse.data.data[0];
    
    const response = await axios.post(`${BASE_URL}/api/dinggou-jihuas/${plan.id}/invest`, {
      data: {
        amount: '2000',
        principal: '2000',
        yield_rate: '0.08',
        cycle_days: 30
      }
    }, {
      headers: { Authorization: `Bearer ${inviteeToken}` }
    });
    
    if (response.data.success) {
      log('✅ 被邀请人投资成功', response.data.data);
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    log('❌ 被邀请人投资失败', error.response?.data || error.message);
    throw error;
  }
}

// 10. 模拟订单到期（手动更新状态）
async function simulateOrderExpiration(orderId) {
  try {
    log(`=== 模拟订单 ${orderId} 到期 ===`);
    
    const response = await axios.put(`${BASE_URL}/api/dinggou-dingdans/${orderId}`, {
      data: { status: 'redeemable' }
    }, {
      headers: { Authorization: `Bearer ${inviteeToken}` }
    });
    
    if (response.data.success) {
      log('✅ 订单状态更新成功', response.data.data);
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    log('❌ 更新订单状态失败', error.response?.data || error.message);
    throw error;
  }
}

// 11. 检查邀请奖励是否生成
async function checkInvitationReward() {
  try {
    log('=== 检查邀请奖励 ===');
    
    const response = await axios.get(`${BASE_URL}/api/yaoqing-jianglis/user-rewards`, {
      headers: { Authorization: `Bearer ${inviterToken}` }
    });
    
    if (response.data.success) {
      log('✅ 邀请奖励查询成功', response.data.data);
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    log('❌ 查询邀请奖励失败', error.response?.data || error.message);
    throw error;
  }
}

// 12. 获取团队统计
async function getTeamStats() {
  try {
    log('=== 获取团队统计 ===');
    
    const response = await axios.get(`${BASE_URL}/api/yaoqing-jianglis/team-stats-v2`, {
      headers: { Authorization: `Bearer ${inviterToken}` }
    });
    
    if (response.data.success) {
      log('✅ 团队统计获取成功', response.data.data);
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    log('❌ 获取团队统计失败', error.response?.data || error.message);
    throw error;
  }
}

// 主测试流程
async function runInvitationRewardTest() {
  try {
    log('🚀 开始邀请奖励制度V2测试');
    
    // 1. 创建邀请人账户
    await createInviter();
    
    // 2. 创建被邀请人账户
    await createInvitee();
    
    // 3. 获取档位配置
    const tiers = await getRewardTiers();
    
    // 4. 为邀请人充值并投资
    await rechargeInviterWallet('5000');
    const inviterOrder = await inviterInvest();
    
    // 5. 为被邀请人充值并投资
    await rechargeInviteeWallet('2000');
    const inviteeOrder = await inviteeInvest();
    
    // 6. 模拟被邀请人订单到期
    await simulateOrderExpiration(inviteeOrder.id);
    
    // 7. 检查邀请奖励
    const rewards = await checkInvitationReward();
    
    // 8. 获取团队统计
    const teamStats = await getTeamStats();
    
    // 9. 验证结果
    log('=== 测试结果验证 ===');
    log('邀请奖励记录数:', rewards.rewards.length);
    log('团队统计:', teamStats);
    
    if (rewards.rewards.length > 0) {
      const reward = rewards.rewards[0];
      log('✅ 邀请奖励生成成功:', {
        rewardAmount: reward.shouyiUSDT,
        calculation: reward.calculation,
        parentTier: reward.parentTier,
        childPrincipal: reward.childPrincipal,
        commissionablePrincipal: reward.commissionablePrincipal
      });
    } else {
      log('❌ 没有生成邀请奖励');
    }
    
    log('🎉 邀请奖励制度V2测试完成');
    
  } catch (error) {
    log('❌ 测试失败:', error.message);
  }
}

// 运行测试
runInvitationRewardTest(); 