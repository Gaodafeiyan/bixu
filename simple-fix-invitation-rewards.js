const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 测试用户信息 - 请替换为实际的用户信息
const TEST_USER = {
  username: 'test_debug_user',
  email: 'debug@test.com',
  password: '123456'
};

let userToken = '';
let userId = null;

async function main() {
  console.log('🔧 开始修复现有订单的邀请奖励...\n');
  
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
    
    // 2. 获取用户的所有已完成订单
    console.log('\n2️⃣ 获取用户订单...');
    const ordersResult = await getUserOrders(userToken);
    if (!ordersResult.success) {
      console.error('❌ 获取订单失败:', ordersResult.message);
      return;
    }
    
    console.log('用户订单数量:', ordersResult.orders.length);
    
    // 3. 筛选已完成的订单
    const finishedOrders = ordersResult.orders.filter(order => order.status === 'finished');
    console.log('已完成订单数量:', finishedOrders.length);
    
    if (finishedOrders.length === 0) {
      console.log('❌ 没有找到已完成的订单');
      return;
    }
    
    // 4. 为每个已完成订单手动触发邀请奖励
    for (let i = 0; i < finishedOrders.length; i++) {
      const order = finishedOrders[i];
      console.log(`\n4️⃣ 处理订单 ${i + 1}/${finishedOrders.length}: 订单ID ${order.id}`);
      
      try {
        // 直接调用邀请奖励处理服务
        const rewardResult = await processInvitationRewardDirectly(order);
        if (rewardResult.success) {
          console.log(`✅ 订单 ${order.id} 邀请奖励处理成功: ${rewardResult.rewardAmount} USDT`);
        } else {
          console.log(`❌ 订单 ${order.id} 邀请奖励处理失败: ${rewardResult.message}`);
        }
      } catch (error) {
        console.error(`❌ 订单 ${order.id} 处理出错:`, error.message);
      }
    }
    
    // 5. 检查修复后的邀请奖励记录
    console.log('\n5️⃣ 检查修复后的邀请奖励记录...');
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
    
    // 6. 检查团队统计
    console.log('\n6️⃣ 检查团队统计...');
    const teamStatsResult = await getTeamStats(userToken);
    if (teamStatsResult.success) {
      console.log('团队统计:', {
        directReferrals: teamStatsResult.stats.directReferrals,
        totalEarnings: teamStatsResult.stats.totalEarnings,
        currentTier: teamStatsResult.stats.currentTier
      });
    }
    
    console.log('\n🎉 修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
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

// 直接调用邀请奖励处理服务
async function processInvitationRewardDirectly(order) {
  try {
    // 直接调用投资服务的邀请奖励处理方法
    const response = await axios.post(`${BASE_URL}/api/investment-service/process-invitation-reward`, {
      orderId: order.id,
      orderData: order
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.data.success) {
      return {
        success: true,
        rewardAmount: response.data.data?.rewardAmount || '0',
        message: response.data.message
      };
    } else {
      return {
        success: false,
        message: response.data.message
      };
    }
  } catch (error) {
    // 如果API不存在，尝试直接调用服务
    console.log('API不存在，尝试直接调用服务...');
    return await callServiceDirectly(order);
  }
}

// 直接调用服务（如果API不存在）
async function callServiceDirectly(order) {
  try {
    // 这里需要直接调用Strapi服务，但通过HTTP API可能无法直接访问
    // 所以我们需要创建一个临时的API端点
    console.log('需要创建临时API端点来直接调用服务');
    return {
      success: false,
      message: '需要创建临时API端点'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
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

// 运行修复
main(); 