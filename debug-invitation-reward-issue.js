const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 测试用户信息
const TEST_USER = {
  username: 'test_debug_user',
  email: 'debug@test.com',
  password: '123456'
};

let userToken = '';
let userId = null;

async function main() {
  console.log('🔍 开始调试邀请奖励问题...\n');
  
  try {
    // 1. 登录用户
    console.log('1️⃣ 登录用户...');
    const loginResult = await loginUser(TEST_USER);
    if (!loginResult.success) {
      console.error('❌ 登录失败:', loginResult.message);
      return;
    }
    userToken = loginResult.token;
    userId = loginResult.user.id;
    console.log('✅ 登录成功, 用户ID:', userId);
    
    // 2. 检查用户信息
    console.log('\n2️⃣ 检查用户信息...');
    const userInfo = await getUserInfo(userToken);
    if (userInfo.success) {
      console.log('用户信息:', {
        id: userInfo.user.id,
        username: userInfo.user.username,
        invitedBy: userInfo.user.invitedBy ? {
          id: userInfo.user.invitedBy.id,
          username: userInfo.user.invitedBy.username
        } : null
      });
    }
    
    // 3. 检查用户的订单
    console.log('\n3️⃣ 检查用户订单...');
    const ordersResult = await getUserOrders(userToken);
    if (ordersResult.success) {
      console.log('用户订单数量:', ordersResult.orders.length);
      ordersResult.orders.forEach((order, index) => {
        console.log(`订单 ${index + 1}:`, {
          id: order.id,
          amount: order.amount,
          status: order.status,
          start_at: order.start_at,
          end_at: order.end_at,
          isExpired: new Date(order.end_at) <= new Date()
        });
      });
    }
    
    // 4. 检查邀请奖励记录
    console.log('\n4️⃣ 检查邀请奖励记录...');
    const rewardsResult = await getUserRewards(userToken);
    if (rewardsResult.success) {
      console.log('邀请奖励记录数量:', rewardsResult.rewards.length);
      if (rewardsResult.rewards.length > 0) {
        rewardsResult.rewards.forEach((reward, index) => {
          console.log(`奖励 ${index + 1}:`, {
            id: reward.id,
            amount: reward.shouyiUSDT,
            sourceUser: reward.laiyuanUser?.username,
            sourceOrder: reward.laiyuanDan,
            calculation: reward.calculation,
            parentTier: reward.parentTier,
            createdAt: reward.createdAt
          });
        });
      }
    }
    
    // 5. 检查团队统计
    console.log('\n5️⃣ 检查团队统计...');
    const teamStatsResult = await getTeamStats(userToken);
    if (teamStatsResult.success) {
      console.log('团队统计:', {
        directReferrals: teamStatsResult.stats.directReferrals,
        totalEarnings: teamStatsResult.stats.totalEarnings,
        currentTier: teamStatsResult.stats.currentTier
      });
    }
    
    // 6. 如果有邀请人，检查邀请人的档位
    if (userInfo.success && userInfo.user.invitedBy) {
      console.log('\n6️⃣ 检查邀请人档位...');
      const inviterId = userInfo.user.invitedBy.id;
      const inviterOrdersResult = await getInviterOrders(inviterId);
      if (inviterOrdersResult.success) {
        console.log('邀请人订单数量:', inviterOrdersResult.orders.length);
        inviterOrdersResult.orders.forEach((order, index) => {
          console.log(`邀请人订单 ${index + 1}:`, {
            id: order.id,
            amount: order.amount,
            status: order.status,
            start_at: order.start_at,
            end_at: order.end_at
          });
        });
      }
    }
    
    console.log('\n🎉 调试完成！');
    
  } catch (error) {
    console.error('❌ 调试失败:', error.message);
  }
}

// 登录用户
async function loginUser(user) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: user.username,
      password: user.password
    });
    
    if (response.data.jwt) {
      return {
        success: true,
        token: response.data.jwt,
        user: response.data.user
      };
    } else {
      return {
        success: false,
        message: '登录失败'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message
    };
  }
}

// 获取用户信息
async function getUserInfo(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return {
      success: true,
      user: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message
    };
  }
}

// 获取用户订单
async function getUserOrders(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/dinggou-dingdans?filters[user][\$eq]=${userId}&populate=*`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return {
      success: true,
      orders: response.data.data || []
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message
    };
  }
}

// 获取邀请奖励记录
async function getUserRewards(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/yaoqing-jianglis?filters[tuijianRen][\$eq]=${userId}&populate=*`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return {
      success: true,
      rewards: response.data.data || []
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message
    };
  }
}

// 获取团队统计
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

// 获取邀请人订单（需要管理员权限或公开API）
async function getInviterOrders(inviterId) {
  try {
    const response = await axios.get(`${BASE_URL}/api/dinggou-dingdans?filters[user][\$eq]=${inviterId}&populate=*`);
    
    return {
      success: true,
      orders: response.data.data || []
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message
    };
  }
}

// 运行调试
main(); 