const axios = require('axios');

// 配置
const BASE_URL = 'http://localhost:1337';
const TEST_USER = {
  email: 'test@example.com',
  password: 'test123456'
};

async function testInviteAPIs() {
  try {
    console.log('🧪 开始测试邀请API...\n');

    // 1. 登录获取token
    console.log('1. 登录获取token...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, TEST_USER);
    const token = loginResponse.data.jwt;
    console.log('✅ 登录成功，获取到token\n');

    // 2. 测试获取邀请信息API
    console.log('2. 测试获取邀请信息API...');
    const inviteInfoResponse = await axios.get(`${BASE_URL}/api/auth/invite-info`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 邀请信息API响应:', JSON.stringify(inviteInfoResponse.data, null, 2));
    console.log('');

    // 3. 测试生成邀请链接API
    console.log('3. 测试生成邀请链接API...');
    const inviteLinkResponse = await axios.get(`${BASE_URL}/api/auth/generate-invite-link`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 邀请链接API响应:', JSON.stringify(inviteLinkResponse.data, null, 2));
    console.log('');

    // 4. 测试生成二维码API
    console.log('4. 测试生成二维码API...');
    const qrCodeResponse = await axios.get(`${BASE_URL}/api/auth/invite-qr-code`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 二维码API响应:', JSON.stringify(qrCodeResponse.data, null, 2));
    console.log('');

    // 5. 测试记录分享行为API
    console.log('5. 测试记录分享行为API...');
    const shareResponse = await axios.post(`${BASE_URL}/api/auth/track-invite-share`, {
      shareType: 'copy',
      sharePlatform: 'clipboard'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 分享记录API响应:', JSON.stringify(shareResponse.data, null, 2));
    console.log('');

    console.log('🎉 所有API测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testInviteAPIs(); 