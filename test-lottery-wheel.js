const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 模拟测试轮盘式抽奖
async function testLotteryWheel() {
  try {
    console.log('🎯 测试轮盘式抽奖逻辑...');
    
    // 1. 获取所有奖品
    const prizesResponse = await axios.get(`${BASE_URL}/api/choujiang-jiangpins`);
    const prizes = prizesResponse.data.data || [];
    
    console.log(`📦 总奖品数量: ${prizes.length}`);
    
    // 2. 检查100%概率的奖品
    const hundredPercentPrizes = prizes.filter(prize => 
      parseFloat(prize.zhongJiangLv || 0) >= 100
    );
    
    console.log(`🎯 100%中奖概率的奖品数量: ${hundredPercentPrizes.length}`);
    hundredPercentPrizes.forEach(prize => {
      console.log(`  - ${prize.name}: ${prize.zhongJiangLv}%`);
    });
    
    // 3. 模拟轮盘式选择
    if (hundredPercentPrizes.length > 0) {
      console.log('\n🎲 模拟轮盘式选择:');
      for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * hundredPercentPrizes.length);
        const selectedPrize = hundredPercentPrizes[randomIndex];
        console.log(`  第${i + 1}次: 选中 ${selectedPrize.name} (索引: ${randomIndex})`);
      }
    }
    
    // 4. 检查奖品分布
    const prizeDistribution = {};
    hundredPercentPrizes.forEach(prize => {
      const type = prize.jiangpinType || 'unknown';
      prizeDistribution[type] = (prizeDistribution[type] || 0) + 1;
    });
    
    console.log('\n📊 奖品类型分布:');
    Object.entries(prizeDistribution).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}个`);
    });
    
    console.log('\n✅ 轮盘式抽奖逻辑测试完成');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testLotteryWheel(); 