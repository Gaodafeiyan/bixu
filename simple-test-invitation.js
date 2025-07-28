const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function simpleTest() {
  console.log('🔍 简单测试邀请奖励功能...\n');

  try {
    // 1. 管理员登录
    console.log('1️⃣ 管理员登录...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: '887',
      password: '123456'
    });

    const token = loginResponse.data.jwt;
    console.log('✅ 管理员登录成功\n');

    // 2. 直接测试 investment-service 端点
    console.log('2️⃣ 测试 investment-service 端点...');
    
    // 先测试 handleCompletion
    console.log('测试 handleCompletion...');
    try {
      const completionResponse = await axios.post(`${BASE_URL}/api/investment-service/handle-completion`, {
        orderId: 27
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ handleCompletion 响应:', completionResponse.data);
    } catch (error) {
      console.log('❌ handleCompletion 失败:', error.response?.data?.error?.message || error.message);
    }

    // 测试 processInvitationReward
    console.log('\n测试 processInvitationReward...');
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

    // 3. 检查服务是否正常运行
    console.log('\n3️⃣ 检查服务状态...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/api/dinggou-jihuas/test-connection`);
      console.log('✅ 服务健康检查:', healthResponse.data);
    } catch (error) {
      console.log('❌ 服务健康检查失败:', error.response?.data?.error?.message || error.message);
    }

    console.log('\n🎉 简单测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
simpleTest(); 