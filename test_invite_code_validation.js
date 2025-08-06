const axios = require('axios');

// 配置
const BASE_URL = 'https://zenithus.app'; // 使用生产环境URL
const TEST_INVITE_CODE = 'J7T3M7';

async function testInviteCodeValidation() {
  try {
    console.log('🧪 开始测试邀请码验证API...\n');

    // 1. 测试邀请码验证API
    console.log('1. 测试邀请码验证API...');
    console.log(`URL: ${BASE_URL}/api/auth/validate-invite-code/${TEST_INVITE_CODE}`);
    
    const validationResponse = await axios.get(`${BASE_URL}/api/auth/validate-invite-code/${TEST_INVITE_CODE}`);
    
    console.log('✅ 邀请码验证API响应状态:', validationResponse.status);
    console.log('✅ 邀请码验证API响应数据:', JSON.stringify(validationResponse.data, null, 2));
    console.log('');

    // 2. 测试下载页面API
    console.log('2. 测试下载页面API...');
    console.log(`URL: ${BASE_URL}/auth/download?invite=${TEST_INVITE_CODE}`);
    
    const downloadResponse = await axios.get(`${BASE_URL}/auth/download?invite=${TEST_INVITE_CODE}`);
    
    console.log('✅ 下载页面API响应状态:', downloadResponse.status);
    console.log('✅ 下载页面是否包含邀请码:', downloadResponse.data.includes(TEST_INVITE_CODE));
    console.log('');

    // 3. 测试邀请链接格式
    console.log('3. 测试邀请链接格式...');
    const inviteLink = `${BASE_URL}/auth/download?invite=${TEST_INVITE_CODE}`;
    console.log('邀请链接:', inviteLink);
    console.log('');

    console.log('🎉 所有API测试完成！');
    console.log('');
    console.log('📱 前端测试建议:');
    console.log('1. 在手机浏览器中打开邀请链接');
    console.log('2. 点击下载按钮');
    console.log('3. 观察应用是否自动打开');
    console.log('4. 检查邀请码是否自动填充');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
    console.error('❌ 错误详情:', error.response?.status, error.response?.statusText);
  }
}

// 运行测试
testInviteCodeValidation(); 