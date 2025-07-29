const axios = require('axios');

// 配置
const BASE_URL = 'http://localhost:1337';

async function debugLotteryIssue() {
  try {
    console.log('🔍 诊断抽奖机会赠送问题...\n');

    // 1. 检查抽奖奖品
    console.log('1️⃣ 检查抽奖奖品...');
    try {
      const prizesResponse = await axios.get(`${BASE_URL}/api/choujiang-jiangpins`);
      const prizes = prizesResponse.data.results || [];
      const activePrizes = prizes.filter(p => p.kaiQi === true);
      
      console.log(`📊 总奖品数: ${prizes.length}`);
      console.log(`📊 可用奖品数: ${activePrizes.length}`);
      
      if (activePrizes.length === 0) {
        console.log('❌ 问题: 没有可用的抽奖奖品!');
        console.log('💡 解决方案: 在管理后台创建至少一个 kaiQi=true 的奖品');
      } else {
        console.log('✅ 有可用的抽奖奖品');
        activePrizes.forEach(prize => {
          console.log(`   - ${prize.name} (ID: ${prize.id})`);
        });
      }
    } catch (error) {
      console.log('❌ 无法获取抽奖奖品:', error.message);
    }

    // 2. 检查认购计划配置
    console.log('\n2️⃣ 检查认购计划配置...');
    try {
      const plansResponse = await axios.get(`${BASE_URL}/api/dinggou-jihuas`);
      const plans = plansResponse.data.results || [];
      
      console.log(`📊 认购计划数: ${plans.length}`);
      
      plans.forEach(plan => {
        console.log(`   - ${plan.name}: lottery_chances = ${plan.lottery_chances || 0}`);
        if (!plan.lottery_chances || plan.lottery_chances === 0) {
          console.log(`   ⚠️ 计划 ${plan.name} 没有配置抽奖机会`);
        }
      });
    } catch (error) {
      console.log('❌ 无法获取认购计划:', error.message);
    }

    // 3. 检查抽奖机会记录
    console.log('\n3️⃣ 检查抽奖机会记录...');
    try {
      const chancesResponse = await axios.get(`${BASE_URL}/api/choujiang-jihuis`);
      const chances = chancesResponse.data.results || [];
      const redeemChances = chances.filter(c => c.type === 'investment_redeem');
      
      console.log(`📊 总抽奖机会记录: ${chances.length}`);
      console.log(`📊 投资赎回相关记录: ${redeemChances.length}`);
      
      if (redeemChances.length > 0) {
        console.log('📋 投资赎回抽奖机会详情:');
        redeemChances.forEach(chance => {
          console.log(`   - ID: ${chance.id}, 用户: ${chance.user?.id}, 次数: ${chance.count}, 已用: ${chance.usedCount || 0}`);
        });
      }
    } catch (error) {
      console.log('❌ 无法获取抽奖机会记录:', error.message);
    }

    // 4. 检查投资订单
    console.log('\n4️⃣ 检查投资订单...');
    try {
      const ordersResponse = await axios.get(`${BASE_URL}/api/dinggou-dingdans`);
      const orders = ordersResponse.data.results || [];
      const finishedOrders = orders.filter(o => o.status === 'finished');
      
      console.log(`📊 总投资订单: ${orders.length}`);
      console.log(`📊 已完成订单: ${finishedOrders.length}`);
      
      if (finishedOrders.length > 0) {
        console.log('📋 已完成订单详情:');
        finishedOrders.slice(0, 5).forEach(order => {
          console.log(`   - ID: ${order.id}, 用户: ${order.user?.id}, 状态: ${order.status}, 赎回时间: ${order.redeemed_at || '无'}`);
        });
      }
    } catch (error) {
      console.log('❌ 无法获取投资订单:', error.message);
    }

    // 5. 总结问题
    console.log('\n📋 问题诊断总结:');
    console.log('可能的原因:');
    console.log('1. 没有可用的抽奖奖品 (kaiQi: true)');
    console.log('2. 认购计划没有配置 lottery_chances 字段');
    console.log('3. 赎回时创建抽奖机会失败（数据库约束或权限问题）');
    console.log('4. 前端数据刷新延迟');
    
    console.log('\n💡 建议的解决步骤:');
    console.log('1. 在管理后台创建至少一个可用的抽奖奖品');
    console.log('2. 确保认购计划配置了 lottery_chances > 0');
    console.log('3. 检查后端日志中的错误信息');
    console.log('4. 测试赎回功能并验证抽奖机会是否正确创建');

  } catch (error) {
    console.error('❌ 诊断失败:', error.message);
  }
}

// 运行诊断
debugLotteryIssue();