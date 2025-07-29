const fs = require('fs');
const path = require('path');

console.log('=== JWT环境变量检查 ===');

// 检查环境变量
console.log('\n1. 检查环境变量:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '已设置' : '未设置');
console.log('ADMIN_JWT_SECRET:', process.env.ADMIN_JWT_SECRET ? '已设置' : '未设置');

// 检查.env文件
console.log('\n2. 检查.env文件:');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('.env文件存在');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const jwtSecretLine = envContent.split('\n').find(line => line.startsWith('JWT_SECRET='));
  if (jwtSecretLine) {
    console.log('JWT_SECRET在.env文件中已配置');
  } else {
    console.log('JWT_SECRET在.env文件中未配置');
  }
} else {
  console.log('.env文件不存在');
}

// 检查插件配置
console.log('\n3. 检查插件配置:');
const pluginsPath = path.join(__dirname, 'config', 'plugins.ts');
if (fs.existsSync(pluginsPath)) {
  const pluginsContent = fs.readFileSync(pluginsPath, 'utf8');
  if (pluginsContent.includes('JWT_SECRET')) {
    console.log('插件配置中包含JWT_SECRET');
  } else {
    console.log('插件配置中不包含JWT_SECRET');
  }
}

// 建议的修复方案
console.log('\n=== 修复建议 ===');
console.log('1. 在服务器上设置JWT_SECRET环境变量:');
console.log('   export JWT_SECRET="your-secure-jwt-secret-key"');
console.log('2. 或者在.env文件中添加:');
console.log('   JWT_SECRET=your-secure-jwt-secret-key');
console.log('3. 重启服务器');