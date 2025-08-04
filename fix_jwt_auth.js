#!/usr/bin/env node

/**
 * JWT认证修复脚本
 * 用于修复401认证错误
 */

const fs = require('fs');
const crypto = require('crypto');

console.log('🔧 JWT认证修复工具');
console.log('========================\n');

// 生成新的JWT密钥
function generateJWTSecret() {
  return crypto.randomBytes(64).toString('hex');
}

// 更新.env文件
function updateEnvFile() {
  const envPath = '.env';
  const newJWTSecret = generateJWTSecret();
  
  console.log('🔑 生成新的JWT密钥...');
  console.log(`新JWT密钥: ${newJWTSecret.substring(0, 20)}...`);
  
  let envContent = '';
  
  // 如果.env文件存在，读取内容
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // 更新或添加JWT相关配置
  const jwtConfigs = [
    `JWT_SECRET=${newJWTSecret}`,
    `ADMIN_JWT_SECRET=${newJWTSecret}`,
    `API_TOKEN_SALT=${crypto.randomBytes(32).toString('hex')}`,
    `TRANSFER_TOKEN_SALT=${crypto.randomBytes(32).toString('hex')}`,
    `APP_KEYS="${crypto.randomBytes(32).toString('hex')},${crypto.randomBytes(32).toString('hex')}"`
  ];
  
  // 更新现有配置或添加新配置
  jwtConfigs.forEach(config => {
    const [key] = config.split('=');
    const regex = new RegExp(`^${key}=.*$`, 'm');
    
    if (envContent.match(regex)) {
      envContent = envContent.replace(regex, config);
    } else {
      envContent += `\n${config}`;
    }
  });
  
  // 写入.env文件
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env文件已更新');
}

// 检查当前配置
function checkCurrentConfig() {
  console.log('📋 检查当前配置...');
  
  const envPath = '.env';
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    
    const jwtKeys = ['JWT_SECRET', 'ADMIN_JWT_SECRET', 'API_TOKEN_SALT', 'TRANSFER_TOKEN_SALT', 'APP_KEYS'];
    
    jwtKeys.forEach(key => {
      const line = lines.find(l => l.startsWith(key + '='));
      if (line) {
        const value = line.split('=')[1];
        console.log(`✅ ${key}: ${value.substring(0, 20)}...`);
      } else {
        console.log(`❌ ${key}: 未配置`);
      }
    });
  } else {
    console.log('❌ .env文件不存在');
  }
}

// 测试认证
async function testAuth() {
  console.log('\n🧪 测试认证...');
  
  try {
    const response = await fetch('http://localhost:1337/api/auth/local', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ 认证测试成功');
      console.log(`Token: ${data.jwt.substring(0, 20)}...`);
    } else {
      console.log('❌ 认证测试失败');
      console.log(`状态码: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ 认证测试出错:', error.message);
  }
}

// 主函数
async function main() {
  console.log('1. 检查当前配置');
  checkCurrentConfig();
  
  console.log('\n2. 更新JWT配置');
  updateEnvFile();
  
  console.log('\n3. 重新检查配置');
  checkCurrentConfig();
  
  console.log('\n📋 下一步操作:');
  console.log('1. 重启Strapi服务');
  console.log('2. 清除前端存储的token');
  console.log('3. 重新登录');
  
  console.log('\n🔄 重启命令:');
  console.log('cd /root/strapi-v5-ts');
  console.log('yarn develop');
}

main().catch(console.error); 