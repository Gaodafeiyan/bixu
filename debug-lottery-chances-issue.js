const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 测试用户信息
const TEST_USER = {
  identifier: 'testuser30',
  password: '123456'
};

let authToken = null;

async function login() {
  try {
    console.log('🔐 开始登录...');
    const response = await axios.post(`${BASE_URL}/api/auth/local`, TEST_USER);
    
    if (response.data.jwt) {
      authToken = response.data.jwt;
      console.log('✅ 登录成功，用户ID:', response.data.user.id);
      return response.data.user.id;
    } else {
      throw new Error('登录失败：没有获取到JWT token');
    }
  } catch (error) {
    console.error('❌ 登录失败:', error.response?.data || error.message);
    throw error;
  }
}

async function getLotteryChances() {
  try {
    console.log('🎰 获取抽奖机会...');
    const response = await axios.get(`${BASE_URL}/api/choujiang-jihuis/my-chances`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('📊 抽奖机会API响应:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      const chances = response.data.data.chances;
      const totalAvailable = response.data.data.totalAvailableCount;
      
      console.log(`🎯 总共有 ${chances.length} 个抽奖机会记录`);
      console.log(`🎯 总可用次数: ${totalAvailable}`);
      
      chances.forEach((chance, index) => {
        console.log(`  机会 ${index + 1}: ID=${chance.id}, 总次数=${chance.count}, 已用=${chance.usedCount}, 剩余=${chance.availableCount}, 类型=${chance.type}, 原因=${chance.reason}`);
      });
      
      return { chances, totalAvailable };
    } else {
      throw new Error('获取抽奖机会失败');
    }
  } catch (error) {
    console.error('❌ 获取抽奖机会失败:', error.response?.data || error.message);
    throw error;
  }
}

async function getMyInvestments() {
  try {
    console.log('💰 获取我的投资...');
    const response = await axios.get(`${BASE_URL}/api/dinggou-jihuas/my-investments`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('📊 投资API响应:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      const investments = response.data.data.data.results;
      console.log(`💰 总共有 ${investments.length} 个投资记录`);
      
      investments.forEach((investment, index) => {
        console.log(`  投资 ${index + 1}: ID=${investment.id}, 状态=${investment.status}, 金额=${investment.amount}, 开始时间=${investment.start_at}, 结束时间=${investment.end_at}`);
      });
      
      return investments;
    } else {
      throw new Error('获取投资失败');
    }
  } catch (error) {
    console.error('❌ 获取投资失败:', error.response?.data || error.message);
    throw error;
  }
}

async function testRedeemInvestment(orderId) {
  try {
    console.log(`🔄 测试赎回投资: 订单ID ${orderId}`);
    const response = await axios.post(`${BASE_URL}/api/dinggou-jihuas/${orderId}/redeem`, {}, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('📊 赎回API响应:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('✅ 赎回成功！');
      console.log(`  投资金额: ${response.data.data.investmentAmount} USDT`);
      console.log(`  静态收益: ${response.data.data.staticYield} USDT`);
      console.log(`  总收益: ${response.data.data.totalPayout} USDT`);
      console.log(`  抽奖次数: ${response.data.data.lotteryChances} 次`);
      console.log(`  AI代币奖励: ${response.data.data.aiTokenReward} AI`);
      console.log(`  邀请奖励: ${response.data.data.invitationReward} USDT`);
      
      return response.data.data;
    } else {
      throw new Error('赎回失败');
    }
  } catch (error) {
    console.error('❌ 赎回失败:', error.response?.data || error.message);
    throw error;
  }
}

async function checkDatabaseChances() {
  try {
    console.log('🔍 直接查询数据库中的抽奖机会...');
    const response = await axios.get(`${BASE_URL}/api/choujiang-jihuis`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      params: {
        'filters[user][id]': 'me',
        'populate': ['user', 'jiangpin']
      }
    });
    
    console.log('📊 数据库查询响应:', JSON.stringify(response.data, null, 2));
    
    if (response.data.results) {
      const chances = response.data.results;
      console.log(`🎯 数据库中总共有 ${chances.length} 个抽奖机会记录`);
      
      chances.forEach((chance, index) => {
        console.log(`  记录 ${index + 1}: ID=${chance.id}, 总次数=${chance.count}, 已用=${chance.usedCount}, 剩余=${chance.count - (chance.usedCount || 0)}, 类型=${chance.type}, 原因=${chance.reason}`);
      });
      
      return chances;
    } else {
      throw new Error('数据库查询失败');
    }
  } catch (error) {
    console.error('❌ 数据库查询失败:', error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 开始调试抽奖机会问题...\n');
    
    // 1. 登录
    const userId = await login();
    console.log('');
    
    // 2. 获取当前抽奖机会
    console.log('=== 步骤1: 获取当前抽奖机会 ===');
    const beforeChances = await getLotteryChances();
    console.log('');
    
    // 3. 获取投资记录
    console.log('=== 步骤2: 获取投资记录 ===');
    const investments = await getMyInvestments();
    console.log('');
    
    // 4. 查找可赎回的投资
    const redeemableInvestments = investments.filter(inv => 
      inv.status === 'redeemable' || 
      (inv.status === 'running' && new Date(inv.end_at) <= new Date())
    );
    
    if (redeemableInvestments.length === 0) {
      console.log('⚠️  没有找到可赎回的投资');
      console.log('当前投资状态:');
      investments.forEach(inv => {
        console.log(`  - 投资ID: ${inv.id}, 状态: ${inv.status}, 结束时间: ${inv.end_at}`);
      });
      return;
    }
    
    // 5. 测试赎回第一个可赎回的投资
    console.log('=== 步骤3: 测试赎回投资 ===');
    const testInvestment = redeemableInvestments[0];
    console.log(`选择测试投资: ID=${testInvestment.id}, 状态=${testInvestment.status}`);
    
    const redeemResult = await testRedeemInvestment(testInvestment.id);
    console.log('');
    
    // 6. 等待一下，然后再次获取抽奖机会
    console.log('=== 步骤4: 赎回后再次获取抽奖机会 ===');
    console.log('等待3秒...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const afterChances = await getLotteryChances();
    console.log('');
    
    // 7. 对比结果
    console.log('=== 步骤5: 对比结果 ===');
    console.log(`赎回前可用次数: ${beforeChances.totalAvailable}`);
    console.log(`赎回后可用次数: ${afterChances.totalAvailable}`);
    console.log(`增加次数: ${afterChances.totalAvailable - beforeChances.totalAvailable}`);
    console.log(`预期增加: ${redeemResult.lotteryChances} 次`);
    
    if (afterChances.totalAvailable - beforeChances.totalAvailable === redeemResult.lotteryChances) {
      console.log('✅ 抽奖次数增加正确！');
    } else {
      console.log('❌ 抽奖次数增加不正确！');
    }
    
    // 8. 直接查询数据库
    console.log('\n=== 步骤6: 直接查询数据库 ===');
    await checkDatabaseChances();
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
main(); 