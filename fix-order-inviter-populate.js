const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 管理员登录信息
const ADMIN_USER = {
  username: '887',
  password: '123456'
};

let adminToken = '';

async function main() {
  console.log('🔧 开始修复订单邀请人关联问题...\n');
  
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
    
    // 2. 获取所有用户及其邀请人信息
    console.log('\n2️⃣ 获取用户邀请关系...');
    const usersResult = await getAllUsers();
    if (!usersResult.success) {
      console.error('❌ 获取用户失败:', usersResult.message);
      return;
    }
    
    // 创建用户邀请人映射
    const userInviterMap = new Map();
    usersResult.users.forEach(user => {
      if (user.invitedBy) {
        userInviterMap.set(user.id, user.invitedBy);
      }
    });
    
    console.log(`用户邀请关系映射: ${userInviterMap.size} 个用户有邀请人`);
    
    // 3. 获取所有订单
    console.log('\n3️⃣ 获取所有订单...');
    const ordersResult = await getAllOrders();
    if (!ordersResult.success) {
      console.error('❌ 获取订单失败:', ordersResult.message);
      return;
    }
    
    console.log(`订单总数: ${ordersResult.orders.length}`);
    
    // 4. 处理每个订单的邀请奖励
    console.log('\n4️⃣ 处理订单邀请奖励...');
    let processedCount = 0;
    let successCount = 0;
    
    for (const order of ordersResult.orders) {
      const userId = order.user?.id;
      if (!userId) {
        console.log(`订单 ${order.id}: 没有用户信息，跳过`);
        continue;
      }
      
      const inviter = userInviterMap.get(userId);
      if (!inviter) {
        console.log(`订单 ${order.id}: 用户 ${userId} 没有邀请人，跳过`);
        continue;
      }
      
      console.log(`\n📋 处理订单 ${order.id}:`);
      console.log(`  - 用户: ${order.user?.username || userId}`);
      console.log(`  - 邀请人: ${inviter.username} (ID: ${inviter.id})`);
      console.log(`  - 订单状态: ${order.status}`);
      console.log(`  - 投资金额: ${order.amount}`);
      
      // 检查是否已有邀请奖励
      const existingRewards = await getOrderInvitationRewards(order.id);
      if (existingRewards.success && existingRewards.rewards.length > 0) {
        console.log(`  ✅ 已有邀请奖励记录，跳过`);
        continue;
      }
      
      // 手动触发邀请奖励处理
      if (order.status === 'redeemable' || order.status === 'finished') {
        console.log(`  🔧 手动触发邀请奖励处理...`);
        const rewardResult = await processInvitationReward(order.id);
        if (rewardResult.success) {
          console.log(`  ✅ 邀请奖励处理成功: ${rewardResult.data.rewardAmount} USDT`);
          successCount++;
        } else {
          console.log(`  ❌ 邀请奖励处理失败: ${rewardResult.message}`);
        }
      } else {
        console.log(`  ⏸️ 订单状态不是redeemable或finished，跳过`);
      }
      
      processedCount++;
    }
    
    console.log(`\n📊 处理结果:`);
    console.log(`  - 总处理订单: ${processedCount}`);
    console.log(`  - 成功处理: ${successCount}`);
    console.log(`  - 失败数量: ${processedCount - successCount}`);
    
    console.log('\n🎉 订单邀请人关联修复完成！');
    
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

// 获取所有用户
async function getAllUsers() {
  try {
    const response = await axios.get(`${BASE_URL}/api/users?populate=invitedBy&pagination[limit]=100`);
    
    return {
      success: true,
      users: response.data || []
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message
    };
  }
}

// 获取所有订单
async function getAllOrders() {
  try {
    const response = await axios.get(`${BASE_URL}/api/dinggou-dingdans?populate=user&pagination[limit]=100&sort=createdAt:desc`);
    
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