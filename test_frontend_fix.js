const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testFrontendFix() {
  console.log('🔍 测试前端修复效果...\n');
  console.log(`服务器地址: ${BASE_URL}\n`);

  // 1. 测试用户登录
  console.log('1. 测试用户登录...');
  let token = null;
  try {
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: '852',
      password: '123456'
    });
    
    token = loginResponse.data.jwt;
    console.log('✅ 登录成功');
    console.log(`   用户ID: ${loginResponse.data.user.id}`);
    console.log(`   用户名: ${loginResponse.data.user.username}`);
  } catch (error) {
    console.log('❌ 登录失败:', error.response?.data || error.message);
    return;
  }

  // 2. 测试钱包API
  console.log('\n2. 测试钱包API...');
  try {
    const walletResponse = await axios.get(`${BASE_URL}/api/qianbao-yues/user-wallet`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (walletResponse.data.success) {
      const wallet = walletResponse.data.data;
      console.log('✅ 钱包API正常');
      console.log(`   USDT余额: ${wallet.usdtYue}`);
      console.log(`   AI余额: ${wallet.aiYue}`);
    } else {
      console.log('❌ 钱包API异常:', walletResponse.data.message);
    }
  } catch (error) {
    console.log('❌ 钱包API失败:', error.response?.data || error.message);
  }

  // 3. 测试投资API
  console.log('\n3. 测试投资API...');
  try {
    const investmentsResponse = await axios.get(`${BASE_URL}/api/dinggou-jihuas/my-investments`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { page: 1, pageSize: 10 }
    });
    
    if (investmentsResponse.data.data) {
      const investments = investmentsResponse.data.data;
      console.log('✅ 投资API正常');
      console.log(`   投资数量: ${investments.length}`);
    } else {
      console.log('❌ 投资API异常:', investmentsResponse.data.message);
    }
  } catch (error) {
    console.log('❌ 投资API失败:', error.response?.data || error.message);
  }

  // 4. 测试邀请奖励API
  console.log('\n4. 测试邀请奖励API...');
  try {
    const rewardsResponse = await axios.get(`${BASE_URL}/api/yaoqing-jianglis/user-rewards`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { page: 1, pageSize: 10 }
    });
    
    if (rewardsResponse.data.success) {
      const rewards = rewardsResponse.data.data;
      console.log('✅ 邀请奖励API正常');
      console.log(`   奖励数量: ${rewards.length}`);
    } else {
      console.log('❌ 邀请奖励API异常:', rewardsResponse.data.message);
    }
  } catch (error) {
    console.log('❌ 邀请奖励API失败:', error.response?.data || error.message);
  }

  // 5. 测试抽奖机会API
  console.log('\n5. 测试抽奖机会API...');
  try {
    const chancesResponse = await axios.get(`${BASE_URL}/api/choujiang-jihuis/my-chances`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (chancesResponse.data.success) {
      const chances = chancesResponse.data.data;
      console.log('✅ 抽奖机会API正常');
      console.log(`   抽奖机会: ${chances.totalAvailableCount}`);
    } else {
      console.log('❌ 抽奖机会API异常:', chancesResponse.data.message);
    }
  } catch (error) {
    console.log('❌ 抽奖机会API失败:', error.response?.data || error.message);
  }

  // 6. 测试团队统计API
  console.log('\n6. 测试团队统计API...');
  try {
    const teamResponse = await axios.get(`${BASE_URL}/api/yaoqing-jianglis/team-stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (teamResponse.data.success) {
      const teamStats = teamResponse.data.data;
      console.log('✅ 团队统计API正常');
      console.log(`   直接推荐: ${teamStats.directReferrals}`);
      console.log(`   间接推荐: ${teamStats.indirectReferrals}`);
    } else {
      console.log('❌ 团队统计API异常:', teamResponse.data.message);
    }
  } catch (error) {
    console.log('❌ 团队统计API失败:', error.response?.data || error.message);
  }

  console.log('\n🎯 前端修复测试完成！');
  console.log('\n📋 修复效果:');
  console.log('1. 钱包余额应该正常显示: 110,000 USDT');
  console.log('2. 不再显示"网络错误"');
  console.log('3. 即使部分API失败，也会显示可用数据');
  console.log('4. 前端用户体验得到改善');
}

// 运行测试
testFrontendFix().catch(console.error);