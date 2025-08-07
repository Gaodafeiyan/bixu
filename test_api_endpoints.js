const axios = require('axios');

const BASE_URL = 'http://localhost:1337';

// 测试的API端点列表
const endpoints = [
  { method: 'GET', path: '/api/health', description: '健康检查' },
  { method: 'GET', path: '/api/auth/validate-invite-code/TEST123', description: '验证邀请码' },
  { method: 'GET', path: '/api/auth/download', description: '下载页面' },
  { method: 'GET', path: '/api/auth/download-apk', description: 'APK下载' },
  { method: 'GET', path: '/api/banners', description: 'Banner列表' },
  { method: 'GET', path: '/api/notices', description: '通知列表' },
  { method: 'GET', path: '/api/qianbao-yues', description: '钱包列表' },
  { method: 'GET', path: '/api/dinggou-jihuas', description: '认购计划列表' },
  { method: 'GET', path: '/api/choujiang-jiangpins', description: '抽奖奖品列表' },
  { method: 'GET', path: '/api/shop-products', description: '商城商品列表' },
];

async function testEndpoint(method, path, description) {
  try {
    console.log(`🔍 测试: ${description}`);
    console.log(`   ${method} ${BASE_URL}${path}`);
    
    const response = await axios({
      method: method.toLowerCase(),
      url: `${BASE_URL}${path}`,
      timeout: 5000,
      validateStatus: () => true // 接受所有状态码
    });
    
    const status = response.status;
    const statusText = response.statusText;
    
    if (status === 200) {
      console.log(`   ✅ 成功 (${status})`);
    } else if (status === 401) {
      console.log(`   ⚠️  需要认证 (${status})`);
    } else if (status === 404) {
      console.log(`   ❌ 未找到 (${status})`);
    } else {
      console.log(`   ⚠️  其他状态 (${status} ${statusText})`);
    }
    
    return { path, status, success: status < 400 };
  } catch (error) {
    console.log(`   ❌ 错误: ${error.message}`);
    return { path, status: 'ERROR', success: false };
  }
}

async function testAllEndpoints() {
  console.log('🚀 开始测试API端点...\n');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.method, endpoint.path, endpoint.description);
    results.push(result);
    console.log(''); // 空行分隔
  }
  
  // 统计结果
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log('📊 测试结果统计:');
  console.log(`   成功: ${successful}/${total}`);
  console.log(`   成功率: ${((successful / total) * 100).toFixed(1)}%`);
  
  // 显示失败的端点
  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.log('\n❌ 失败的端点:');
    failed.forEach(f => {
      console.log(`   ${f.path} (${f.status})`);
    });
  }
}

// 运行测试
testAllEndpoints().catch(console.error); 