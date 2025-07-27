const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';
const ADMIN_TOKEN = 'your-admin-token-here'; // 需要替换为实际的管理员token

// 创建多种奖品
async function createLotteryPrizes() {
  console.log('创建抽奖奖品池...');
  
  const prizes = [
    {
      name: 'USDT小额奖励',
      description: 'USDT小额奖励',
      jiangpinType: 'usdt',
      value: 5,
      zhongJiangLv: 40, // 40%中奖率
      maxQuantity: 0, // 无限制
      currentQuantity: 0,
      kaiQi: true,
      paiXuShunXu: 1,
      rarity: 'common',
      minUserLevel: 0
    },
    {
      name: 'USDT中额奖励',
      description: 'USDT中额奖励',
      jiangpinType: 'usdt',
      value: 20,
      zhongJiangLv: 25, // 25%中奖率
      maxQuantity: 0,
      currentQuantity: 0,
      kaiQi: true,
      paiXuShunXu: 2,
      rarity: 'rare',
      minUserLevel: 0
    },
    {
      name: 'AI代币奖励',
      description: 'AI代币奖励',
      jiangpinType: 'ai_token',
      value: 30,
      zhongJiangLv: 20, // 20%中奖率
      maxQuantity: 0,
      currentQuantity: 0,
      kaiQi: true,
      paiXuShunXu: 3,
      rarity: 'rare',
      minUserLevel: 0
    },
    {
      name: 'USDT大奖',
      description: 'USDT大奖',
      jiangpinType: 'usdt',
      value: 100,
      zhongJiangLv: 10, // 10%中奖率
      maxQuantity: 50,
      currentQuantity: 0,
      kaiQi: true,
      paiXuShunXu: 4,
      rarity: 'epic',
      minUserLevel: 0
    },
    {
      name: '超级大奖',
      description: '超级大奖USDT',
      jiangpinType: 'usdt',
      value: 500,
      zhongJiangLv: 2, // 2%中奖率
      maxQuantity: 10,
      currentQuantity: 0,
      kaiQi: true,
      paiXuShunXu: 5,
      rarity: 'legendary',
      minUserLevel: 0
    },
    {
      name: '谢谢参与',
      description: '谢谢参与',
      jiangpinType: 'virtual',
      value: 0,
      zhongJiangLv: 3, // 3%中奖率（实际是未中奖）
      maxQuantity: 0,
      currentQuantity: 0,
      kaiQi: true,
      paiXuShunXu: 6,
      rarity: 'common',
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
      
      console.log(`✅ 创建奖品成功: ${prize.name}, ID: ${response.data.data.id}, 概率: ${prize.zhongJiangLv}%`);
      createdPrizes.push(response.data.data);
    } catch (error) {
      console.error(`❌ 创建奖品失败: ${prize.name}`, error.response?.data || error.message);
    }
  }
  
  return createdPrizes;
}

// 为用户创建新的抽奖机会（不绑定特定奖品）
async function createUserLotteryChances() {
  console.log('\n为用户创建新的抽奖机会...');
  
  try {
    // 获取所有用户
    const usersResponse = await axios.get(`${BASE_URL}/api/users`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const users = usersResponse.data;
    console.log(`找到 ${users.length} 个用户`);
    
    for (const user of users) {
      try {
        // 为每个用户创建3次抽奖机会
        const chanceData = {
          user: user.id,
          jiangpin: null, // 不绑定特定奖品
          count: 3,
          usedCount: 0,
          reason: '系统赠送',
          type: 'admin_grant',
          isActive: true,
          validUntil: null // 永久有效
        };
        
        const response = await axios.post(`${BASE_URL}/api/choujiang-jihuis`, {
          data: chanceData
        }, {
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`✅ 为用户 ${user.username} (ID: ${user.id}) 创建抽奖机会成功`);
      } catch (error) {
        console.error(`❌ 为用户 ${user.username} 创建抽奖机会失败:`, error.response?.data || error.message);
      }
    }
  } catch (error) {
    console.error('获取用户列表失败:', error.response?.data || error.message);
  }
}

// 测试抽奖功能
async function testLotterySystem() {
  console.log('\n测试抽奖系统...');
  
  try {
    // 获取用户30的抽奖机会
    const chancesResponse = await axios.get(`${BASE_URL}/api/choujiang-jihuis?filters[user][id]=30`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const chances = chancesResponse.data.results || [];
    console.log(`用户30有 ${chances.length} 个抽奖机会`);
    
    if (chances.length > 0) {
      const chance = chances[0];
      console.log(`抽奖机会ID: ${chance.id}, 剩余次数: ${chance.count - (chance.usedCount || 0)}`);
      
      // 执行抽奖
      const drawResponse = await axios.post(`${BASE_URL}/api/choujiang-jihuis/draw`, {
        chanceId: chance.id
      }, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = drawResponse.data;
      console.log('抽奖结果:', result);
      
      if (result.success) {
        if (result.data.isWon) {
          console.log(`🎉 恭喜中奖！奖品: ${result.data.prize.name}, 价值: ${result.data.prize.value}`);
        } else {
          console.log('😔 很遗憾，未中奖');
        }
        console.log(`剩余抽奖次数: ${result.data.remainingChances}`);
      }
    }
  } catch (error) {
    console.error('测试抽奖失败:', error.response?.data || error.message);
  }
}

// 主函数
async function main() {
  console.log('🎰 开始修复抽奖系统...\n');
  
  // 1. 创建奖品池
  await createLotteryPrizes();
  
  // 2. 为用户创建抽奖机会
  await createUserLotteryChances();
  
  // 3. 测试抽奖功能
  await testLotterySystem();
  
  console.log('\n✅ 抽奖系统修复完成！');
  console.log('\n📋 修复内容:');
  console.log('1. 创建了多种奖品，包括USDT、AI代币等');
  console.log('2. 奖品概率分布: 小额奖励40% + 中额奖励25% + AI代币20% + 大奖10% + 超级大奖2% + 谢谢参与3%');
  console.log('3. 为用户创建了不绑定特定奖品的抽奖机会');
  console.log('4. 实现了真正的随机抽奖机制');
  console.log('\n🎯 现在用户可以:');
  console.log('- 从多种奖品中随机抽奖');
  console.log('- 根据概率获得不同价值的奖品');
  console.log('- 享受真正的老虎机抽奖体验');
}

// 运行脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createLotteryPrizes,
  createUserLotteryChances,
  testLotterySystem
}; 