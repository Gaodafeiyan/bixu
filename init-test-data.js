const axios = require('axios');

// 配置
const BASE_URL = 'http://localhost:1337';
const API_URL = `${BASE_URL}/api`;

// 管理员配置（需要在Strapi管理面板中创建）
const ADMIN_TOKEN = process.env.STRAPI_ADMIN_TOKEN || 'your-admin-token-here';

// 测试数据
const testPlans = [
  {
    name: '新手计划',
    max_slots: 100,
    current_slots: 0,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天后
    description: '适合新手的入门投资计划',
    jingtaiBili: 0.05, // 5% 静态收益
    aiBili: 0.02,      // 2% AI代币奖励
    zhouQiTian: 30,    // 30天周期
    kaiqi: true,
    lottery_chances: 1,
    jihuaCode: 'PLAN001'
  },
  {
    name: '进阶计划',
    max_slots: 50,
    current_slots: 0,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60天后
    description: '中等风险收益的投资计划',
    jingtaiBili: 0.08, // 8% 静态收益
    aiBili: 0.03,      // 3% AI代币奖励
    zhouQiTian: 60,    // 60天周期
    kaiqi: true,
    lottery_chances: 2,
    jihuaCode: 'PLAN002'
  },
  {
    name: '高级计划',
    max_slots: 20,
    current_slots: 0,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90天后
    description: '高收益高风险的投资计划',
    jingtaiBili: 0.12, // 12% 静态收益
    aiBili: 0.05,      // 5% AI代币奖励
    zhouQiTian: 90,    // 90天周期
    kaiqi: true,
    lottery_chances: 3,
    jihuaCode: 'PLAN003'
  }
];

// 工具函数
const log = (message, data = null) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

const makeAdminRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    log(`管理员请求失败: ${endpoint}`, {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    throw error;
  }
};

// 初始化函数
async function initializeTestData() {
  log('🚀 开始初始化测试数据');
  
  try {
    // 1. 创建认购计划
    log('=== 创建认购计划 ===');
    const createdPlans = [];
    
    for (const plan of testPlans) {
      try {
        const result = await makeAdminRequest('POST', '/dinggou-jihuas', {
          data: plan
        });
        
        createdPlans.push(result.data);
        log(`✅ 计划 "${plan.name}" 创建成功`, {
          id: result.data.id,
          name: result.data.attributes.name
        });
        
      } catch (error) {
        log(`❌ 计划 "${plan.name}" 创建失败`, error.response?.data);
      }
    }
    
    // 2. 创建测试用户（通过API）
    log('=== 创建测试用户 ===');
    const testUsers = [
      {
        username: 'admin_test',
        email: 'admin@test.com',
        password: 'Admin123456',
        inviteCode: 'ADMIN001'
      },
      {
        username: 'user_test1',
        email: 'user1@test.com',
        password: 'User123456',
        inviteCode: 'USER001'
      },
      {
        username: 'user_test2',
        email: 'user2@test.com',
        password: 'User123456',
        inviteCode: 'USER002'
      }
    ];
    
    for (const user of testUsers) {
      try {
        const result = await makeAdminRequest('POST', '/auth/invite-register', user);
        log(`✅ 用户 "${user.username}" 创建成功`, {
          id: result.user.id,
          inviteCode: result.user.inviteCode
        });
        
      } catch (error) {
        log(`❌ 用户 "${user.username}" 创建失败`, error.response?.data);
      }
    }
    
    // 3. 验证数据创建
    log('=== 验证数据创建 ===');
    
    // 验证计划
    const plans = await makeAdminRequest('GET', '/dinggou-jihuas');
    log(`✅ 当前共有 ${plans.data.length} 个认购计划`);
    
    // 验证用户
    const users = await makeAdminRequest('GET', '/users');
    log(`✅ 当前共有 ${users.length} 个用户`);
    
    log('🎉 测试数据初始化完成');
    log('📋 可用的测试邀请码:', testUsers.map(u => u.inviteCode));
    
  } catch (error) {
    log('❌ 初始化过程中发生错误', error);
  }
}

// 清理测试数据
async function cleanupTestData() {
  log('🧹 开始清理测试数据');
  
  try {
    // 1. 删除所有认购计划
    const plans = await makeAdminRequest('GET', '/dinggou-jihuas');
    for (const plan of plans.data) {
      try {
        await makeAdminRequest('DELETE', `/dinggou-jihuas/${plan.id}`);
        log(`✅ 删除计划 "${plan.attributes.name}"`);
      } catch (error) {
        log(`❌ 删除计划失败`, error.response?.data);
      }
    }
    
    // 2. 删除测试用户（除了管理员）
    const users = await makeAdminRequest('GET', '/users');
    for (const user of users) {
      if (user.username.startsWith('test') || user.username.includes('test')) {
        try {
          await makeAdminRequest('DELETE', `/users/${user.id}`);
          log(`✅ 删除测试用户 "${user.username}"`);
        } catch (error) {
          log(`❌ 删除用户失败`, error.response?.data);
        }
      }
    }
    
    log('🎉 测试数据清理完成');
    
  } catch (error) {
    log('❌ 清理过程中发生错误', error);
  }
}

// 显示帮助信息
function showHelp() {
  console.log(`
使用方法:
  node init-test-data.js [command]

命令:
  init    初始化测试数据
  clean   清理测试数据
  help    显示帮助信息

环境变量:
  STRAPI_ADMIN_TOKEN   Strapi管理员令牌

示例:
  STRAPI_ADMIN_TOKEN=your-token node init-test-data.js init
  node init-test-data.js clean
  `);
}

// 主函数
async function main() {
  const command = process.argv[2] || 'help';
  
  switch (command) {
    case 'init':
      await initializeTestData();
      break;
    case 'clean':
      await cleanupTestData();
      break;
    case 'help':
    default:
      showHelp();
      break;
  }
}

// 运行
if (require.main === module) {
  main();
}

module.exports = { initializeTestData, cleanupTestData }; 