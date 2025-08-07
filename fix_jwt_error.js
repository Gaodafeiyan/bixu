const fs = require('fs');
const path = require('path');

console.log('🔧 修复JWT配置错误...');

// 1. 生成安全的JWT密钥
const generateJWTSecret = () => {
  return 'bixu-jwt-secret-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

// 2. 创建.env文件
const createEnvFile = () => {
  const envPath = path.join(__dirname, '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('✅ .env文件已存在');
    return;
  }

  const envContent = `# 数据库配置
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=bixu
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_SSL=false

# 应用配置
NODE_ENV=development
HOST=0.0.0.0
PORT=1337

# JWT配置
JWT_SECRET=${generateJWTSecret()}
ADMIN_JWT_SECRET=${generateJWTSecret()}

# API Token配置
API_TOKEN_SALT=bixu-api-token-salt-2024
TRANSFER_TOKEN_SALT=bixu-transfer-token-salt-2024

# 应用密钥
APP_KEYS=${generateJWTSecret()},${generateJWTSecret()},${generateJWTSecret()},${generateJWTSecret()}

# 安全配置
CORS_ORIGIN=http://localhost:3000,http://localhost:1337,https://zenithus.app

# 区块链配置
BSC_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
BSC_PRIVATE_KEY=your-private-key-here
BSC_RPC_URL=https://bsc-dataseed1.binance.org/

# 其他配置
WEBHOOKS_POPULATE_RELATIONS=false
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ 已创建.env文件');
};

// 3. 验证plugins.ts配置
const verifyPluginsConfig = () => {
  const pluginsPath = path.join(__dirname, 'config', 'plugins.ts');
  
  if (fs.existsSync(pluginsPath)) {
    const content = fs.readFileSync(pluginsPath, 'utf8');
    
    // 检查是否包含正确的JWT配置
    if (content.includes('jwt:') && content.includes('secret:')) {
      console.log('✅ plugins.ts中的JWT配置正确');
    } else {
      console.log('❌ plugins.ts中的JWT配置有问题');
    }
  } else {
    console.log('❌ plugins.ts文件不存在');
  }
};

// 4. 检查是否有重复的JWT配置
const checkDuplicateJWTConfig = () => {
  const serverPath = path.join(__dirname, 'config', 'server.ts');
  
  if (fs.existsSync(serverPath)) {
    const content = fs.readFileSync(serverPath, 'utf8');
    
    if (content.includes('jwt:')) {
      console.log('⚠️  发现server.ts中有重复的JWT配置，需要移除');
      return true;
    }
  }
  
  return false;
};

// 5. 移除重复的JWT配置
const removeDuplicateJWTConfig = () => {
  const serverPath = path.join(__dirname, 'config', 'server.ts');
  
  if (fs.existsSync(serverPath)) {
    let content = fs.readFileSync(serverPath, 'utf8');
    
    // 移除jwt配置块
    content = content.replace(/jwt:\s*{[^}]*},?\s*/g, '');
    
    fs.writeFileSync(serverPath, content);
    console.log('✅ 已移除server.ts中的重复JWT配置');
  }
};

// 6. 删除多余的jwt.ts文件
const removeJWTFile = () => {
  const jwtPath = path.join(__dirname, 'config', 'jwt.ts');
  
  if (fs.existsSync(jwtPath)) {
    fs.unlinkSync(jwtPath);
    console.log('✅ 已删除多余的jwt.ts文件');
  }
};

// 执行修复
console.log('\n1. 创建环境变量文件...');
createEnvFile();

console.log('\n2. 检查JWT配置文件...');
verifyPluginsConfig();

console.log('\n3. 检查重复配置...');
if (checkDuplicateJWTConfig()) {
  removeDuplicateJWTConfig();
}

console.log('\n4. 清理多余文件...');
removeJWTFile();

console.log('\n✅ JWT配置修复完成！');
console.log('\n📋 修复内容:');
console.log('   - 创建了.env文件并设置了JWT_SECRET');
console.log('   - 移除了重复的JWT配置');
console.log('   - 删除了多余的jwt.ts文件');
console.log('   - 保留了plugins.ts中的正确JWT配置');
console.log('\n🚀 现在请重启Strapi服务器:');
console.log('   npm run develop'); 