const axios = require('axios');

const BASE_URL = 'http://localhost:1337';

async function testAuth() {
  try {
    console.log('🔍 开始测试认证流程...');
    
    // 1. 测试健康检查端点
    console.log('\n1. 测试健康检查端点...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/api/health`);
      console.log('✅ 健康检查成功:', healthResponse.data);
    } catch (error) {
      console.log('❌ 健康检查失败:', error.response?.data || error.message);
    }
    
    // 2. 测试登录端点
    console.log('\n2. 测试登录端点...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
        identifier: 'testuser',
        password: 'testpass'
      });
      console.log('✅ 登录成功:', {
        jwt: loginResponse.data.jwt ? 'JWT token exists' : 'No JWT token',
        user: loginResponse.data.user ? 'User data exists' : 'No user data'
      });
      
      // 3. 使用JWT测试需要认证的端点
      if (loginResponse.data.jwt) {
        console.log('\n3. 测试需要认证的端点...');
        const token = loginResponse.data.jwt;
        
        try {
          const walletResponse = await axios.get(`${BASE_URL}/api/qianbao-yues/user-wallet`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log('✅ 钱包API成功:', walletResponse.data);
        } catch (error) {
          console.log('❌ 钱包API失败:', error.response?.data || error.message);
        }
        
        try {
          const rewardsResponse = await axios.get(`${BASE_URL}/api/yaoqing-jianglis/user-rewards`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log('✅ 邀请奖励API成功:', rewardsResponse.data);
        } catch (error) {
          console.log('❌ 邀请奖励API失败:', error.response?.data || error.message);
        }
      }
    } catch (error) {
      console.log('❌ 登录失败:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testAuth(); 