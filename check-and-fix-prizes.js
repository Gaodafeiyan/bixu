const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 检查当前奖品配置
async function checkCurrentPrizes() {
  console.log('=== 检查当前奖品配置 ===');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/choujiang-jiangpins`);
    const prizes = response.data.data;
    
    console.log(`总共有 ${prizes.length} 个奖品`);
    
    prizes.forEach(prize => {
      console.log(`奖品: ${prize.attributes.name}`);
      console.log(`  - 开启状态: ${prize.attributes.kaiQi ? '开启' : '关闭'}`);
      console.log(`  - 中奖概率: ${prize.attributes.zhongJiangLv}%`);
      console.log(`  - 当前库存: ${prize.attributes.currentQuantity || 0}`);
      console.log(`  - 最大库存: ${prize.attributes.maxQuantity || '无限制'}`);
      console.log(`  - 奖品类型: ${prize.attributes.jiangpinType}`);
      console.log(`  - 奖品价值: ${prize.attributes.value}`);
      console.log('---');
    });
    
    return prizes;
  } catch (error) {
    console.error('获取奖品列表失败:', error.response?.data || error.message);
    return [];
  }
}

// 创建多样化的奖品池
async function createDiversePrizes() {
  console.log('\n=== 创建多样化奖品池 ===');
  
  const prizes = [
    {
      name: 'USDT小额奖励',
      description: '小额USDT奖励',
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
      description: '中额USDT奖励',
      jiangpinType: 'usdt',
      value: 20,
      zhongJiangLv: 25, // 25%中奖率
      maxQuantity: 0, // 无限制
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
      maxQuantity: 0, // 无限制
      currentQuantity: 0,
      kaiQi: true,
      paiXuShunXu: 3,
      rarity: 'rare',
      minUserLevel: 0
    },
    {
      name: 'USDT大额奖励',
      description: '大额USDT奖励',
      jiangpinType: 'usdt',
      value: 50,
      zhongJiangLv: 10, // 10%中奖率
      maxQuantity: 0, // 无限制
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
      value: 100,
      zhongJiangLv: 5, // 5%中奖率
      maxQuantity: 0, // 无限制
      currentQuantity: 0,
      kaiQi: true,
      paiXuShunXu: 5,
      rarity: 'legendary',
      minUserLevel: 0
    }
  ];

  const createdPrizes = [];
  
  for (const prize of prizes) {
    try {
      const response = await axios.post(`${BASE_URL}/api/choujiang-jiangpins`, {
        data: prize
      });
      
      console.log(`✅ 创建奖品成功: ${prize.name}, ID: ${response.data.data.id}`);
      createdPrizes.push(response.data.data);
    } catch (error) {
      console.error(`❌ 创建奖品失败: ${prize.name}`, error.response?.data || error.message);
    }
  }
  
  return createdPrizes;
}

// 启用所有现有奖品
async function enableAllPrizes() {
  console.log('\n=== 启用所有现有奖品 ===');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/choujiang-jiangpins`);
    const prizes = response.data.data;
    
    for (const prize of prizes) {
      try {
        await axios.put(`${BASE_URL}/api/choujiang-jiangpins/${prize.id}`, {
          data: {
            kaiQi: true,
            maxQuantity: 0, // 设置为无限制
            currentQuantity: 0
          }
        });
        console.log(`✅ 启用奖品: ${prize.attributes.name}`);
      } catch (error) {
        console.error(`❌ 启用奖品失败: ${prize.attributes.name}`, error.response?.data || error.message);
      }
    }
  } catch (error) {
    console.error('获取奖品列表失败:', error.response?.data || error.message);
  }
}

// 测试抽奖API
async function testLotteryAPI() {
  console.log('\n=== 测试抽奖API ===');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/choujiang-jiangpins`);
    const prizes = response.data.data;
    
    const availablePrizes = prizes.filter(prize => 
      prize.attributes.kaiQi && 
      (prize.attributes.maxQuantity === 0 || prize.attributes.currentQuantity < prize.attributes.maxQuantity)
    );
    
    console.log(`可用奖品数量: ${availablePrizes.length}`);
    availablePrizes.forEach(prize => {
      console.log(`  - ${prize.attributes.name}: ${prize.attributes.zhongJiangLv}%`);
    });
    
    if (availablePrizes.length === 0) {
      console.log('❌ 没有可用奖品！');
    } else if (availablePrizes.length === 1) {
      console.log('⚠️ 只有1个可用奖品，建议添加更多奖品');
    } else {
      console.log('✅ 奖品池配置正常');
    }
  } catch (error) {
    console.error('测试抽奖API失败:', error.response?.data || error.message);
  }
}

// 主函数
async function main() {
  console.log('🎰 抽奖奖品配置检查和修复工具\n');
  
  // 1. 检查当前配置
  await checkCurrentPrizes();
  
  // 2. 启用所有现有奖品
  await enableAllPrizes();
  
  // 3. 创建新的多样化奖品
  await createDiversePrizes();
  
  // 4. 再次检查配置
  await checkCurrentPrizes();
  
  // 5. 测试抽奖API
  await testLotteryAPI();
  
  console.log('\n🎉 奖品配置检查和修复完成！');
}

// 运行脚本
main().catch(console.error); 