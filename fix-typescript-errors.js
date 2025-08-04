const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testJWTAuth() {
  console.log('🔍 测试JWT认证...');
  
  try {
    // 1. 测试公开接口（不需要认证）
    console.log('\n1. 测试公开接口...');
    const publicResponse = await axios.get(`${BASE_URL}/api/choujiang-jihuis/lottery-groups`);
    console.log('✅ 公开接口正常:', publicResponse.status);
    
    // 2. 测试需要认证的接口（应该返回401）
    console.log('\n2. 测试需要认证的接口（无token）...');
    try {
      await axios.get(`${BASE_URL}/api/qianbao-yues/user-wallet`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ 认证保护正常（返回401）');
      } else {
        console.log('❌ 认证保护异常:', error.response?.status);
      }
    }
    
    // 3. 测试登录接口
    console.log('\n3. 测试登录接口...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
        identifier: 'test@example.com',
        password: 'testpassword'
      });
      console.log('✅ 登录接口正常:', loginResponse.status);
      console.log('📝 JWT Token:', loginResponse.data.jwt ? '存在' : '不存在');
    } catch (error) {
      console.log('⚠️ 登录失败（可能是测试用户不存在）:', error.response?.status);
    }
    
    // 4. 测试注册接口
    console.log('\n4. 测试注册接口...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/local/register`, {
        username: 'testuser' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        password: 'testpassword123'
      });
      console.log('✅ 注册接口正常:', registerResponse.status);
      console.log('📝 新用户JWT Token:', registerResponse.data.jwt ? '存在' : '不存在');
      
      if (registerResponse.data.jwt) {
        // 5. 使用JWT token测试认证接口
        console.log('\n5. 使用JWT token测试认证接口...');
        const authResponse = await axios.get(`${BASE_URL}/api/qianbao-yues/user-wallet`, {
          headers: {
            'Authorization': `Bearer ${registerResponse.data.jwt}`
          }
        });
        console.log('✅ 认证接口正常:', authResponse.status);
      }
    } catch (error) {
      console.log('⚠️ 注册失败:', error.response?.status, error.response?.data?.error?.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testJWTAuth();