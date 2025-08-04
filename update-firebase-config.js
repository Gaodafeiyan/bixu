#!/usr/bin/env node

/**
 * Firebase配置更新脚本
 * 用于从新的Firebase项目更新配置
 */

const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase配置更新工具');
console.log('========================\n');

// 检查是否有google-services.json文件
const googleServicesPath = path.join(__dirname, 'google-services.json');
const googleServicesDesktopPath = path.join(process.env.USERPROFILE || process.env.HOME, 'Desktop', 'google-services.json');

let configFile = null;

if (fs.existsSync(googleServicesPath)) {
  configFile = googleServicesPath;
  console.log('✅ 找到项目目录下的 google-services.json');
} else if (fs.existsSync(googleServicesDesktopPath)) {
  configFile = googleServicesDesktopPath;
  console.log('✅ 找到桌面上的 google-services.json');
} else {
  console.log('❌ 未找到 google-services.json 文件');
  console.log('请确保已从Firebase Console下载服务账号JSON文件');
  console.log('文件应命名为 google-services.json 并放在以下位置之一：');
  console.log(`  - ${googleServicesPath}`);
  console.log(`  - ${googleServicesDesktopPath}`);
  process.exit(1);
}

try {
  // 读取JSON文件
  const jsonContent = fs.readFileSync(configFile, 'utf8');
  const config = JSON.parse(jsonContent);
  
  console.log('📋 从JSON文件中提取的配置信息：');
  console.log(`   项目ID: ${config.project_id}`);
  console.log(`   客户端邮箱: ${config.client_email}`);
  console.log(`   私钥长度: ${config.private_key ? config.private_key.length : 0} 字符`);
  
  // 生成环境变量设置命令
  const envCommands = [
    `export FIREBASE_PROJECT_ID="${config.project_id}"`,
    `export FIREBASE_PRIVATE_KEY="${config.private_key.replace(/\n/g, '\\n')}"`,
    `export FIREBASE_CLIENT_EMAIL="${config.client_email}"`
  ];
  
  console.log('\n📝 请运行以下命令设置环境变量：');
  console.log('----------------------------------------');
  envCommands.forEach(cmd => console.log(cmd));
  console.log('----------------------------------------');
  
  // 生成永久设置命令
  const permanentCommands = [
    `echo 'export FIREBASE_PROJECT_ID="${config.project_id}"' >> ~/.bashrc`,
    `echo 'export FIREBASE_PRIVATE_KEY="${config.private_key.replace(/\n/g, '\\n')}"' >> ~/.bashrc`,
    `echo 'export FIREBASE_CLIENT_EMAIL="${config.client_email}"' >> ~/.bashrc`,
    'source ~/.bashrc'
  ];
  
  console.log('\n🔧 永久设置环境变量（添加到 ~/.bashrc）：');
  console.log('----------------------------------------');
  permanentCommands.forEach(cmd => console.log(cmd));
  console.log('----------------------------------------');
  
  console.log('\n✅ 配置提取完成！');
  console.log('\n📋 下一步操作：');
  console.log('1. 复制上面的环境变量命令并执行');
  console.log('2. 重启Strapi服务：cd /root/strapi-v5-ts && yarn develop');
  console.log('3. 检查日志确认Firebase配置成功');
  
} catch (error) {
  console.error('❌ 读取或解析JSON文件失败:', error.message);
  process.exit(1);
} 