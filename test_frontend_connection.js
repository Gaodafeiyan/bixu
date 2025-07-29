const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testFrontendConnection() {
  console.log('🔍 测试前端连接问题...\n');
  console.log(`服务器地址: ${BASE_URL}\n`);

  // 1. 测试基础连接
  console.log('1. 测试基础连接...');
  try {
    const response = await axios.get(`${BASE_URL}/api/health`, {
      timeout: 10000,
      validateStatus: () => true
    });
    console.log(`✅ 基础连接正常: ${response.status}`);
  } catch (error) {
    console.log(`❌ 基础连接失败: ${error.message}`);
    return;
  }

  // 2. 测试用户登录
  console.log('\n2. 测试用户登录...');
  let token = null;
  try {
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: '852',
      password: '123456'
    });
    
    token = loginResponse.data.jwt;
    console.log('✅ 登录成功');
    console.log(`   用户ID: ${loginResponse.data.user.id}`);
    console.log(`   用户名: ${loginResponse.data.user.username}`);
  } catch (error) {
    console.log('❌ 登录失败:', error.response?.data || error.message);
    return;
  }

  // 3. 测试前端调用的所有API
  console.log('\n3. 测试前端API调用...');
  
  const apiTests = [
    {
      name: '用户钱包',
      url: '/api/qianbao-yues/user-wallet',
      method: 'GET',
      auth: true
    },
    {
      name: '我的投资',
      url: '/api/dinggou-jihuas/my-investments?page=1&pageSize=10',
      method: 'GET',
      auth: true
    },
    {
      name: '团队统计',
      url: '/api/yaoqing-jianglis/team-stats',
      method: 'GET',
      auth: true
    },
    {
      name: '用户奖励',
      url: '/api/yaoqing-jianglis/user-rewards?page=1&pageSize=10',
      method: 'GET',
      auth: true
    },
    {
      name: '抽奖机会',
      url: '/api/choujiang-jihuis/my-chances',
      method: 'GET',
      auth: true
    },
    {
      name: '公告列表',
      url: '/api/notices',
      method: 'GET',
      auth: false
    }
  ];

  for (const test of apiTests) {
    try {
      const config = {
        method: test.method.toLowerCase(),
        url: `${BASE_URL}${test.url}`,
        timeout: 10000,
        validateStatus: () => true
      };

      if (test.auth && token) {
        config.headers = {
          'Authorization': `Bearer ${token}`
        };
      }

      const response = await axios(config);
      
      if (response.status === 200) {
        console.log(`✅ ${test.name}: 成功 (${response.status})`);
        if (response.data && response.data.data) {
          const dataLength = Array.isArray(response.data.data) ? response.data.data.length : 1;
          console.log(`   数据条数: ${dataLength}`);
        }
      } else if (response.status === 401) {
        console.log(`🔒 ${test.name}: 需要认证 (${response.status})`);
      } else if (response.status === 404) {
        console.log(`❌ ${test.name}: 未找到 (${response.status})`);
      } else {
        console.log(`⚠️ ${test.name}: 其他错误 (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: 请求失败 - ${error.message}`);
    }
  }

  // 4. 测试网络连接问题
  console.log('\n4. 测试网络连接问题...');
  
  // 测试DNS解析
  try {
    const dnsResponse = await axios.get('http://118.107.4.158:1337/api/health', {
      timeout: 5000
    });
    console.log('✅ DNS解析正常');
  } catch (error) {
    console.log('❌ DNS解析失败:', error.message);
  }

  // 测试端口连接
  try {
    const net = require('net');
    const client = new net.Socket();
    
    await new Promise((resolve, reject) => {
      client.connect(1337, '118.107.4.158', () => {
        console.log('✅ 端口连接正常');
        client.destroy();
        resolve();
      });
      
      client.on('error', (err) => {
        console.log('❌ 端口连接失败:', err.message);
        reject(err);
      });
      
      setTimeout(() => {
        client.destroy();
        reject(new Error('连接超时'));
      }, 5000);
    });
  } catch (error) {
    console.log('❌ 端口连接测试失败:', error.message);
  }

  console.log('\n🎯 测试完成！');
  console.log('\n📋 问题分析:');
  console.log('1. 如果所有API都返回200，说明后端正常');
  console.log('2. 如果某些API返回404，说明缺少对应的API模块');
  console.log('3. 如果连接失败，说明网络或服务器问题');
  console.log('4. 前端显示"网络错误"可能是因为某个API调用失败');
}

// 运行测试
testFrontendConnection().catch(console.error);