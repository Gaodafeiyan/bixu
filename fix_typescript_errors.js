const fs = require('fs');
const path = require('path');

// 重新生成JWT密钥
function regenerateJWTSecrets() {
  const crypto = require('crypto');
  
  const jwtSecret = crypto.randomBytes(64).toString('hex');
  const appKeys = [
    crypto.randomBytes(32).toString('hex'),
    crypto.randomBytes(32).toString('hex')
  ].join(',');
  const apiTokenSalt = crypto.randomBytes(32).toString('hex');
  const transferTokenSalt = crypto.randomBytes(32).toString('hex');
  const adminJwtSecret = crypto.randomBytes(64).toString('hex');
  
  return {
    JWT_SECRET: jwtSecret,
    APP_KEYS: appKeys,
    API_TOKEN_SALT: apiTokenSalt,
    TRANSFER_TOKEN_SALT: transferTokenSalt,
    ADMIN_JWT_SECRET: adminJwtSecret
  };
}

// 更新.env文件
function updateEnvFile(secrets) {
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // 更新或添加JWT相关配置
  const envLines = envContent.split('\n');
  const newEnvLines = [];
  const updatedKeys = new Set();
  
  // 处理现有行
  for (const line of envLines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('JWT_SECRET=') || 
        trimmedLine.startsWith('APP_KEYS=') || 
        trimmedLine.startsWith('API_TOKEN_SALT=') || 
        trimmedLine.startsWith('TRANSFER_TOKEN_SALT=') || 
        trimmedLine.startsWith('ADMIN_JWT_SECRET=')) {
      // 跳过旧的JWT配置
      continue;
    }
    if (trimmedLine) {
      newEnvLines.push(line);
    }
  }
  
  // 添加新的JWT配置
  newEnvLines.push(`JWT_SECRET=${secrets.JWT_SECRET}`);
  newEnvLines.push(`APP_KEYS=${secrets.APP_KEYS}`);
  newEnvLines.push(`API_TOKEN_SALT=${secrets.API_TOKEN_SALT}`);
  newEnvLines.push(`TRANSFER_TOKEN_SALT=${secrets.TRANSFER_TOKEN_SALT}`);
  newEnvLines.push(`ADMIN_JWT_SECRET=${secrets.ADMIN_JWT_SECRET}`);
  
  // 写入.env文件
  fs.writeFileSync(envPath, newEnvLines.join('\n'), 'utf8');
}

console.log('🔑 重新生成JWT密钥...');

const secrets = regenerateJWTSecrets();

console.log('✅ 新生成的密钥:');
console.log(`JWT_SECRET=${secrets.JWT_SECRET}`);
console.log(`APP_KEYS=${secrets.APP_KEYS}`);
console.log(`API_TOKEN_SALT=${secrets.API_TOKEN_SALT}`);
console.log(`TRANSFER_TOKEN_SALT=${secrets.TRANSFER_TOKEN_SALT}`);
console.log(`ADMIN_JWT_SECRET=${secrets.ADMIN_JWT_SECRET}`);

updateEnvFile(secrets);

console.log('✅ .env文件已更新');
console.log('🎉 JWT密钥重新生成完成！');
console.log('💡 请重启Strapi服务以应用新的密钥'); 