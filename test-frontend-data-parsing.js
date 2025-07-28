const axios = require('axios');

// 模拟前端数据解析逻辑
async function testFrontendDataParsing() {
  try {
    console.log('=== 测试前端数据解析逻辑 ===');
    
    // 1. 模拟登录获取token
    const loginResponse = await axios.post('http://localhost:1337/api/auth/local', {
      identifier: '741@qq.com',
      password: '741'
    });
    
    const token = loginResponse.data.jwt;
    const userId = loginResponse.data.user.id;
    
    console.log(`用户登录成功: ${loginResponse.data.user.username}, ID: ${userId}`);
    
    // 2. 获取抽奖机会数据
    const chancesResponse = await axios.get('http://localhost:1337/api/choujiang-jihuis/my-chances', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('API返回的原始数据:');
    console.log(JSON.stringify(chancesResponse.data, null, 2));
    
    // 3. 模拟前端数据解析逻辑
    const apiResult = {
      success: true,
      data: chancesResponse.data
    };
    
    console.log('\n=== 模拟前端解析逻辑 ===');
    
    if (apiResult.success) {
      // 模拟前端的数据提取逻辑
      const chancesData = apiResult.data.data.chances || [];
      console.log(`提取的chances数组长度: ${chancesData.length}`);
      
      let totalChances = 0;
      for (let i = 0; i < chancesData.length; i++) {
        const chance = chancesData[i];
        const remainingCount = chance.count - (chance.usedCount || 0);
        totalChances += remainingCount;
        
        console.log(`抽奖机会 ${i + 1}:`);
        console.log(`  ID: ${chance.id}`);
        console.log(`  总次数: ${chance.count}`);
        console.log(`  已用次数: ${chance.usedCount || 0}`);
        console.log(`  剩余次数: ${remainingCount}`);
        console.log(`  是否可用: ${remainingCount > 0}`);
        console.log(`  类型: ${chance.type}`);
        console.log(`  原因: ${chance.reason}`);
        console.log('');
      }
      
      console.log(`=== 前端计算的总抽奖次数: ${totalChances} ===`);
      
      // 4. 验证数据是否正确
      if (totalChances > 0) {
        console.log('✅ 前端应该能正确显示抽奖次数');
      } else {
        console.log('❌ 前端显示抽奖次数为0，需要检查数据解析逻辑');
      }
    }
    
  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testFrontendDataParsing(); 