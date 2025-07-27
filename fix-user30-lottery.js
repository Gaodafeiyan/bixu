const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';
const ADMIN_TOKEN = 'your-admin-token-here'; // 替换为实际的管理员token

// 为用户30创建抽奖机会
async function createLotteryForUser30() {
  console.log('为用户30创建抽奖机会...');
  
  try {
    // 1. 获取奖品列表
    const prizesResponse = await axios.get(`${BASE_URL}/api/choujiang-jiangpins`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const prizes = prizesResponse.data.data || [];
    if (prizes.length === 0) {
      console.error('❌ 没有可用的奖品，请先创建奖品');
      return;
    }
    
    const prize = prizes[0];
    console.log(`✅ 使用奖品: ${prize.attributes?.name || prize.name} (ID: ${prize.id})`);
    
    // 2. 创建抽奖机会
    const chanceData = {
      data: {
        user: 30, // 用户ID 30
        jiangpin: prize.id,
        count: 3,
        usedCount: 0,
        reason: '为用户30创建测试抽奖机会',
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
    
    console.log('✅ 创建成功!');
    console.log('抽奖机会ID:', response.data.data.id);
    console.log('用户30现在有3次抽奖机会了！');
    
  } catch (error) {
    console.error('❌ 创建失败:', error.response?.data || error.message);
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
    
    const chances = response.data.data || [];
    console.log(`用户30有 ${chances.length} 个抽奖机会:`);
    
    chances.forEach((chance, index) => {
      console.log(`  ${index + 1}. ID: ${chance.id}, 次数: ${chance.attributes.count}, 已用: ${chance.attributes.usedCount}, 状态: ${chance.attributes.isActive ? '活跃' : '非活跃'}`);
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error.response?.data || error.message);
  }
}

// 主函数
async function main() {
  try {
    console.log('=== 为用户30创建抽奖机会 ===');
    
    // 先检查现有机会
    await checkUser30Chances();
    
    // 创建新机会
    await createLotteryForUser30();
    
    // 再次检查
    await checkUser30Chances();
    
    console.log('\n✅ 操作完成！现在请刷新前端页面查看效果。');
    
  } catch (error) {
    console.error('❌ 操作失败:', error);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  createLotteryForUser30,
  checkUser30Chances
}; 