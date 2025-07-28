const axios = require('axios');

// 配置
const BASE_URL = 'http://118.107.4.158:1337';
const TEST_USER = {
  identifier: 'testuser@example.com',
  password: 'testpassword123'
};

async function testLotteryChancesAfterRedeem() {
  try {
    console.log('=== 测试赎回后抽奖机会创建 ===');
    
    // 1. 登录获取token
    console.log('1. 登录获取token...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, TEST_USER);
    const token = loginResponse.data.jwt;
    const userId = loginResponse.data.user.id;
    
    console.log(`登录成功，用户ID: ${userId}`);
    
    // 设置请求头
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // 2. 获取用户投资记录
    console.log('2. 获取用户投资记录...');
    const investmentsResponse = await axios.get(`${BASE_URL}/api/dinggou-jihuas/my-investments`, { headers });
    const investments = investmentsResponse.data.data.data.results || [];
    
    console.log(`找到 ${investments.length} 个投资记录`);
    
    // 查找可赎回的投资
    const redeemableInvestment = investments.find(inv => 
      inv.status === 'redeemable' || 
      (inv.status === 'running' && new Date(inv.end_at) <= new Date())
    );
    
    if (!redeemableInvestment) {
      console.log('没有找到可赎回的投资记录');
      return;
    }
    
    console.log(`找到可赎回投资: ID=${redeemableInvestment.id}, 状态=${redeemableInvestment.status}`);
    
    // 3. 执行赎回
    console.log('3. 执行赎回...');
    const redeemResponse = await axios.post(
      `${BASE_URL}/api/dinggou-jihuas/${redeemableInvestment.id}/redeem`,
      {},
      { headers }
    );
    
    console.log('赎回结果:', redeemResponse.data);
    
    // 4. 等待一下让数据更新
    console.log('4. 等待数据更新...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 5. 检查抽奖机会
    console.log('5. 检查抽奖机会...');
    const chancesResponse = await axios.get(`${BASE_URL}/api/choujiang-jihuis/my-chances`, { headers });
    const chancesData = chancesResponse.data.data;
    
    console.log('抽奖机会数据:', chancesData);
    
    if (chancesData.chances && chancesData.chances.length > 0) {
      console.log('✅ 抽奖机会创建成功！');
      chancesData.chances.forEach((chance, index) => {
        console.log(`机会 ${index + 1}: ID=${chance.id}, 总次数=${chance.count}, 已用=${chance.usedCount}, 剩余=${chance.availableCount}`);
      });
    } else {
      console.log('❌ 没有找到抽奖机会');
    }
    
    // 6. 检查钱包余额
    console.log('6. 检查钱包余额...');
    const walletResponse = await axios.get(`${BASE_URL}/api/qianbao-yues/user-wallet`, { headers });
    const wallet = walletResponse.data.data.data;
    
    console.log('钱包余额:', {
      usdt: wallet.usdtYue,
      ai: wallet.aiYue
    });
    
    console.log('=== 测试完成 ===');
    
  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testLotteryChancesAfterRedeem(); 