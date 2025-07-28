const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testServiceFix() {
  console.log('🔍 测试服务修复...\n');

  try {
    // 1. 管理员登录
    console.log('1️⃣ 管理员登录...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: '887',
      password: '123456'
    });

    const token = loginResponse.data.jwt;
    console.log('✅ 管理员登录成功\n');

    // 2. 测试 investment-service 端点
    console.log('2️⃣ 测试 investment-service 端点...');
    
    // 测试 processInvitationReward
    console.log('测试 processInvitationReward...');
    try {
      const rewardResponse = await axios.post(`${BASE_URL}/api/investment-service/process-invitation-reward`, {
        orderId: 27
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ processInvitationReward 响应:', rewardResponse.data);
    } catch (error) {
      console.log('❌ processInvitationReward 失败:', error.response?.data?.error?.message || error.message);
    }

    // 3. 检查邀请奖励记录
    console.log('\n3️⃣ 检查邀请奖励记录...');
    try {
      const rewardsResponse = await axios.get(`${BASE_URL}/api/yaoqing-jianglis`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          filters: { laiyuanDan: 27 },
          populate: ['tuijianRen', 'laiyuanRen'],
          sort: { createdAt: 'desc' }
        }
      });
      console.log('邀请奖励记录:', JSON.stringify(rewardsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ 获取邀请奖励记录失败:', error.response?.data?.error?.message || error.message);
    }

    console.log('\n🎉 服务修复测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testServiceFix(); 