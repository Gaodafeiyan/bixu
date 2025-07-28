const axios = require('axios');

// 调试用户档位识别问题
async function debugUserTier() {
  try {
    console.log('=== 调试用户档位识别问题 ===');
    
    // 1. 模拟登录获取token
    const loginResponse = await axios.post('http://localhost:1337/api/auth/local', {
      identifier: '741@qq.com',
      password: '741'
    });
    
    const token = loginResponse.data.jwt;
    const userId = loginResponse.data.user.id;
    
    console.log(`用户登录成功: ${loginResponse.data.user.username}, ID: ${userId}`);
    
    // 2. 获取用户所有订单
    console.log('\n=== 获取用户所有订单 ===');
    const ordersResponse = await axios.get('http://localhost:1337/api/dinggou-dingdans', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        'filters[user][id]': userId,
        populate: 'jihua'
      }
    });
    
    const orders = ordersResponse.data.data;
    console.log(`用户订单数量: ${orders.length}`);
    
    if (orders.length > 0) {
      console.log('\n订单详情:');
      orders.forEach((order, index) => {
        console.log(`${index + 1}. 订单ID: ${order.id}`);
        console.log(`   状态: ${order.status}`);
        console.log(`   金额: ${order.amount} USDT`);
        console.log(`   本金: ${order.principal} USDT`);
        console.log(`   开始时间: ${new Date(order.start_at).toLocaleString()}`);
        console.log(`   结束时间: ${new Date(order.end_at).toLocaleString()}`);
        console.log(`   计划: ${order.jihua?.name || '未知'}`);
        console.log('');
      });
    }
    
    // 3. 检查运行中的订单
    console.log('=== 检查运行中的订单 ===');
    const runningOrders = orders.filter(order => order.status === 'running');
    console.log(`运行中的订单数量: ${runningOrders.length}`);
    
    if (runningOrders.length > 0) {
      console.log('\n运行中的订单:');
      runningOrders.forEach((order, index) => {
        console.log(`${index + 1}. 订单ID: ${order.id}`);
        console.log(`   金额: ${order.amount} USDT`);
        console.log(`   本金: ${order.principal} USDT`);
        
        // 检查是否匹配档位
        const amount = parseFloat(order.amount || order.principal);
        const tiers = [500, 1000, 2000, 5000];
        const matchedTier = tiers.find(tier => tier === amount);
        
        if (matchedTier) {
          console.log(`   ✅ 匹配档位: PLAN ${matchedTier}`);
        } else {
          console.log(`   ❌ 不匹配任何档位 (金额: ${amount})`);
        }
        console.log('');
      });
    }
    
    // 4. 测试档位识别逻辑
    console.log('=== 测试档位识别逻辑 ===');
    const REWARD_TIERS = [
      { name: 'PLAN 500', principal: 500 },
      { name: 'PLAN 1K', principal: 1000 },
      { name: 'PLAN 2K', principal: 2000 },
      { name: 'PLAN 5K', principal: 5000 }
    ];
    
    let maxTier = null;
    let maxPrincipal = 0;
    
    for (const order of runningOrders) {
      const orderPrincipal = parseFloat(order.principal || order.amount);
      console.log(`检查订单 ${order.id}: 金额 ${orderPrincipal}`);
      
      const tier = REWARD_TIERS.find(t => t.principal === orderPrincipal);
      if (tier && orderPrincipal > maxPrincipal) {
        maxTier = tier;
        maxPrincipal = orderPrincipal;
        console.log(`   ✅ 找到更高档位: ${tier.name}`);
      }
    }
    
    if (maxTier) {
      console.log(`\n✅ 识别到的最高档位: ${maxTier.name}`);
    } else {
      console.log('\n❌ 未识别到任何有效档位');
    }
    
    // 5. 直接调用团队统计API
    console.log('\n=== 调用团队统计API ===');
    const teamStatsResponse = await axios.get('http://localhost:1337/api/yaoqing-jianglis/team-stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const teamStats = teamStatsResponse.data.data;
    console.log('团队统计API返回的档位信息:');
    console.log(JSON.stringify(teamStats.currentTier, null, 2));
    
  } catch (error) {
    console.error('❌ 调试失败:', error.response?.data || error.message);
  }
}

// 运行调试
debugUserTier(); 