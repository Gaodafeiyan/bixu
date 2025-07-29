const axios = require('axios');
const fs = require('fs');
const path = require('path');

const baseURL = 'http://118.107.4.158:1337';

async function debug403Comprehensive() {
  console.log('=== 全面调试403错误 ===');
  
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
      console.log('用户角色:', user.role?.name);
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
      
      // 3. 测试充值订单API
      console.log('\n3. 测试充值订单API...');
      try {
        const ordersResponse = await axios.get(`${baseURL}/api/recharge-orders`, {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });
        
        if (ordersResponse.status === 200) {
          console.log('✅ 充值订单API调用成功');
        } else {
          console.log('❌ 充值订单API调用失败:', ordersResponse.status);
        }
      } catch (ordersError) {
        console.log('❌ 充值订单API调用异常:', ordersError.response?.status, ordersError.response?.data);
      }
      
      // 4. 测试充值通道API
      console.log('\n4. 测试充值通道API...');
      try {
        const channelsResponse = await axios.get(`${baseURL}/api/recharge-channels`, {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });
        
        if (channelsResponse.status === 200) {
          console.log('✅ 充值通道API调用成功');
          console.log('通道数量:', channelsResponse.data.data?.length || 0);
        } else {
          console.log('❌ 充值通道API调用失败:', channelsResponse.status);
        }
      } catch (channelsError) {
        console.log('❌ 充值通道API调用异常:', channelsError.response?.status, channelsError.response?.data);
      }
      
      // 5. 测试充值API（有问题的API）
      console.log('\n5. 测试充值API（问题API）...');
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
        console.log('请求头:', JSON.stringify(rechargeError.response?.headers, null, 2));
        
        // 详细分析错误
        if (rechargeError.response?.data) {
          console.log('\n=== 错误详情分析 ===');
          console.log('错误类型:', typeof rechargeError.response.data);
          console.log('错误内容:', JSON.stringify(rechargeError.response.data, null, 2));
        }
      }
      
      // 6. 测试JWT token有效性
      console.log('\n6. 测试JWT token有效性...');
      try {
        // 解码JWT token（不验证签名）
        const tokenParts = jwt.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          console.log('JWT Payload:', payload);
          console.log('Token过期时间:', new Date(payload.exp * 1000));
          console.log('当前时间:', new Date());
          console.log('Token是否过期:', Date.now() > payload.exp * 1000);
        }
      } catch (jwtError) {
        console.log('❌ JWT解析失败:', jwtError.message);
      }
      
      // 7. 测试不同的请求方法
      console.log('\n7. 测试不同的请求方法...');
      try {
        const getResponse = await axios.get(`${baseURL}/api/recharge-channels/simple-recharge`, {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });
        console.log('GET方法状态码:', getResponse.status);
      } catch (getError) {
        console.log('GET方法错误:', getError.response?.status, getError.response?.data?.error?.message);
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
debug403Comprehensive();