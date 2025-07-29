const axios = require('axios');

// 配置
const BASE_URL = 'http://localhost:1337';
const ADMIN_TOKEN = 'your-admin-token'; // 需要替换为实际的admin token

async function fixLotteryChances() {
  try {
    console.log('🔧 开始修复抽奖机会赠送问题...\n');

    // 1. 检查是否有可用的抽奖奖品
    console.log('1️⃣ 检查抽奖奖品...');
    const prizesResponse = await axios.get(`${BASE_URL}/api/choujiang-jiangpins?filters[kaiQi][$eq]=true`);
    
    if (!prizesResponse.data.results || prizesResponse.data.results.length === 0) {
      console.log('❌ 没有可用的抽奖奖品，创建默认奖品...');
      
      // 创建默认的USDT奖品
      const defaultPrize = {
        data: {
          name: '默认USDT奖励',
          description: '投资赎回默认奖励',
          jiangpinType: 'usdt',
          value: 1.0,
          zhongJiangLv: 100.0,
          maxQuantity: 0, // 无限制
          currentQuantity: 0,
          kaiQi: true,
          paiXuShunXu: 1,
          category: 'default',
          rarity: 'common'
        }
      };
      
      const createPrizeResponse = await axios.post(`${BASE_URL}/api/choujiang-jiangpins`, defaultPrize, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ 创建默认奖品成功: ${createPrizeResponse.data.data.id}`);
    } else {
      console.log(`✅ 找到 ${prizesResponse.data.results.length} 个可用奖品`);
    }

    // 2. 检查认购计划的抽奖机会配置
    console.log('\n2️⃣ 检查认购计划配置...');
    const plansResponse = await axios.get(`${BASE_URL}/api/dinggou-jihuas`);
    
    if (plansResponse.data.results && plansResponse.data.results.length > 0) {
      console.log(`📊 找到 ${plansResponse.data.results.length} 个认购计划:`);
      
      for (const plan of plansResponse.data.results) {
        console.log(`   - ${plan.name}: lottery_chances = ${plan.lottery_chances || 0}`);
        
        // 如果计划没有配置抽奖机会，设置默认值
        if (!plan.lottery_chances || plan.lottery_chances === 0) {
          console.log(`   🔧 为计划 ${plan.name} 设置默认抽奖机会...`);
          
          const updateData = {
            data: {
              lottery_chances: 3 // 默认3次抽奖机会
            }
          };
          
          try {
            await axios.put(`${BASE_URL}/api/dinggou-jihuas/${plan.id}`, updateData, {
              headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
              }
            });
            console.log(`   ✅ 计划 ${plan.name} 抽奖机会设置成功`);
          } catch (error) {
            console.log(`   ❌ 计划 ${plan.name} 抽奖机会设置失败: ${error.message}`);
          }
        }
      }
    }

    // 3. 检查现有的抽奖机会记录
    console.log('\n3️⃣ 检查现有抽奖机会记录...');
    const chancesResponse = await axios.get(`${BASE_URL}/api/choujiang-jihuis?filters[type][$eq]=investment_redeem`);
    
    if (chancesResponse.data.results && chancesResponse.data.results.length > 0) {
      console.log(`📊 找到 ${chancesResponse.data.results.length} 个投资赎回相关的抽奖机会记录`);
      
      for (const chance of chancesResponse.data.results) {
        console.log(`   - ID: ${chance.id}, 用户: ${chance.user?.id}, 次数: ${chance.count}, 已用: ${chance.usedCount || 0}`);
      }
    } else {
      console.log('📊 没有找到投资赎回相关的抽奖机会记录');
    }

    // 4. 检查数据库约束
    console.log('\n4️⃣ 检查数据库约束...');
    console.log('   - 抽奖机会模型要求 jiangpin 字段必须存在');
    console.log('   - 确保有可用的奖品用于关联');

    // 5. 创建测试用户和测试订单（如果需要）
    console.log('\n5️⃣ 创建测试数据...');
    
    // 创建测试用户
    const testUser = {
      data: {
        username: 'testuser_lottery',
        email: 'test_lottery@example.com',
        password: 'password123',
        confirmed: true,
        blocked: false,
        inviteCode: 'TEST123',
        role: 1 // authenticated role
      }
    };
    
    try {
      const userResponse = await axios.post(`${BASE_URL}/api/auth/invite-register`, {
        username: testUser.data.username,
        email: testUser.data.email,
        password: testUser.data.password,
        inviteCode: 'TEST123'
      });
      
      console.log(`✅ 测试用户创建成功: ${userResponse.data.data.id}`);
    } catch (error) {
      if (error.response?.data?.message?.includes('已存在')) {
        console.log('✅ 测试用户已存在');
      } else {
        console.log(`❌ 测试用户创建失败: ${error.message}`);
      }
    }

    console.log('\n🎉 修复完成!');
    console.log('\n📋 建议的后续步骤:');
    console.log('1. 确保有可用的抽奖奖品 (kaiQi: true)');
    console.log('2. 确保认购计划配置了 lottery_chances 字段');
    console.log('3. 测试赎回功能，检查后端日志');
    console.log('4. 检查前端是否正确刷新抽奖机会数据');

  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
  }
}

// 运行修复
fixLotteryChances();