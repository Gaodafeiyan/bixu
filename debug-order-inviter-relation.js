const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 管理员登录信息
const ADMIN_USER = {
  username: '887',
  password: '123456'
};

let adminToken = '';

async function main() {
  console.log('🔍 开始调试订单邀请人关联关系...\n');
  
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
    
    // 2. 检查所有用户
    console.log('\n2️⃣ 检查所有用户...');
    const usersResult = await getAllUsers();
    if (usersResult.success) {
      console.log('用户总数:', usersResult.users.length);
      
      // 找到有邀请人的用户
      const usersWithInviter = usersResult.users.filter(user => user.invitedBy);
      console.log('有邀请人的用户数量:', usersWithInviter.length);
      
      // 显示有邀请人的用户
      usersWithInviter.forEach((user, index) => {
        console.log(`用户 ${index + 1}: ${user.username} (ID: ${user.id}) -> 邀请人: ${user.invitedBy.username} (ID: ${user.invitedBy.id})`);
      });
    }
    
    // 3. 检查所有订单
    console.log('\n3️⃣ 检查所有订单...');
    const ordersResult = await getAllOrders();
    if (ordersResult.success) {
      console.log('订单总数:', ordersResult.orders.length);
      
      // 显示每个订单的详细信息
      ordersResult.orders.forEach((order, index) => {
        console.log(`订单 ${index + 1}:`);
        console.log(`  - ID: ${order.id}`);
        console.log(`  - 用户: ${order.user?.username || 'N/A'} (ID: ${order.user?.id || 'N/A'})`);
        console.log(`  - 邀请人: ${order.user?.invitedBy?.username || 'N/A'} (ID: ${order.user?.invitedBy?.id || 'N/A'})`);
        console.log(`  - 状态: ${order.status}`);
        console.log(`  - 金额: ${order.amount}`);
        console.log(`  - 创建时间: ${order.createdAt}`);
        console.log('');
      });
    }
    
    // 4. 检查邀请奖励记录
    console.log('\n4️⃣ 检查邀请奖励记录...');
    const rewardsResult = await getAllRewards();
    if (rewardsResult.success) {
      console.log('邀请奖励记录总数:', rewardsResult.rewards.length);
      
      if (rewardsResult.rewards.length > 0) {
        rewardsResult.rewards.forEach((reward, index) => {
          console.log(`奖励 ${index + 1}:`);
          console.log(`  - ID: ${reward.id}`);
          console.log(`  - 推荐人: ${reward.tuijianRen?.username || reward.tuijianRen || 'N/A'}`);
          console.log(`  - 来源人: ${reward.laiyuanRen?.username || reward.laiyuanRen || 'N/A'}`);
          console.log(`  - 来源订单: ${reward.laiyuanDan || 'N/A'}`);
          console.log(`  - 收益: ${reward.shouyiUSDT} USDT`);
          console.log(`  - 创建时间: ${reward.createdAt}`);
          console.log('');
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
    const response = await axios.get(`${BASE_URL}/api/dinggou-dingdans?populate=user.invitedBy&pagination[limit]=100&sort=createdAt:desc`);
    
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

// 获取所有邀请奖励记录
async function getAllRewards() {
  try {
    const response = await axios.get(`${BASE_URL}/api/yaoqing-jianglis?populate=tuijianRen,laiyuanRen&pagination[limit]=100&sort=createdAt:desc`);
    
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

// 运行调试
main(); 