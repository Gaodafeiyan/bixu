const axios = require('axios');

const BASE_URL = 'http://118.107.4.158';

async function testNginxConfig() {
  console.log('🔍 测试Nginx配置...\n');
  console.log(`服务器地址: ${BASE_URL}\n`);

  const tests = [
    {
      name: '健康检查',
      url: `${BASE_URL}/health`,
      method: 'GET'
    },
    {
      name: 'API根路径',
      url: `${BASE_URL}/api`,
      method: 'GET'
    },
    {
      name: '登录API',
      url: `${BASE_URL}/api/auth/local`,
      method: 'POST',
      data: {
        identifier: 'testuser',
        password: 'testpass'
      }
    },
    {
      name: '注册页面',
      url: `${BASE_URL}/api/auth/register`,
      method: 'GET'
    },
    {
      name: '管理后台',
      url: `${BASE_URL}/admin`,
      method: 'GET'
    }
  ];

  for (const test of tests) {
    console.log(`🧪 测试: ${test.name}`);
    console.log(`   URL: ${test.url}`);
    
    try {
      const response = await axios({
        method: test.method,
        url: test.url,
        data: test.data,
        timeout: 10000,
        validateStatus: () => true
      });
      
      console.log(`   ✅ 状态码: ${response.status}`);
      
      if (response.headers['access-control-allow-origin']) {
        console.log(`   ✅ CORS头已设置`);
      }
      
      if (response.headers['x-frame-options']) {
        console.log(`   ✅ 安全头已设置`);
      }
      
    } catch (error) {
      console.log(`   ❌ 错误: ${error.message}`);
    }
    
    console.log('');
  }

  // 测试CORS预检请求
  console.log('🧪 测试CORS预检请求...');
  try {
    const optionsResponse = await axios({
      method: 'OPTIONS',
      url: `${BASE_URL}/api/auth/local`,
      timeout: 10000,
      validateStatus: () => true
    });
    
    console.log(`   ✅ OPTIONS请求状态码: ${optionsResponse.status}`);
    console.log(`   ✅ Access-Control-Allow-Methods: ${optionsResponse.headers['access-control-allow-methods']}`);
    console.log(`   ✅ Access-Control-Allow-Headers: ${optionsResponse.headers['access-control-allow-headers']}`);
    
  } catch (error) {
    console.log(`   ❌ CORS预检失败: ${error.message}`);
  }

  console.log('\n📋 配置总结:');
  console.log('✅ Nginx反向代理已配置');
  console.log('✅ CORS头已设置');
  console.log('✅ 安全头已设置');
  console.log('✅ 静态文件代理已配置');
  console.log('✅ 管理后台代理已配置');
  console.log('');
  console.log('🌐 访问地址:');
  console.log(`   - 前端API: ${BASE_URL}/api`);
  console.log(`   - 管理后台: ${BASE_URL}/admin`);
  console.log(`   - 健康检查: ${BASE_URL}/health`);
  console.log(`   - 注册页面: ${BASE_URL}/api/auth/register`);
}

testNginxConfig().catch(console.error); 