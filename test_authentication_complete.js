const axios = require('axios');

const baseURL = 'http://118.107.4.158:1337';

async function testAuthenticationComplete() {
  console.log('=== 完整认证流程测试 ===');
  
  try {
    // 1. 测试登录
    console.log('\n1. 测试用户登录...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/local`, {
      identifier: '852',
      password: '123456'
    });
    
    if (loginResponse.status === 200) {
      console.log('✅ 登录成功');
      const { jwt, user } = loginResponse.data;
      console.log('用户ID:', user.id);
      console.log('用户名:', user.username);
      console.log('JWT Token:', jwt.substring(0, 20) + '...');
      
      // 2. 测试钱包API
      console.log('\n2. 测试钱包API...');
      const walletResponse = await axios.get(`${baseURL}/api/qianbao-yues/user-wallet`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      
      if (walletResponse.status === 200) {
        console.log('✅ 钱包API调用成功');
        console.log('钱包数据:', walletResponse.data);
      } else {
        console.log('❌ 钱包API调用失败:', walletResponse.status);
      }
      
      // 3. 测试充值API
      console.log('\n3. 测试充值API...');
      const rechargeResponse = await axios.post(`${baseURL}/api/recharge-channels/simple-recharge`, {
        amount: 10
      }, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (rechargeResponse.status === 200) {
        console.log('✅ 充值API调用成功');
        console.log('充值响应:', rechargeResponse.data);
      } else {
        console.log('❌ 充值API调用失败:', rechargeResponse.status);
        console.log('错误详情:', rechargeResponse.data);
      }
      
    } else {
      console.log('❌ 登录失败:', loginResponse.status);
      console.log('错误详情:', loginResponse.data);
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误数据:', error.response.data);
      console.error('请求头:', error.response.headers);
    } else if (error.request) {
      console.error('请求错误:', error.request);
    } else {
      console.error('错误信息:', error.message);
    }
  }
}

// 运行测试
testAuthenticationComplete();