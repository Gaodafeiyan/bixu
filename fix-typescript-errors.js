    // 3. 测试注册接口
    console.log('\n3. 测试注册接口...');
    const testUsername = 'testuser' + Date.now();
    const testEmail = 'test' + Date.now() + '@example.com';
    
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/local/register`, {
        username: testUsername,
        email: testEmail,
        password: 'testpassword123'
      });

->

    // 3. 测试注册接口（需要邀请码）
    console.log('\n3. 测试注册接口（需要邀请码）...');
    const testUsername = 'testuser' + Date.now();
    const testEmail = 'test' + Date.now() + '@example.com';
    
    // 首先获取一个有效的邀请码
    console.log('获取邀请码...');
    try {
      const inviteCodeResponse = await axios.get(`${BASE_URL}/api/auth/validate-invite-code/TEST123`);
      console.log('邀请码验证结果:', inviteCodeResponse.status);
    } catch (error) {
      console.log('邀请码验证失败:', error.response?.status);
    }
    
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/invite-register`, {
        username: testUsername,
        email: testEmail,
        password: 'testpassword123',
        inviteCode: 'TEST123' // 使用测试邀请码
      });