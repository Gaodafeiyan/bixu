const fs = require('fs');
const path = require('path');

console.log('🔧 完整修复JWT配置错误...');

// 1. 生成安全的JWT密钥
const generateJWTSecret = () => {
  return 'bixu-jwt-secret-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

// 2. 创建.env文件
const createEnvFile = () => {
  const envPath = path.join(__dirname, '.env');
  
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

// 3. 修复plugins.ts配置
const fixPluginsConfig = () => {
  const pluginsPath = path.join(__dirname, 'config', 'plugins.ts');
  
  const pluginsContent = `export default ({ env }) => ({
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d'
      },
      register: {
        enabled: false,
        defaultRole: 'authenticated'
      },
      routes: {
        register: false,
        'auth/register': false
      }
    }
  },
  upload: {
    config: {
      provider: 'local',
    },
  },
});`;

  fs.writeFileSync(pluginsPath, pluginsContent);
  console.log('✅ 已修复plugins.ts配置');
};

// 4. 创建正确的jwt.ts配置
const createJWTConfig = () => {
  const jwtPath = path.join(__dirname, 'config', 'jwt.ts');
  
  const jwtContent = `export default ({ env }) => ({
  jwt: {
    secret: env('JWT_SECRET', 'your-jwt-secret-key-here'),
  },
});`;

  fs.writeFileSync(jwtPath, jwtContent);
  console.log('✅ 已创建正确的jwt.ts配置');
};

// 5. 移除server.ts中的JWT配置
const removeServerJWTConfig = () => {
  const serverPath = path.join(__dirname, 'config', 'server.ts');
  
  if (fs.existsSync(serverPath)) {
    let content = fs.readFileSync(serverPath, 'utf8');
    
    // 移除jwt配置块
    content = content.replace(/jwt:\s*{[^}]*},?\s*/g, '');
    
    fs.writeFileSync(serverPath, content);
    console.log('✅ 已移除server.ts中的JWT配置');
  }
};

// 执行修复
console.log('\n1. 创建环境变量文件...');
createEnvFile();

console.log('\n2. 修复plugins.ts配置...');
fixPluginsConfig();

console.log('\n3. 创建JWT配置文件...');
createJWTConfig();

console.log('\n4. 移除重复配置...');
removeServerJWTConfig();

console.log('\n✅ JWT配置完全修复完成！');
console.log('\n📋 修复内容:');
console.log('   - 创建了.env文件并设置了JWT_SECRET');
console.log('   - 修复了plugins.ts中的JWT配置（移除了secret字段）');
console.log('   - 创建了正确的jwt.ts配置文件');
console.log('   - 移除了server.ts中的重复JWT配置');
console.log('\n🚀 现在请重启Strapi服务器:');
console.log('   npm run develop');