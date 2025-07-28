const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 管理员登录信息
const ADMIN_USER = {
  username: '887',
  password: '123456'
};

let adminToken = '';

async function main() {
  console.log('🔧 开始修复邀请奖励逻辑...\n');
  
  try {
    // 1. 管理员登录
    console.log('1️⃣ 管理员登录...');
    const loginResult = await loginUser(ADMIN_USER);
    if (!loginResult.success) {
      console.error('❌ 管理员登录失败:', loginResult.message);
      return;
    }
    adminToken = loginResult.token;
    console.log('✅ 管理员登录成功');
    
    // 2. 检查最近的订单
    console.log('\n2️⃣ 检查最近的订单...');
    const ordersResult = await getRecentOrders();
    if (ordersResult.success) {
      console.log('最近订单数量:', ordersResult.orders.length);
      
      // 找到有邀请人的订单
      const ordersWithInviter = ordersResult.orders.filter(order => 
        order.user && order.user.invitedBy
      );
      
      console.log('有邀请人的订单数量:', ordersWithInviter.length);
      
      // 3. 检查每个订单的邀请奖励
      for (const order of ordersWithInviter) {
        console.log(`\n📋 检查订单 ${order.id}:`);
        console.log(`   - 用户: ${order.user.username} (ID: ${order.user.id})`);
        console.log(`   - 邀请人: ${order.user.invitedBy.username} (ID: ${order.user.invitedBy.id})`);
        console.log(`   - 订单状态: ${order.status}`);
        console.log(`   - 投资金额: ${order.amount}`);
        
        // 检查是否已有邀请奖励
        const existingRewards = await getOrderInvitationRewards(order.id);
        if (existingRewards.success && existingRewards.rewards.length > 0) {
          console.log(`   ✅ 已有邀请奖励记录`);
        } else {
          console.log(`   ❌ 没有邀请奖励记录，需要处理`);
          
          // 4. 手动触发邀请奖励处理
          if (order.status === 'redeemable' || order.status === 'finished') {
            console.log(`   🔧 手动触发邀请奖励处理...`);
            const rewardResult = await processInvitationReward(order.id);
            if (rewardResult.success) {
              console.log(`   ✅ 邀请奖励处理成功: ${rewardResult.data.rewardAmount} USDT`);
            } else {
              console.log(`   ❌ 邀请奖励处理失败: ${rewardResult.message}`);
            }
          }
        }
      }
    }
    
    console.log('\n🎉 邀请奖励逻辑修复完成！');
    
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

// 获取最近的订单
async function getRecentOrders() {
  try {
    const response = await axios.get(`${BASE_URL}/api/dinggou-dingdans?populate=user.invitedBy&sort=createdAt:desc&pagination[limit]=50`);
    
    return {
      success: true,
      orders: response.data.results || []
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message
    };
  }
}

// 获取订单的邀请奖励记录
async function getOrderInvitationRewards(orderId) {
  try {
    const response = await axios.get(`${BASE_URL}/api/yaoqing-jianglis?filters[laiyuanDan][$eq]=${orderId}&populate=*`);
    
    return {
      success: true,
      rewards: response.data.results || []
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message
    };
  }
}

// 手动触发邀请奖励处理
async function processInvitationReward(orderId) {
  try {
    const response = await axios.post(`${BASE_URL}/api/investment-service/process-invitation-reward`, {
      orderId: orderId
    }, {
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      data: response.data.data
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