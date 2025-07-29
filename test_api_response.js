const axios = require('axios');

async function testLotteryChancesAPI() {
  try {
    // 使用用户7的JWT token
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiaWF0IjoxNzUzNzczMjk0LCJleHAiOjE3NTQzNzgwOTR9.EL_666bg3kTzoa224J7sxXSOvViDiN2PQAp8VWcSDoE';
    
    const response = await axios.get('http://118.107.4.158:1337/api/choujiang-jihuis/my-chances', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('API响应状态:', response.status);
    console.log('API响应数据:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // 检查数据结构
    if (response.data.success) {
      console.log('\n=== 数据结构分析 ===');
      console.log('data.chances 类型:', typeof response.data.data.chances);
      console.log('data.chances 长度:', response.data.data.chances?.length || 0);
      
      if (response.data.data.chances && response.data.data.chances.length > 0) {
        console.log('第一个抽奖机会数据:');
        console.log(JSON.stringify(response.data.data.chances[0], null, 2));
      }
    }
    
  } catch (error) {
    console.error('API调用失败:', error.response?.data || error.message);
  }
}

testLotteryChancesAPI();