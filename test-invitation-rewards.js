const axios = require('axios');

// 测试邀请有礼功能
async function testInvitationRewards() {
  try {
    console.log('=== 测试邀请有礼功能 ===');
    
    // 1. 模拟登录获取token
    const loginResponse = await axios.post('http://localhost:1337/api/auth/local', {
      identifier: '741@qq.com',
      password: '741'
    });
    
    const token = loginResponse.data.jwt;
    const userId = loginResponse.data.user.id;
    
    console.log(`用户登录成功: ${loginResponse.data.user.username}, ID: ${userId}`);
    console.log(`用户邀请码: ${loginResponse.data.user.inviteCode}`);
    
    // 2. 获取团队统计
    console.log('\n=== 获取团队统计 ===');
    const teamStatsResponse = await axios.get('http://localhost:1337/api/yaoqing-jianglis/team-stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('团队统计API响应:');
    console.log(JSON.stringify(teamStatsResponse.data, null, 2));
    
    // 3. 获取用户邀请奖励
    console.log('\n=== 获取用户邀请奖励 ===');
    const userRewardsResponse = await axios.get('http://localhost:1337/api/yaoqing-jianglis/user-rewards', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        page: 1,
        pageSize: 10
      }
    });
    
    console.log('用户邀请奖励API响应:');
    console.log(JSON.stringify(userRewardsResponse.data, null, 2));
    
    // 4. 验证数据格式
    console.log('\n=== 验证数据格式 ===');
    
    const teamStats = teamStatsResponse.data.data;
    console.log('团队统计数据:');
    console.log(`- 直接推荐: ${teamStats.directReferrals}`);
    console.log(`- 间接推荐: ${teamStats.indirectReferrals}`);
    console.log(`- 总推荐: ${teamStats.totalReferrals}`);
    console.log(`- 总收益: ${teamStats.totalEarnings} USDT`);
    
    if (teamStats.currentTier) {
      console.log('当前档位:');
      console.log(`- 档位名称: ${teamStats.currentTier.name}`);
      console.log(`- 静态收益率: ${(teamStats.currentTier.staticRate * 100).toFixed(0)}%`);
      console.log(`- 返佣系数: ${(teamStats.currentTier.referralRate * 100).toFixed(0)}%`);
      console.log(`- 可计佣上限: ${teamStats.currentTier.maxCommission} USDT`);
    }
    
    const userRewards = userRewardsResponse.data.data.rewards;
    console.log(`\n邀请奖励记录数量: ${userRewards.length}`);
    
    if (userRewards.length > 0) {
      console.log('最近的奖励记录:');
      userRewards.slice(0, 3).forEach((reward, index) => {
        console.log(`${index + 1}. 奖励金额: ${reward.shouyiUSDT} USDT`);
        console.log(`   来源用户: ${reward.laiyuanRen?.username || reward.laiyuanRen}`);
        console.log(`   档位: ${reward.parentTier || '未知'}`);
        console.log(`   计算方式: ${reward.calculation || '未知'}`);
        console.log(`   时间: ${new Date(reward.createdAt).toLocaleString()}`);
        console.log('');
      });
    }
    
    console.log('✅ 邀请有礼功能测试完成');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testInvitationRewards(); 