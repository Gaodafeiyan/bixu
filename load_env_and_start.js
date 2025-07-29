const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('=== 加载环境变量并启动Strapi ===');

// 1. 检查.env文件
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env文件存在');
  
  // 2. 读取.env文件内容
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  // 3. 解析环境变量
  const envVars = {};
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=');
        envVars[key] = value;
        console.log(`📝 加载环境变量: ${key}=${value.substring(0, 10)}...`);
      }
    }
  });
  
  // 4. 设置环境变量
  Object.keys(envVars).forEach(key => {
    process.env[key] = envVars[key];
  });
  
  console.log(`✅ 已加载 ${Object.keys(envVars).length} 个环境变量`);
  
  // 5. 验证JWT_SECRET
  if (process.env.JWT_SECRET) {
    console.log('✅ JWT_SECRET已设置');
  } else {
    console.log('❌ JWT_SECRET未设置');
  }
  
} else {
  console.log('❌ .env文件不存在');
}

// 6. 启动Strapi
console.log('\n🚀 启动Strapi...');
const strapiProcess = spawn('yarn', ['develop'], {
  stdio: 'inherit',
  env: { ...process.env }
});

strapiProcess.on('error', (error) => {
  console.error('❌ 启动失败:', error);
});

strapiProcess.on('close', (code) => {
  console.log(`Strapi进程退出，代码: ${code}`);
});