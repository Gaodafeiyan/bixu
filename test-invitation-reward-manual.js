const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testInvitationReward() {
  console.log('🔍 开始手动测试邀请奖励功能...\n');

  try {
    // 1. 管理员登录
    console.log('1️⃣ 管理员登录...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: '887',
      password: '123456'
    });

    const token = loginResponse.data.jwt;
    console.log('✅ 管理员登录成功\n');

    // 2. 获取一个已完成的订单
    console.log('2️⃣ 获取已完成的订单...');
    const ordersResponse = await axios.get(`${BASE_URL}/api/dinggou-dingdans`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        filters: { status: 'finished' },
        populate: ['user', 'jihua'],
        sort: { createdAt: 'desc' },
        pagination: { limit: 1 }
      }
    });

    if (!ordersResponse.data.data || ordersResponse.data.data.length === 0) {
      console.log('❌ 没有找到已完成的订单');
      return;
    }

    const order = ordersResponse.data.data[0];
    console.log(`✅ 找到订单: ID=${order.id}, 用户=${order.user.username}, 金额=${order.amount}, 状态=${order.status}\n`);

    // 3. 手动触发邀请奖励处理
    console.log('3️⃣ 手动触发邀请奖励处理...');
    const rewardResponse = await axios.post(`${BASE_URL}/api/investment-service/process-invitation-reward`, {
      orderId: order.id,
      orderData: order
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ 邀请奖励处理响应:', JSON.stringify(rewardResponse.data, null, 2));

    // 4. 检查是否生成了邀请奖励记录
    console.log('\n4️⃣ 检查邀请奖励记录...');
    const rewardsResponse = await axios.get(`${BASE_URL}/api/yaoqing-jianglis`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        filters: { laiyuanDan: order.id },
        populate: ['tuijianRen', 'laiyuanRen'],
        sort: { createdAt: 'desc' }
      }
    });

    console.log('邀请奖励记录:', JSON.stringify(rewardsResponse.data, null, 2));

    // 5. 检查推荐人钱包余额变化
    if (rewardsResponse.data.data && rewardsResponse.data.data.length > 0) {
      const reward = rewardsResponse.data.data[0];
      console.log('\n5️⃣ 检查推荐人钱包余额...');
      
      const walletResponse = await axios.get(`${BASE_URL}/api/qianbao-yues`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          filters: { user: reward.tuijianRen.id }
        }
      });

      if (walletResponse.data.data && walletResponse.data.data.length > 0) {
        const wallet = walletResponse.data.data[0];
        console.log(`推荐人钱包余额: ${wallet.usdtYue} USDT`);
      }
    }

    console.log('\n🎉 手动测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
    
    if (error.response?.data?.error?.message) {
      console.error('详细错误信息:', error.response.data.error.message);
    }
  }
}

// 运行测试
testInvitationReward(); 