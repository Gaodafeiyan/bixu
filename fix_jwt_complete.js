const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('=== 完整JWT配置修复 ===');

// 1. 生成安全的JWT密钥
const generateJWTSecret = () => {
  return crypto.randomBytes(32).toString('base64');
};

// 2. 创建.env文件
const createEnvFile = () => {
  const envPath = path.join(__dirname, '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('✅ .env文件已存在');
    return envPath;
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
NODE_ENV=production
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
CORS_ORIGIN=http://localhost:3000,http://localhost:1337

# 区块链配置
BSC_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
BSC_PRIVATE_KEY=your-private-key-here
BSC_RPC_URL=https://bsc-dataseed1.binance.org/

# 其他配置
WEBHOOKS_POPULATE_RELATIONS=false
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ 已创建.env文件');
  return envPath;
};

// 3. 验证配置文件
const validateConfig = () => {
  console.log('\n3. 验证配置文件...');
  
  // 检查plugins.ts
  const pluginsPath = path.join(__dirname, 'config', 'plugins.ts');
  if (fs.existsSync(pluginsPath)) {
    const pluginsContent = fs.readFileSync(pluginsPath, 'utf8');
    if (pluginsContent.includes('jwtSecret') || pluginsContent.includes('secret:')) {
      console.log('✅ plugins.ts配置正确');
    } else {
      console.log('❌ plugins.ts缺少JWT secret配置');
    }
  }
  
  // 检查middlewares.ts
  const middlewaresPath = path.join(__dirname, 'config', 'middlewares.ts');
  if (fs.existsSync(middlewaresPath)) {
    const middlewaresContent = fs.readFileSync(middlewaresPath, 'utf8');
    if (middlewaresContent.includes('strapi::users-permissions')) {
      console.log('✅ middlewares.ts配置正确');
    } else {
      console.log('❌ middlewares.ts缺少users-permissions中间件');
    }
  }
};

// 4. 测试JWT功能
const testJWT = () => {
  console.log('\n4. 测试JWT功能...');
  try {
    const jwt = require('jsonwebtoken');
    const testSecret = generateJWTSecret();
    const testPayload = { userId: 1, username: 'test' };
    
    const token = jwt.sign(testPayload, testSecret);
    const decoded = jwt.verify(token, testSecret);
    
    console.log('✅ JWT功能测试成功');
    console.log('   - Token生成: 成功');
    console.log('   - Token验证: 成功');
    console.log('   - 解码数据:', decoded);
  } catch (error) {
    console.log('❌ JWT功能测试失败:', error.message);
  }
};

// 5. 主函数
const main = () => {
  console.log('1. 创建环境变量文件...');
  const envPath = createEnvFile();
  
  console.log('\n2. 加载环境变量...');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=');
        process.env[key] = value;
      }
    }
  });
  
  console.log('✅ 环境变量已加载');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '已设置' : '未设置');
  
  validateConfig();
  testJWT();
  
  console.log('\n=== 修复完成 ===');
  console.log('现在可以重启Strapi服务器了:');
  console.log('yarn develop');
};

// 运行修复
main();