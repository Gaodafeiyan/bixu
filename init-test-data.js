const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 创建认购计划
async function createSubscriptionPlans() {
  console.log('创建认购计划...');
  
  const plans = [
    {
      name: '500U认购计划',
      jihuaCode: 'PLAN_500U',
      description: '500U投资，15天周期，6%静态收益，3%AI代币奖励，3次抽奖',
      benjinUSDT: '500',
      jingtaiBili: '0.06', // 6% 固定收益
      aiBili: '0.03', // 3% AI代币奖励
      zhouQiTian: 15,
      max_slots: 100,
      current_slots: 0,
      kaiqi: true,
      lottery_chances: 3
    },
    {
      name: '1000U认购计划',
      jihuaCode: 'PLAN_1000U',
      description: '1000U投资，20天周期，7%静态收益，4%AI代币奖励，3次抽奖',
      benjinUSDT: '1000',
      jingtaiBili: '0.07', // 7% 固定收益
      aiBili: '0.04', // 4% AI代币奖励
      zhouQiTian: 20,
      max_slots: 100,
      current_slots: 0,
      kaiqi: true,
      lottery_chances: 3
    },
    {
      name: '2000U认购计划',
      jihuaCode: 'PLAN_2000U',
      description: '2000U投资，25天周期，8%静态收益，5%AI代币奖励，3次抽奖',
      benjinUSDT: '2000',
      jingtaiBili: '0.08', // 8% 固定收益
      aiBili: '0.05', // 5% AI代币奖励
      zhouQiTian: 25,
      max_slots: 100,
      current_slots: 0,
      kaiqi: true,
      lottery_chances: 3
    },
    {
      name: '5000U认购计划',
      jihuaCode: 'PLAN_5000U',
      description: '5000U投资，30天周期，10%静态收益，6%AI代币奖励，3次抽奖',
      benjinUSDT: '5000',
      jingtaiBili: '0.10', // 10% 固定收益
      aiBili: '0.06', // 6% AI代币奖励
      zhouQiTian: 30,
      max_slots: 100,
      current_slots: 0,
      kaiqi: true,
      lottery_chances: 3
    }
  ];

  for (const plan of plans) {
    try {
      const response = await axios.post(`${BASE_URL}/api/dinggou-jihuas`, {
        data: plan
      });
      console.log(`✅ 创建计划成功: ${plan.name}, ID: ${response.data.data.id}`);
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.error.message.includes('唯一')) {
        console.log(`⚠️ 计划已存在: ${plan.name}`);
      } else {
        console.error(`❌ 创建计划失败: ${plan.name}`, error.response?.data || error.message);
      }
    }
  }
}

// 主函数
async function main() {
  try {
    console.log('开始初始化测试数据...');
    
    // 创建认购计划
    await createSubscriptionPlans();
    
    console.log('✅ 测试数据初始化完成');
  } catch (error) {
    console.error('❌ 初始化失败:', error);
  }
}

main(); 