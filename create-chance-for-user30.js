const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';
const ADMIN_TOKEN = 'your-admin-token-here'; // 需要替换为实际的管理员token

// 为用户30创建抽奖机会
async function createChanceForUser30() {
  console.log('为用户30创建抽奖机会...');
  
  try {
    // 1. 先获取可用的奖品
    const prizesResponse = await axios.get(`${BASE_URL}/api/choujiang-jiangpins`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const prizes = prizesResponse.data.data || [];
    if (prizes.length === 0) {
      console.error('没有可用的奖品');
      return;
    }
    
    const defaultPrize = prizes[0];
    console.log(`使用奖品: ${defaultPrize.attributes?.name || defaultPrize.name}`);
    
    // 2. 为用户30创建抽奖机会
    const chanceData = {
      data: {
        user: 30, // 用户ID 30
        jiangpin: defaultPrize.id,
        count: 3,
        usedCount: 0,
        reason: '测试抽奖机会',
        type: 'admin_grant',
        isActive: true
      }
    };
    
    const response = await axios.post(`${BASE_URL}/api/choujiang-jihuis`, chanceData, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('创建成功:', response.data);
    console.log('用户30现在有3次抽奖机会了！');
    
  } catch (error) {
    console.error('创建失败:', error.response?.data || error.message);
  }
}

// 检查用户30的抽奖机会
async function checkUser30Chances() {
  console.log('检查用户30的抽奖机会...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/choujiang-jihuis`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        'filters[user][id]': 30,
        'populate': ['jiangpin', 'user']
      }
    });
    
    console.log('用户30的抽奖机会:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('检查失败:', error.response?.data || error.message);
  }
}

// 主函数
async function main() {
  try {
    console.log('开始为用户30创建抽奖机会...');
    
    // 先检查现有机会
    await checkUser30Chances();
    
    // 创建新机会
    await createChanceForUser30();
    
    // 再次检查
    await checkUser30Chances();
    
  } catch (error) {
    console.error('操作失败:', error);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  createChanceForUser30,
  checkUser30Chances
}; 