const axios = require('axios');

// 配置
const BASE_URL = 'http://localhost:1337';
const TEST_USER = {
  username: 'testuser',
  password: 'password123'
};

async function testRedeemLottery() {
  try {
    console.log('🧪 开始测试赎回抽奖机会功能...\n');

    // 1. 用户登录
    console.log('1️⃣ 用户登录...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: TEST_USER.username,
      password: TEST_USER.password
    });

    if (!loginResponse.data.jwt) {
      throw new Error('登录失败');
    }

    const token = loginResponse.data.jwt;
    const userId = loginResponse.data.user.id;
    console.log(`✅ 登录成功，用户ID: ${userId}\n`);

    // 设置请求头
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. 获取用户的投资订单
    console.log('2️⃣ 获取用户投资订单...');
    const investmentsResponse = await axios.get(`${BASE_URL}/api/dinggou-jihuas/my-investments`, { headers });
    
    if (!investmentsResponse.data.success) {
      throw new Error('获取投资订单失败');
    }

    const investments = investmentsResponse.data.data.results || [];
    console.log(`📊 找到 ${investments.length} 个投资订单`);

    // 查找可以赎回的订单
    const redeemableOrders = investments.filter(order => 
      order.status === 'redeemable' || 
      (order.status === 'running' && new Date(order.end_at) <= new Date())
    );

    if (redeemableOrders.length === 0) {
      console.log('❌ 没有找到可以赎回的订单');
      return;
    }

    const targetOrder = redeemableOrders[0];
    console.log(`🎯 选择订单进行赎回: ID=${targetOrder.id}, 状态=${targetOrder.status}, 金额=${targetOrder.amount}\n`);

    // 3. 获取赎回前的抽奖机会
    console.log('3️⃣ 获取赎回前的抽奖机会...');
    const beforeChancesResponse = await axios.get(`${BASE_URL}/api/choujiang-jihuis/my-chances`, { headers });
    
    if (!beforeChancesResponse.data.success) {
      throw new Error('获取抽奖机会失败');
    }

    const beforeChances = beforeChancesResponse.data.data.chances || [];
    const beforeTotalCount = beforeChancesResponse.data.data.totalAvailableCount || 0;
    console.log(`📊 赎回前抽奖机会: ${beforeTotalCount} 次 (${beforeChances.length} 个记录)\n`);

    // 4. 执行赎回
    console.log('4️⃣ 执行赎回操作...');
    const redeemResponse = await axios.post(`${BASE_URL}/api/dinggou-jihuas/${targetOrder.id}/redeem`, {}, { headers });
    
    if (!redeemResponse.data.success) {
      throw new Error(`赎回失败: ${redeemResponse.data.message}`);
    }

    const redeemData = redeemResponse.data.data;
    console.log(`✅ 赎回成功!`);
    console.log(`   - 订单ID: ${redeemData.orderId}`);
    console.log(`   - 投资金额: ${redeemData.investmentAmount} USDT`);
    console.log(`   - 静态收益: ${redeemData.staticYield} USDT`);
    console.log(`   - 总收益: ${redeemData.totalPayout} USDT`);
    console.log(`   - AI代币奖励: ${redeemData.aiTokenReward} AI`);
    console.log(`   - 抽奖机会: ${redeemData.lotteryChances} 次`);
    console.log(`   - 邀请奖励: ${redeemData.invitationReward} USDT\n`);

    // 5. 等待一秒后获取赎回后的抽奖机会
    console.log('5️⃣ 等待1秒后获取赎回后的抽奖机会...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const afterChancesResponse = await axios.get(`${BASE_URL}/api/choujiang-jihuis/my-chances`, { headers });
    
    if (!afterChancesResponse.data.success) {
      throw new Error('获取赎回后抽奖机会失败');
    }

    const afterChances = afterChancesResponse.data.data.chances || [];
    const afterTotalCount = afterChancesResponse.data.data.totalAvailableCount || 0;
    console.log(`📊 赎回后抽奖机会: ${afterTotalCount} 次 (${afterChances.length} 个记录)\n`);

    // 6. 分析结果
    console.log('6️⃣ 分析结果...');
    const chanceIncrease = afterTotalCount - beforeTotalCount;
    
    if (chanceIncrease > 0) {
      console.log(`✅ 抽奖机会增加成功!`);
      console.log(`   - 增加次数: ${chanceIncrease}`);
      console.log(`   - 预期增加: ${redeemData.lotteryChances}`);
      
      if (chanceIncrease === redeemData.lotteryChances) {
        console.log(`   - ✅ 增加次数与预期一致`);
      } else {
        console.log(`   - ⚠️ 增加次数与预期不一致`);
      }
    } else {
      console.log(`❌ 抽奖机会没有增加!`);
      console.log(`   - 预期增加: ${redeemData.lotteryChances}`);
    }

    // 7. 检查新创建的抽奖机会记录
    console.log('\n7️⃣ 检查新创建的抽奖机会记录...');
    const newChances = afterChances.filter(chance => 
      chance.type === 'investment_redeem' && 
      chance.sourceOrder === targetOrder.id
    );

    if (newChances.length > 0) {
      console.log(`✅ 找到 ${newChances.length} 个投资赎回相关的抽奖机会记录:`);
      newChances.forEach((chance, index) => {
        console.log(`   ${index + 1}. ID: ${chance.id}`);
        console.log(`      总次数: ${chance.count}`);
        console.log(`      已用次数: ${chance.usedCount || 0}`);
        console.log(`      剩余次数: ${chance.count - (chance.usedCount || 0)}`);
        console.log(`      原因: ${chance.reason}`);
        console.log(`      来源订单: ${chance.sourceOrder}`);
        console.log(`      创建时间: ${chance.createdAt}`);
      });
    } else {
      console.log(`❌ 没有找到投资赎回相关的抽奖机会记录`);
    }

    console.log('\n🎉 测试完成!');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
  }
}

// 运行测试
testRedeemLottery();