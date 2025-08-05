#!/usr/bin/env node

/**
 * Firebase配置更新脚本
 * 用于从新的Firebase项目更新配置
 */

const fs = require('fs');
const path = require('path');

// 新的Firebase配置信息
const newFirebaseConfig = {
  FIREBASE_PROJECT_ID: 'bixu-chat-app',
  // 注意：这些是示例值，需要从新的Firebase服务账号JSON文件中获取
  FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\n从新JSON文件中获取的私钥内容\n-----END PRIVATE KEY-----\n',
  FIREBASE_CLIENT_EMAIL: 'firebase-adminsdk-xxxxx@bixu-chat-app.iam.gserviceaccount.com'
};

// 更新firebase-config.js文件
function updateFirebaseConfig() {
  const configPath = path.join(__dirname, 'firebase-config.js');
  
  const configContent = `// Firebase配置信息
// 从Firebase服务账号JSON文件中提取的配置

module.exports = {
  FIREBASE_PROJECT_ID: '${newFirebaseConfig.FIREBASE_PROJECT_ID}',
  // TODO: 需要从新的Firebase项目下载服务账号JSON文件，然后更新以下配置
  FIREBASE_PRIVATE_KEY: '${newFirebaseConfig.FIREBASE_PRIVATE_KEY}',
  FIREBASE_CLIENT_EMAIL: '${newFirebaseConfig.FIREBASE_CLIENT_EMAIL}'
};

// 使用说明：
// 1. 从Firebase Console下载新的服务账号JSON文件
// 2. 更新以下环境变量：
//    export FIREBASE_PROJECT_ID="${newFirebaseConfig.FIREBASE_PROJECT_ID}"
//    export FIREBASE_PRIVATE_KEY="从新JSON文件中获取的私钥"
//    export FIREBASE_CLIENT_EMAIL="从新JSON文件中获取的客户端邮箱"
//
// 3. 重启Strapi服务：
//    cd /root/strapi-v5-ts
//    yarn develop
`;

  try {
    fs.writeFileSync(configPath, configContent);
    console.log('✅ Firebase配置文件已更新');
    console.log('📝 请从Firebase Console下载新的服务账号JSON文件');
    console.log('🔗 访问: https://console.firebase.google.com/project/bixu-chat-app/settings/serviceaccounts/adminsdk');
    console.log('📋 然后更新FIREBASE_PRIVATE_KEY和FIREBASE_CLIENT_EMAIL的值');
  } catch (error) {
    console.error('❌ 更新Firebase配置文件失败:', error);
  }
}

// 生成环境变量设置脚本
function generateEnvScript() {
  const envScript = `#!/bin/bash

# Firebase环境变量设置脚本
echo "设置Firebase环境变量..."

# 设置Firebase项目ID
export FIREBASE_PROJECT_ID="${newFirebaseConfig.FIREBASE_PROJECT_ID}"

# 设置Firebase私钥（需要从新JSON文件中获取）
export FIREBASE_PRIVATE_KEY="${newFirebaseConfig.FIREBASE_PRIVATE_KEY}"

# 设置Firebase客户端邮箱（需要从新JSON文件中获取）
export FIREBASE_CLIENT_EMAIL="${newFirebaseConfig.FIREBASE_CLIENT_EMAIL}"

echo "✅ Firebase环境变量已设置"
echo "📝 项目ID: $FIREBASE_PROJECT_ID"
echo "📝 客户端邮箱: $FIREBASE_CLIENT_EMAIL"
echo ""
echo "⚠️  请确保已从Firebase Console下载新的服务账号JSON文件"
echo "🔗 访问: https://console.firebase.google.com/project/bixu-chat-app/settings/serviceaccounts/adminsdk"
echo ""
echo "🔄 重启Strapi服务以应用新配置:"
echo "   cd /root/strapi-v5-ts"
echo "   yarn develop"
`;

  const envScriptPath = path.join(__dirname, 'set-firebase-env.sh');
  
  try {
    fs.writeFileSync(envScriptPath, envScript);
    fs.chmodSync(envScriptPath, '755'); // 设置可执行权限
    console.log('✅ 环境变量设置脚本已生成: set-firebase-env.sh');
    console.log('💡 运行命令: source set-firebase-env.sh');
  } catch (error) {
    console.error('❌ 生成环境变量脚本失败:', error);
  }
}

// 生成测试脚本
function generateTestScript() {
  const testScript = `const axios = require('axios');

// 测试Firebase推送功能
async function testFirebasePush() {
  const baseURL = 'http://118.107.4.158:1337';
  
  try {
    // 1. 登录获取token
    console.log('🔐 登录获取token...');
    const loginResponse = await axios.post(\`\${baseURL}/api/auth/local\`, {
      identifier: '123',
      password: '521125'
    });
    
    const token = loginResponse.data.jwt;
    console.log('✅ 登录成功，token:', token.substring(0, 20) + '...');
    
    // 2. 发送测试公告
    console.log('📢 发送测试公告...');
    const announcementResponse = await axios.post(
      \`\${baseURL}/api/push/send-announcement\`,
      {
        title: '🔥 测试Firebase推送',
        body: '这是一条测试Firebase推送的通知，如果您看到这条消息，说明Firebase配置成功！'
      },
      {
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ 公告发送成功:', announcementResponse.data);
    
    // 3. 检查推送日志
    console.log('📋 检查推送日志...');
    console.log('💡 如果看到"✅ 推送通知发送成功"而不是"⚠️ 模拟推送通知"，说明Firebase配置正确');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testFirebasePush();
`;

  const testScriptPath = path.join(__dirname, 'test-firebase-push.js');
  
  try {
    fs.writeFileSync(testScriptPath, testScript);
    console.log('✅ Firebase推送测试脚本已生成: test-firebase-push.js');
    console.log('💡 运行命令: node test-firebase-push.js');
  } catch (error) {
    console.error('❌ 生成测试脚本失败:', error);
  }
}

// 执行更新
console.log('🔄 开始更新Firebase配置...');
updateFirebaseConfig();
generateEnvScript();
generateTestScript();

console.log('');
console.log('📋 下一步操作:');
console.log('1. 访问Firebase Console: https://console.firebase.google.com/project/bixu-chat-app/settings/serviceaccounts/adminsdk');
console.log('2. 下载新的服务账号JSON文件');
console.log('3. 更新firebase-config.js中的FIREBASE_PRIVATE_KEY和FIREBASE_CLIENT_EMAIL');
console.log('4. 运行: source set-firebase-env.sh');
console.log('5. 重启Strapi服务');
console.log('6. 运行: node test-firebase-push.js 测试推送功能'); 