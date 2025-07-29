const axios = require('axios');

const baseURL = 'http://118.107.4.158:1337';

async function debug403Error() {
  console.log('=== 详细调试403错误 ===');
  
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
      console.log('JWT Token:', jwt.substring(0, 50) + '...');
      
      // 2. 测试钱包API（已知工作的API）
      console.log('\n2. 测试钱包API（对比）...');
      try {
        const walletResponse = await axios.get(`${baseURL}/api/qianbao-yues/user-wallet`, {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });
        
        if (walletResponse.status === 200) {
          console.log('✅ 钱包API调用成功');
        } else {
          console.log('❌ 钱包API调用失败:', walletResponse.status);
        }
      } catch (walletError) {
        console.log('❌ 钱包API调用异常:', walletError.response?.status, walletError.response?.data);
      }
      
      // 3. 测试充值API（有问题的API）
      console.log('\n3. 测试充值API（问题API）...');
      try {
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
        }
      } catch (rechargeError) {
        console.log('❌ 充值API调用异常:');
        console.log('状态码:', rechargeError.response?.status);
        console.log('错误数据:', rechargeError.response?.data);
        console.log('请求头:', rechargeError.response?.headers);
      }
      
      // 4. 测试其他需要认证的API
      console.log('\n4. 测试其他认证API...');
      try {
        const otherResponse = await axios.get(`${baseURL}/api/recharge-orders`, {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });
        
        if (otherResponse.status === 200) {
          console.log('✅ 充值订单API调用成功');
        } else {
          console.log('❌ 充值订单API调用失败:', otherResponse.status);
        }
      } catch (otherError) {
        console.log('❌ 充值订单API调用异常:', otherError.response?.status, otherError.response?.data);
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
debug403Error();