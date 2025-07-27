const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 测试抽奖API
async function testLotteryAPI() {
  console.log('=== 测试抽奖API ===');
  
  try {
    // 1. 测试获取抽奖机会API（不需要认证）
    console.log('\n1. 测试获取抽奖机会API...');
    const chancesResponse = await axios.get(`${BASE_URL}/api/choujiang-jihuis`);
    console.log('抽奖机会API响应状态:', chancesResponse.status);
    console.log('数据:', JSON.stringify(chancesResponse.data, null, 2));
    
    // 2. 测试获取抽奖奖品API
    console.log('\n2. 测试获取抽奖奖品API...');
    const prizesResponse = await axios.get(`${BASE_URL}/api/choujiang-jiangpins`);
    console.log('抽奖奖品API响应状态:', prizesResponse.status);
    console.log('数据:', JSON.stringify(prizesResponse.data, null, 2));
    
    // 3. 测试用户789的抽奖机会
    console.log('\n3. 测试用户789的抽奖机会...');
    const userChancesResponse = await axios.get(`${BASE_URL}/api/choujiang-jihuis`, {
      params: {
        'filters[user][id]': 789,
        'populate': ['jiangpin', 'user']
      }
    });
    console.log('用户789抽奖机会API响应状态:', userChancesResponse.status);
    console.log('数据:', JSON.stringify(userChancesResponse.data, null, 2));
    
  } catch (error) {
    console.error('API测试失败:', error.response?.data || error.message);
  }
}

// 测试前端API调用
async function testFrontendAPI() {
  console.log('\n=== 测试前端API调用 ===');
  
  try {
    // 模拟前端调用 /api/choujiang-jihuis/my-chances
    console.log('\n1. 测试 /api/choujiang-jihuis/my-chances...');
    const myChancesResponse = await axios.get(`${BASE_URL}/api/choujiang-jihuis/my-chances`);
    console.log('my-chances API响应状态:', myChancesResponse.status);
    console.log('数据:', JSON.stringify(myChancesResponse.data, null, 2));
    
  } catch (error) {
    console.error('前端API测试失败:', error.response?.data || error.message);
    console.log('错误状态码:', error.response?.status);
    console.log('错误信息:', error.response?.data);
  }
}

// 主函数
async function main() {
  try {
    await testLotteryAPI();
    await testFrontendAPI();
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  testLotteryAPI,
  testFrontendAPI
}; 