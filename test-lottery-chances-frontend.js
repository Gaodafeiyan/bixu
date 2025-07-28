const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 测试前端API调用
async function testFrontendAPI() {
  console.log('=== 测试前端API调用 ===');
  
  try {
    // 1. 获取管理员token
    const adminResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: 'admin@example.com',
      password: 'admin123'
    });
    
    const adminToken = adminResponse.data.jwt;
    console.log('✅ 获取管理员token成功');
    
    // 2. 获取用户列表
    const usersResponse = await axios.get(`${BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log(`找到 ${usersResponse.data.length} 个用户`);
    
    // 3. 为每个用户测试抽奖机会API
    for (const user of usersResponse.data) {
      console.log(`\n--- 测试用户 ${user.username} (ID: ${user.id}) ---`);
      
      // 模拟前端API调用
      const chancesResponse = await axios.get(`${BASE_URL}/api/choujiang-jihuis`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        params: {
          'filters[user][id]': user.id,
          'populate': ['jiangpin', 'user']
        }
      });
      
      const chances = chancesResponse.data.data;
      console.log(`用户 ${user.username} 的抽奖机会: ${chances.length} 个`);
      
      let totalRemaining = 0;
      for (const chance of chances) {
        const remaining = chance.count - (chance.usedCount || 0);
        totalRemaining += remaining;
        console.log(`  - 机会ID: ${chance.id}, 总次数: ${chance.count}, 已用: ${chance.usedCount || 0}, 剩余: ${remaining}`);
      }
      
      console.log(`用户 ${user.username} 总剩余抽奖次数: ${totalRemaining}`);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 检查特定用户的抽奖机会
async function checkSpecificUser(userId) {
  console.log(`\n=== 检查用户 ${userId} 的抽奖机会 ===`);
  
  try {
    // 获取管理员token
    const adminResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: 'admin@example.com',
      password: 'admin123'
    });
    
    const adminToken = adminResponse.data.jwt;
    
    // 直接查询数据库
    const chancesResponse = await axios.get(`${BASE_URL}/api/choujiang-jihuis`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      params: {
        'filters[user][id]': userId,
        'populate': ['jiangpin', 'user']
      }
    });
    
    const chances = chancesResponse.data.data;
    console.log(`用户 ${userId} 的抽奖机会: ${chances.length} 个`);
    
    if (chances.length > 0) {
      let totalRemaining = 0;
      for (const chance of chances) {
        const remaining = chance.count - (chance.usedCount || 0);
        totalRemaining += remaining;
        console.log(`  - 机会ID: ${chance.id}`);
        console.log(`    总次数: ${chance.count}`);
        console.log(`    已用次数: ${chance.usedCount || 0}`);
        console.log(`    剩余次数: ${remaining}`);
        console.log(`    类型: ${chance.type}`);
        console.log(`    原因: ${chance.reason}`);
        console.log(`    是否激活: ${chance.isActive}`);
        console.log(`    有效期: ${chance.validUntil || '无限制'}`);
        console.log('    ---');
      }
      
      console.log(`\n用户 ${userId} 总剩余抽奖次数: ${totalRemaining}`);
    } else {
      console.log(`用户 ${userId} 没有抽奖机会`);
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.response?.data || error.message);
  }
}

// 主函数
async function main() {
  console.log('🎰 抽奖机会前端测试工具\n');
  
  // 测试前端API调用
  await testFrontendAPI();
  
  // 检查特定用户（从日志中看到的用户32）
  await checkSpecificUser(32);
  
  console.log('\n🎉 测试完成！');
}

// 运行脚本
main().catch(console.error); 