const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 测试用户信息
const TEST_USERS = {
  inviter: {
    username: 'test_inviter_2',
    email: 'inviter2@test.com',
    password: '123456'
  },
  invitee: {
    username: 'test_invitee_2', 
    email: 'invitee2@test.com',
    password: '123456'
  }
};

let inviterToken = '';
let inviteeToken = '';
let inviterId = null;
let inviteeId = null;
let testOrderId = null;

async function main() {
  console.log('🔍 开始直接测试邀请奖励流程...\n');
  
  try {
    // 1. 登录邀请人
    console.log('1️⃣ 登录邀请人...');
    const inviterLoginResult = await loginUser(TEST_USERS.inviter);
    if (!inviterLoginResult.success) {
      console.error('❌ 邀请人登录失败:', inviterLoginResult.message);
      return;
    }
    inviterToken = inviterLoginResult.token;
    inviterId = inviterLoginResult.user.id;
    console.log('✅ 邀请人登录成功, ID:', inviterId);
    
    // 2. 获取邀请码
    console.log('\n2️⃣ 获取邀请码...');
    const inviteCodeResult = await getInviteCode(inviterToken);
    if (!inviteCodeResult.success) {
      console.error('❌ 获取邀请码失败:', inviteCodeResult.message);
      return;
    }
    const inviteCode = inviteCodeResult.inviteCode;
    console.log('✅ 邀请码:', inviteCode);
    
    // 3. 注册被邀请人
    console.log('\n3️⃣ 注册被邀请人...');
    const inviteeRegisterResult = await registerUser({
      ...TEST_USERS.invitee,
      inviteCode: inviteCode
    });
    if (!inviteeRegisterResult.success) {
      console.error('❌ 被邀请人注册失败:', inviteeRegisterResult.message);
      return;
    }
    inviteeId = inviteeRegisterResult.user.id;
    console.log('✅ 被邀请人注册成功, ID:', inviteeId);
    
    // 4. 登录被邀请人
    console.log('\n4️⃣ 登录被邀请人...');
    const inviteeLoginResult = await loginUser(TEST_USERS.invitee);
    if (!inviteeLoginResult.success) {
      console.error('❌ 被邀请人登录失败:', inviteeLoginResult.message);
      return;
    }
    inviteeToken = inviteeLoginResult.token;
    console.log('✅ 被邀请人登录成功');
    
    // 5. 被邀请人投资
    console.log('\n5️⃣ 被邀请人进行投资...');
    const investResult = await investInPlan(inviteeToken, 1, 500); // 投资500 USDT
    if (!investResult.success) {
      console.error('❌ 投资失败:', investResult.message);
      return;
    }
    testOrderId = investResult.order.id;
    console.log('✅ 投资成功, 订单ID:', testOrderId);
    
    // 6. 检查订单状态
    console.log('\n6️⃣ 检查订单状态...');
    const orderResult = await getOrderDetail(inviteeToken, testOrderId);
    if (orderResult.success) {
      console.log('订单状态:', orderResult.order.status);
      console.log('订单金额:', orderResult.order.amount);
      console.log('订单结束时间:', orderResult.order.end_at);
    }
    
    // 7. 直接调用投资完成处理（模拟订单到期）
    console.log('\n7️⃣ 直接调用投资完成处理...');
    const completionResult = await handleInvestmentCompletion(testOrderId);
    if (!completionResult.success) {
      console.error('❌ 投资完成处理失败:', completionResult.message);
      return;
    }
    console.log('✅ 投资完成处理成功');
    console.log('处理结果:', completionResult.result);
    
    // 8. 再次检查订单状态
    console.log('\n8️⃣ 再次检查订单状态...');
    const orderResult2 = await getOrderDetail(inviteeToken, testOrderId);
    if (orderResult2.success) {
      console.log('订单状态:', orderResult2.order.status);
    }
    
    // 9. 检查邀请人钱包余额
    console.log('\n9️⃣ 检查邀请人钱包余额...');
    const walletResult = await getWallet(inviterToken);
    if (walletResult.success) {
      console.log('邀请人钱包余额:', walletResult.wallet.usdtYue, 'USDT');
    }
    
    // 10. 检查邀请奖励记录
    console.log('\n🔟 检查邀请奖励记录...');
    const rewardsResult = await getUserRewards(inviterToken);
    if (rewardsResult.success) {
      console.log('邀请奖励记录数量:', rewardsResult.rewards.length);
      if (rewardsResult.rewards.length > 0) {
        const latestReward = rewardsResult.rewards[0];
        console.log('最新奖励记录:');
        console.log('  - 奖励金额:', latestReward.shouyiUSDT, 'USDT');
        console.log('  - 来源用户:', latestReward.laiyuanRen?.username);
        console.log('  - 来源订单:', latestReward.laiyuanDan?.id);
        console.log('  - 档位:', latestReward.parentTier);
        console.log('  - 计算方式:', latestReward.calculation);
        console.log('  - 创建时间:', latestReward.createdAt);
      }
    } else {
      console.error('❌ 获取奖励记录失败:', rewardsResult.message);
    }
    
    // 11. 检查团队统计
    console.log('\n1️⃣1️⃣ 检查团队统计...');
    const teamStatsResult = await getTeamStats(inviterToken);
    if (teamStatsResult.success) {
      console.log('团队统计:');
      console.log('  - 直接推荐:', teamStatsResult.stats.directReferrals);
      console.log('  - 总收益:', teamStatsResult.stats.totalEarnings, 'USDT');
      console.log('  - 当前档位:', teamStatsResult.stats.currentTier?.name);
    } else {
      console.error('❌ 获取团队统计失败:', teamStatsResult.message);
    }
    
    console.log('\n🎉 直接测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message);
  }
}

// 辅助函数
async function loginUser(userInfo) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: userInfo.username,
      password: userInfo.password
    });
    
    return {
      success: true,
      token: response.data.jwt,
      user: response.data.user
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message
    };
  }
}

async function registerUser(userInfo) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/local/register`, {
      username: userInfo.username,
      email: userInfo.email,
      password: userInfo.password,
      inviteCode: userInfo.inviteCode
    });
    
    return {
      success: true,
      user: response.data.user
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message
    };
  }
}

async function getInviteCode(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return {
      success: true,
      inviteCode: response.data.inviteCode
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message
    };
  }
}

async function investInPlan(token, planId, amount) {
  try {
    const response = await axios.post(`${BASE_URL}/api/dinggou-dingdans`, {
      data: {
        jihua: planId,
        amount: amount
      }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return {
      success: true,
      order: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message
    };
  }
}

async function getOrderDetail(token, orderId) {
  try {
    const response = await axios.get(`${BASE_URL}/api/dinggou-dingdans/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return {
      success: true,
      order: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message
    };
  }
}

async function handleInvestmentCompletion(orderId) {
  try {
    // 直接调用投资完成处理API
    const response = await axios.post(`${BASE_URL}/api/investment-service/handle-completion`, {
      orderId: orderId
    }, {
      headers: { Authorization: `Bearer ${inviterToken}` } // 使用邀请人的token
    });
    
    return {
      success: true,
      result: response.data
    };
  } catch (error) {
    console.log('API调用失败:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message
    };
  }
}

async function getWallet(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/qianbao-yues/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return {
      success: true,
      wallet: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message
    };
  }
}

async function getUserRewards(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/yaoqing-jianglis/user-rewards`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return {
      success: true,
      rewards: response.data.data.rewards || []
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message
    };
  }
}

async function getTeamStats(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/yaoqing-jianglis/team-stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return {
      success: true,
      stats: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message
    };
  }
}

// 运行测试
main(); 