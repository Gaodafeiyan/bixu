require('dotenv').config();

console.log('🔍 检查环境变量...');

const requiredEnvVars = [
  'APP_KEYS',
  'JWT_SECRET',
  'API_TOKEN_SALT',
  'ADMIN_JWT_SECRET',
  'TRANSFER_TOKEN_SALT'
];

console.log('\n📋 必需的环境变量:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: 未设置`);
  }
});

console.log('\n🌐 服务器配置:');
console.log(`HOST: ${process.env.HOST || '0.0.0.0'}`);
console.log(`PORT: ${process.env.PORT || 1337}`);

console.log('\n🔐 JWT配置:');
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '已设置' : '未设置'}`);

console.log('\n📦 数据库配置:');
console.log(`DATABASE_HOST: ${process.env.DATABASE_HOST || '未设置'}`);
console.log(`DATABASE_PORT: ${process.env.DATABASE_PORT || '未设置'}`);
console.log(`DATABASE_NAME: ${process.env.DATABASE_NAME || '未设置'}`);
console.log(`DATABASE_USERNAME: ${process.env.DATABASE_USERNAME || '未设置'}`);
console.log(`DATABASE_PASSWORD: ${process.env.DATABASE_PASSWORD ? '已设置' : '未设置'}`);

console.log('\n✅ 环境变量检查完成'); 