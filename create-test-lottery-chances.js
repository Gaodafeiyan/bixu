const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';
const ADMIN_TOKEN = 'your-admin-token-here'; // 需要替换为实际的管理员token

// 创建抽奖奖品
async function createLotteryPrizes() {
  console.log('创建抽奖奖品...');
  
  const prizes = [
    {
      name: 'USDT奖励',
      description: 'USDT代币奖励',
      jiangpinType: 'usdt',
      value: 10,
      zhongJiangLv: 30, // 30%中奖率
      maxQuantity: 1000,
      currentQuantity: 0,
      kaiQi: true,
      paiXuShunXu: 1,
      rarity: 'common',
      minUserLevel: 0
    },
    {
      name: 'AI代币奖励',
      description: 'AI代币奖励',
      jiangpinType: 'ai_token',
      value: 50,
      zhongJiangLv: 20, // 20%中奖率
      maxQuantity: 500,
      currentQuantity: 0,
      kaiQi: true,
      paiXuShunXu: 2,
      rarity: 'rare',
      minUserLevel: 0
    },
    {
      name: '幸运大奖',
      description: '幸运大奖USDT',
      jiangpinType: 'usdt',
      value: 100,
      zhongJiangLv: 5, // 5%中奖率
      maxQuantity: 100,
      currentQuantity: 0,
      kaiQi: true,
      paiXuShunXu: 3,
      rarity: 'epic',
      minUserLevel: 0
    }
  ];

  const createdPrizes = [];
  
  for (const prize of prizes) {
    try {
      const response = await axios.post(`${BASE_URL}/api/choujiang-jiangpins`, {
        data: prize
      }, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`创建奖品成功: ${prize.name}, ID: ${response.data.data.id}`);
      createdPrizes.push(response.data.data);
    } catch (error) {
      console.error(`创建奖品失败: ${prize.name}`, error.response?.data || error.message);
    }
  }
  
  return createdPrizes;
}

// 为用户创建抽奖机会
async function createLotteryChances(userId, prizeId) {
  console.log(`为用户 ${userId} 创建抽奖机会...`);
  
  try {
    const response = await axios.post(`${BASE_URL}/api/choujiang-jihuis/give-chance`, {
      userId: userId,
      jiangpinId: prizeId,
      count: 3,
      reason: '测试抽奖机会',
      type: 'admin_grant'
    }, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`创建抽奖机会成功: ${response.data.message}`);
    return response.data.data;
  } catch (error) {
    console.error('创建抽奖机会失败:', error.response?.data || error.message);
    return null;
  }
}

// 主函数
async function main() {
  try {
    console.log('开始创建测试数据...');
    
    // 1. 创建抽奖奖品
    const prizes = await createLotteryPrizes();
    
    if (prizes.length === 0) {
      console.error('没有创建任何奖品，无法继续');
      return;
    }
    
    // 2. 为测试用户创建抽奖机会（需要替换为实际的用户ID）
    const testUserId = 1; // 替换为实际的用户ID
    const defaultPrize = prizes[0]; // 使用第一个奖品
    
    await createLotteryChances(testUserId, defaultPrize.id);
    
    console.log('测试数据创建完成！');
    console.log('现在用户可以：');
    console.log('1. 访问抽奖页面查看抽奖机会');
    console.log('2. 点击抽奖按钮体验老虎机动画');
    console.log('3. 查看抽奖结果');
    
  } catch (error) {
    console.error('创建测试数据失败:', error);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  createLotteryPrizes,
  createLotteryChances
}; 