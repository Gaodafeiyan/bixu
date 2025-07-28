const axios = require('axios');

// 配置
const BASE_URL = 'http://localhost:1337';

async function getAdminToken() {
  try {
    console.log('🔑 获取管理员token...\n');

    // 管理员登录
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: 'admin@example.com', // 请替换为实际的管理员邮箱
      password: 'admin123' // 请替换为实际的管理员密码
    });

    if (loginResponse.data.jwt) {
      console.log('✅ 获取管理员token成功:');
      console.log(`Token: ${loginResponse.data.jwt}`);
      console.log('\n请复制这个token并替换 debug-lottery-chances.js 中的 ADMIN_TOKEN');
    } else {
      console.log('❌ 登录失败，未获取到token');
    }

  } catch (error) {
    console.error('❌ 获取管理员token失败:', error.response?.data || error.message);
    console.log('\n请检查管理员账号密码是否正确');
  }
}

// 运行
getAdminToken(); 