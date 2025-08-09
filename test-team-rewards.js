const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 管理员token（需要替换为实际的token）
const ADMIN_TOKEN = 'your-admin-token-here';

// 测试数据
const testRewards = [
  {
    shouyiUSDT: '30.00',
    tuijianRen: 1, // 邀请人ID
    laiyuanRen: 2, // 被邀请人ID
    laiyuanDan: 1, // 订单ID
    calculation: '500U投资 × 6% × 100% = 30 USDT',
    parentTier: 'PLAN 500',
    childPrincipal: '500',
    commissionablePrincipal: '500',
    rewardLevel: 1,
    rewardType: 'referral'
  },
  {
    shouyiUSDT: '96.00',
    tuijianRen: 1, // 邀请人ID
    laiyuanRen: 3, // 被邀请人ID
    laiyuanDan: 2, // 订单ID
    calculation: '1500U投资 × 8% × 80% = 96 USDT',
    parentTier: 'PLAN 2K',
    childPrincipal: '1500',
    commissionablePrincipal: '1500',
    rewardLevel: 1,
    rewardType: 'referral'
  },
  {
    shouyiUSDT: '210.00',
    tuijianRen: 1, // 邀请人ID
    laiyuanRen: 4, // 被邀请人ID
    laiyuanDan: 3, // 订单ID
    calculation: '3000U投资 × 10% × 70% = 210 USDT',
    parentTier: 'PLAN 5K',
    childPrincipal: '3000',
    commissionablePrincipal: '3000',
    rewardLevel: 1,
    rewardType: 'referral'
  }
];

// 创建邀请奖励记录
async function createInvitationRewards() {
  console.log('开始创建测试邀请奖励记录...');
  
  for (let i = 0; i < testRewards.length; i++) {
    const reward = testRewards[i];
    
    try {
      const response = await axios.post(`${BASE_URL}/api/yaoqing-jianglis`, {
        data: reward
      }, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        console.log(`✅ 邀请奖励记录 ${i + 1} 创建成功:`, {
          id: response.data.data.id,
          amount: reward.shouyiUSDT,
          calculation: reward.calculation
        });
      } else {
        console.log(`❌ 邀请奖励记录 ${i + 1} 创建失败:`, response.data.message);
      }
    } catch (error) {
      console.error(`❌ 邀请奖励记录 ${i + 1} 创建失败:`, error.response?.data?.error?.message || error.message);
    }
  }
}

// 测试团队订单API
async function testTeamOrdersAPI() {
  console.log('\n开始测试团队订单API...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/team-orders`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        page: 1,
        pageSize: 20
      }
    });
    
    if (response.data.success) {
      const data = response.data.data;
      console.log('✅ 团队订单API测试成功:');
      console.log(`  总订单数: ${data.totalOrders}`);
      console.log(`  进行中订单: ${data.runningOrders}`);
      console.log(`  已完成订单: ${data.finishedOrders}`);
      console.log(`  总奖励: ${data.totalRewards} USDT`);
      console.log(`  待分配奖励: ${data.pendingRewards} USDT`);
      console.log(`  订单列表数量: ${data.orders.length}`);
    } else {
      console.log('❌ 团队订单API测试失败:', response.data.message);
    }
  } catch (error) {
    console.error('❌ 团队订单API测试失败:', error.response?.data?.error?.message || error.message);
  }
}

// 主函数
async function main() {
  console.log('🚀 开始测试团队订单管理功能...\n');
  
  // 1. 创建测试邀请奖励记录
  await createInvitationRewards();
  
  // 2. 测试团队订单API
  await testTeamOrdersAPI();
  
  console.log('\n🎉 测试完成！');
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createInvitationRewards,
  testTeamOrdersAPI
};
