const axios = require('axios');

// 配置
const BASE_URL = 'http://localhost:1337';
const TEST_USER = {
  username: '456',
  password: 'password123' // 请替换为实际密码
};

async function testLotteryRedeem() {
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
    const investmentsResponse = await axios.get(`${BASE_URL}/api/dinggou-jihuas/my-investments?page=1&pageSize=10`, { headers });
    
    if (!investmentsResponse.data.success) {
      throw new Error('获取投资订单失败');
    }

    const investments = investmentsResponse.data.data.results || [];
    console.log(`📊 找到 ${investments.length} 个投资订单`);

    // 找到可以赎回的订单（running状态且已到期）
    const now = new Date();
    const redeemableOrders = investments.filter(order => {
      const isExpired = order.end_at && new Date(order.end_at) <= now;
      return order.status === 'running' && isExpired;
    });

    if (redeemableOrders.length === 0) {
      console.log('❌ 没有可赎回的订单');
      return;
    }

    const testOrder = redeemableOrders[0];
    console.log(`🎯 选择测试订单: ID=${testOrder.id}, 金额=${testOrder.amount}, 状态=${testOrder.status}, 到期时间=${testOrder.end_at}\n`);

    // 3. 获取赎回前的抽奖机会
    console.log('3️⃣ 获取赎回前的抽奖机会...');
    const beforeChancesResponse = await axios.get(`${BASE_URL}/api/choujiang-jihuis/my-chances`, { headers });
    const beforeChances = beforeChancesResponse.data.data?.chances || [];
    console.log(`📊 赎回前抽奖机会: ${beforeChances.length} 个`);
    beforeChances.forEach((chance, index) => {
      console.log(`   ${index + 1}. ID: ${chance.id}, 总次数: ${chance.count}, 已用: ${chance.usedCount}, 剩余: ${chance.remainingCount}`);
    });

    // 4. 执行赎回
    console.log('\n4️⃣ 执行赎回...');
    const redeemResponse = await axios.post(`${BASE_URL}/api/dinggou-jihuas/${testOrder.id}/redeem`, {}, { headers });
    
    if (!redeemResponse.data.success) {
      throw new Error(`赎回失败: ${redeemResponse.data.message}`);
    }

    const redeemData = redeemResponse.data.data;
    console.log(`✅ 赎回成功!`);
    console.log(`   - 投资金额: ${redeemData.investmentAmount} USDT`);
    console.log(`   - 静态收益: ${redeemData.staticYield} USDT`);
    console.log(`   - 总收益: ${redeemData.totalPayout} USDT`);
    console.log(`   - 抽奖机会: ${redeemData.lotteryChances} 次`);
    console.log(`   - 邀请奖励: ${redeemData.invitationReward} USDT`);

    // 5. 等待一秒后获取赎回后的抽奖机会
    console.log('\n5️⃣ 等待1秒后获取赎回后的抽奖机会...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const afterChancesResponse = await axios.get(`${BASE_URL}/api/choujiang-jihuis/my-chances`, { headers });
    const afterChances = afterChancesResponse.data.data?.chances || [];
    console.log(`📊 赎回后抽奖机会: ${afterChances.length} 个`);
    afterChances.forEach((chance, index) => {
      console.log(`   ${index + 1}. ID: ${chance.id}, 总次数: ${chance.count}, 已用: ${chance.usedCount}, 剩余: ${chance.remainingCount}, 原因: ${chance.reason}`);
    });

    // 6. 分析结果
    console.log('\n6️⃣ 分析结果...');
    const newChances = afterChances.length - beforeChances.length;
    if (newChances > 0) {
      console.log(`✅ 测试成功! 新增了 ${newChances} 个抽奖机会`);
    } else {
      console.log(`❌ 测试失败! 没有新增抽奖机会`);
      console.log(`   预期: ${redeemData.lotteryChances} 次`);
      console.log(`   实际: 0 次`);
    }

    // 7. 检查钱包余额
    console.log('\n7️⃣ 检查钱包余额...');
    const walletResponse = await axios.get(`${BASE_URL}/api/qianbao-yues/user-wallet`, { headers });
    const wallet = walletResponse.data.data;
    console.log(`💰 钱包余额: ${wallet.usdtYue} USDT, AI余额: ${wallet.aiYue} AI`);

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
  }
}

// 运行测试
testLotteryRedeem();