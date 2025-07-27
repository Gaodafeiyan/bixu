const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';
const ADMIN_TOKEN = 'your-admin-token-here'; // 需要替换为实际的管理员token

// 检查用户抽奖机会
async function checkUserLotteryChances(userId) {
  console.log(`检查用户 ${userId} 的抽奖机会...`);
  
  try {
    // 1. 检查抽奖机会表
    const chancesResponse = await axios.get(`${BASE_URL}/api/choujiang-jihuis`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        'filters[user][id]': userId,
        'populate': ['jiangpin', 'user']
      }
    });
    
    console.log('抽奖机会数据:');
    console.log(JSON.stringify(chancesResponse.data, null, 2));
    
    // 2. 检查抽奖奖品表
    const prizesResponse = await axios.get(`${BASE_URL}/api/choujiang-jiangpins`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n抽奖奖品数据:');
    console.log(JSON.stringify(prizesResponse.data, null, 2));
    
    // 3. 检查用户信息
    const userResponse = await axios.get(`${BASE_URL}/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n用户信息:');
    console.log(JSON.stringify(userResponse.data, null, 2));
    
  } catch (error) {
    console.error('检查失败:', error.response?.data || error.message);
  }
}

// 检查数据库表结构
async function checkDatabaseSchema() {
  console.log('检查数据库表结构...');
  
  try {
    // 检查抽奖机会表结构
    const chancesSchemaResponse = await axios.get(`${BASE_URL}/api/choujiang-jihuis/content-type`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('抽奖机会表结构:');
    console.log(JSON.stringify(chancesSchemaResponse.data, null, 2));
    
  } catch (error) {
    console.error('检查表结构失败:', error.response?.data || error.message);
  }
}

// 主函数
async function main() {
  try {
    console.log('开始检查用户抽奖机会...');
    
    // 检查用户789的抽奖机会
    await checkUserLotteryChances(789);
    
    // 检查数据库表结构
    await checkDatabaseSchema();
    
  } catch (error) {
    console.error('检查失败:', error);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  checkUserLotteryChances,
  checkDatabaseSchema
}; 