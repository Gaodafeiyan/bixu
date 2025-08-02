const fetch = require('node-fetch');

async function testStatsAPI() {
  try {
    console.log('🧪 测试统计API...');
    
    const response = await fetch('http://118.107.4.158:1337/api/choujiang-ji-lus/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API响应成功:');
    console.log('📊 总抽奖次数:', data.data.totalDraws);
    console.log('🏆 总中奖次数:', data.data.totalWins);
    console.log('📈 中奖率:', data.data.winRate);
    console.log('📅 月度统计数量:', data.data.monthlyStats?.length || 0);
    console.log('📅 周度统计数量:', data.data.weeklyStats?.length || 0);
    console.log('🎁 奖品类型统计:', Object.keys(data.data.typeStats || {}));
    
    if (data.data.monthlyStats) {
      console.log('\n📅 月度统计示例:');
      data.data.monthlyStats.slice(0, 2).forEach(stat => {
        console.log(`  ${stat.period}: 抽奖${stat.draws}次, 中奖${stat.wins}次, 率${stat.rate}`);
      });
    }
    
    if (data.data.weeklyStats) {
      console.log('\n📅 周度统计示例:');
      data.data.weeklyStats.slice(0, 2).forEach(stat => {
        console.log(`  ${stat.period}: 抽奖${stat.draws}次, 中奖${stat.wins}次, 率${stat.rate}`);
      });
    }
    
    if (data.data.typeStats) {
      console.log('\n🎁 奖品类型统计:');
      Object.entries(data.data.typeStats).forEach(([type, stats]) => {
        console.log(`  ${type}: 数量${stats.count}, 占比${stats.percentage}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testStatsAPI(); 