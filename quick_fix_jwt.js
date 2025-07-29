const fs = require('fs');
const path = require('path');

console.log('=== 快速修复JWT问题 ===');

// 1. 检查当前环境变量
console.log('\n1. 当前环境变量状态:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '已设置' : '未设置');

// 2. 读取.env文件
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('\n2. 读取.env文件...');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const jwtSecretLine = envContent.split('\n').find(line => line.startsWith('JWT_SECRET='));
  
  if (jwtSecretLine) {
    const jwtSecret = jwtSecretLine.split('=')[1];
    console.log('✅ 从.env文件找到JWT_SECRET');
    
    // 3. 设置环境变量
    process.env.JWT_SECRET = jwtSecret;
    console.log('✅ 已设置JWT_SECRET环境变量');
    
    // 4. 验证设置
    console.log('\n3. 验证环境变量:');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? '已设置' : '未设置');
    
    // 5. 测试JWT配置
    console.log('\n4. 测试JWT配置...');
    try {
      const jwt = require('jsonwebtoken');
      const testPayload = { test: 'data' };
      const token = jwt.sign(testPayload, process.env.JWT_SECRET);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ JWT配置测试成功');
    } catch (error) {
      console.log('❌ JWT配置测试失败:', error.message);
    }
    
  } else {
    console.log('❌ .env文件中未找到JWT_SECRET');
  }
} else {
  console.log('❌ .env文件不存在');
}

console.log('\n=== 修复完成 ===');
console.log('现在可以重启Strapi服务器了');