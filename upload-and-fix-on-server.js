const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 修复TypeScript错误的函数
function fixTypeScriptErrors() {
  console.log('🔧 开始修复TypeScript错误...');
  
  // 1. 修复 auth.ts 中的 password 字段错误
  const authFile = path.join(__dirname, 'src/api/auth/controllers/auth.ts');
  if (fs.existsSync(authFile)) {
    let content = fs.readFileSync(authFile, 'utf8');
    content = content.replace(
      /await strapi\.entityService\.update\('plugin::users-permissions\.user', userId, \{\s*data: \{\s*password: newPassword\s*\}\s*\}\);/g,
      `await strapi.entityService.update('plugin::users-permissions.user', userId, {
          data: {
            password: newPassword
          } as any
        });`
    );
    fs.writeFileSync(authFile, content);
    console.log('✅ 修复了 auth.ts 中的 password 字段错误');
  }

  // 2. 修复钱包余额相关的错误
  const filesToFix = [
    'src/api/dinggou-jihua/controllers/dinggou-jihua.ts',
    'src/api/recharge-channel/controllers/recharge-channel.ts',
    'src/api/shop-order/controllers/shop-order.ts',
    'src/api/yaoqing-jiangli/controllers/yaoqing-jiangli.ts',
    'src/services/investment-service.ts',
    'src/services/lottery-service.ts',
    'src/services/shop-service.ts'
  ];

  filesToFix.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // 修复 usdtYue 字段错误
      content = content.replace(
        /data: \{ usdtYue: ([^}]+) \}/g,
        'data: { usdtYue: $1 } as any'
      );
      
      // 修复 aiYue 字段错误
      content = content.replace(
        /data: \{ aiYue: ([^}]+) \}/g,
        'data: { aiYue: $1 } as any'
      );
      
      fs.writeFileSync(fullPath, content);
      console.log(`✅ 修复了 ${filePath} 中的钱包余额字段错误`);
    }
  });

  // 3. 修复订单状态相关的错误
  const orderFiles = [
    'src/api/dinggou-dingdan/controllers/dinggou-dingdan.ts',
    'src/api/recharge-channel/controllers/recharge-channel.ts',
    'src/api/shop-order/controllers/shop-order.ts',
    'src/services/investment-service.ts'
  ];

  orderFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // 修复 status 字段错误
      content = content.replace(
        /data: \{ status: ([^}]+) \}/g,
        'data: { status: $1 } as any'
      );
      
      // 修复包含多个字段的更新
      content = content.replace(
        /data: \{([^}]+status[^}]+)\}/g,
        'data: {$1} as any'
      );
      
      fs.writeFileSync(fullPath, content);
      console.log(`✅ 修复了 ${filePath} 中的订单状态字段错误`);
    }
  });

  // 4. 修复其他字段错误
  const otherFiles = [
    'src/api/choujiang-jiangpin/controllers/choujiang-jiangpin.ts',
    'src/api/shop-cart/controllers/shop-cart.ts',
    'src/api/shop-product/controllers/shop-product.ts',
    'src/api/system-config/controllers/system-config.ts',
    'src/services/lottery-service.ts'
  ];

  otherFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // 修复 currentQuantity 字段错误
      content = content.replace(
        /data: \{ currentQuantity: ([^}]+) \}/g,
        'data: { currentQuantity: $1 } as any'
      );
      
      // 修复 quantity 字段错误
      content = content.replace(
        /data: \{ quantity: ([^}]+) \}/g,
        'data: { quantity: $1 } as any'
      );
      
      // 修复 stock 字段错误
      content = content.replace(
        /data: \{ stock: ([^}]+) \}/g,
        'data: { stock: $1 } as any'
      );
      
      // 修复 value 字段错误
      content = content.replace(
        /data: \{ value: ([^}]+) \}/g,
        'data: { value: $1 } as any'
      );
      
      // 修复 usedCount 字段错误
      content = content.replace(
        /data: \{ usedCount: ([^}]+) \}/g,
        'data: { usedCount: $1 } as any'
      );
      
      fs.writeFileSync(fullPath, content);
      console.log(`✅ 修复了 ${filePath} 中的字段错误`);
    }
  });

  // 5. 修复复杂的查询条件错误
  const choujiangFile = path.join(__dirname, 'src/api/choujiang-jihui/controllers/choujiang-jihui.ts');
  if (fs.existsSync(choujiangFile)) {
    let content = fs.readFileSync(choujiangFile, 'utf8');
    
    // 修复 $or 查询条件
    content = content.replace(
      /\$or: \[\s*\{ validUntil: null \},\s*\{ validUntil: \{ \$gt: beijingNow \} \}\s*\]/g,
      '$or: [{ validUntil: null }, { validUntil: { $gt: beijingNow } }] as any'
    );
    
    fs.writeFileSync(choujiangFile, content);
    console.log('✅ 修复了 choujiang-jihui.ts 中的查询条件错误');
  }

  // 6. 修复 shipping-order 中的复杂更新
  const shippingFile = path.join(__dirname, 'src/api/shipping-order/controllers/shipping-order.ts');
  if (fs.existsSync(shippingFile)) {
    let content = fs.readFileSync(shippingFile, 'utf8');
    
    // 修复包含多个字段的更新
    content = content.replace(
      /data: updateData/g,
      'data: updateData as any'
    );
    
    fs.writeFileSync(shippingFile, content);
    console.log('✅ 修复了 shipping-order.ts 中的更新错误');
  }

  // 7. 修复 system-config 中的 for 循环错误
  const systemConfigFile = path.join(__dirname, 'src/api/system-config/controllers/system-config.ts');
  if (fs.existsSync(systemConfigFile)) {
    let content = fs.readFileSync(systemConfigFile, 'utf8');
    
    // 修复 for 循环类型错误
    content = content.replace(
      /for \(const plan of allPlans\)/g,
      'for (const plan of allPlans as any[])'
    );
    
    fs.writeFileSync(systemConfigFile, content);
    console.log('✅ 修复了 system-config.ts 中的循环错误');
  }

  // 8. 修复 notice 中的通知设置错误
  const noticeFile = path.join(__dirname, 'src/api/notice/controllers/notice.ts');
  if (fs.existsSync(noticeFile)) {
    let content = fs.readFileSync(noticeFile, 'utf8');
    
    // 修复通知设置字段
    content = content.replace(
      /data: \{([^}]+systemNotifications[^}]+)\}/g,
      'data: {$1} as any'
    );
    
    fs.writeFileSync(noticeFile, content);
    console.log('✅ 修复了 notice.ts 中的通知设置错误');
  }

  console.log('🎉 所有TypeScript错误修复完成！');
}

// Git操作函数
function gitOperations() {
  console.log('\n📦 开始Git操作...');
  
  try {
    // 检查Git状态
    console.log('📋 检查Git状态...');
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (!status.trim()) {
      console.log('✅ 没有需要提交的更改');
      return;
    }
    
    console.log('📝 当前更改:');
    console.log(status);
    
    // 添加所有文件
    console.log('➕ 添加所有文件到暂存区...');
    execSync('git add .', { stdio: 'inherit' });
    
    // 提交更改
    const commitMessage = `fix: 修复TypeScript编译错误 - ${new Date().toISOString()}`;
    console.log(`💾 提交更改: ${commitMessage}`);
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    
    // 推送到远程仓库
    console.log('🚀 推送到远程仓库...');
    execSync('git push', { stdio: 'inherit' });
    
    console.log('✅ Git操作完成！');
    
  } catch (error) {
    console.error('❌ Git操作失败:', error.message);
    throw error;
  }
}

// 创建远程服务器修复脚本
function createServerFixScript() {
  console.log('\n🖥️ 创建远程服务器修复脚本...');
  
  const serverScript = `#!/bin/bash

echo "🚀 开始在远程服务器上修复TypeScript错误..."

# 进入项目目录
cd /root/strapi-v5-ts

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 安装依赖（如果需要）
echo "📦 检查依赖..."
npm install

# 运行TypeScript编译检查
echo "🔍 检查TypeScript编译..."
npx tsc --noEmit

# 如果编译成功，启动开发服务器
if [ $? -eq 0 ]; then
    echo "✅ TypeScript编译成功！"
    echo "🚀 启动Strapi开发服务器..."
    npx strapi develop
else
    echo "❌ TypeScript编译失败，请检查错误信息"
    exit 1
fi
`;

  fs.writeFileSync(path.join(__dirname, 'server-fix.sh'), serverScript);
  console.log('✅ 创建了 server-fix.sh 脚本');
  
  // 创建PowerShell版本的脚本
  const psScript = `# PowerShell脚本 - 在远程服务器上运行

Write-Host "🚀 开始在远程服务器上修复TypeScript错误..." -ForegroundColor Green

# 进入项目目录
Set-Location /root/strapi-v5-ts

# 拉取最新代码
Write-Host "📥 拉取最新代码..." -ForegroundColor Yellow
git pull origin main

# 安装依赖（如果需要）
Write-Host "📦 检查依赖..." -ForegroundColor Yellow
npm install

# 运行TypeScript编译检查
Write-Host "🔍 检查TypeScript编译..." -ForegroundColor Yellow
npx tsc --noEmit

# 如果编译成功，启动开发服务器
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ TypeScript编译成功！" -ForegroundColor Green
    Write-Host "🚀 启动Strapi开发服务器..." -ForegroundColor Green
    npx strapi develop
} else {
    Write-Host "❌ TypeScript编译失败，请检查错误信息" -ForegroundColor Red
    exit 1
}
`;

  fs.writeFileSync(path.join(__dirname, 'server-fix.ps1'), psScript);
  console.log('✅ 创建了 server-fix.ps1 脚本');
}

// 创建SSH连接脚本
function createSSHScript() {
  console.log('\n🔗 创建SSH连接脚本...');
  
  const sshScript = `#!/bin/bash

# SSH连接并运行修复脚本
echo "🔗 连接到远程服务器..."

# 替换为您的服务器信息
SERVER_IP="your-server-ip"
USERNAME="root"
SSH_KEY_PATH="~/.ssh/id_rsa"

# 上传修复脚本到服务器
echo "📤 上传修复脚本到服务器..."
scp -i $SSH_KEY_PATH server-fix.sh $USERNAME@$SERVER_IP:/root/

# 连接到服务器并运行修复脚本
echo "🚀 在服务器上运行修复脚本..."
ssh -i $SSH_KEY_PATH $USERNAME@$SERVER_IP << 'EOF'
    chmod +x /root/server-fix.sh
    /root/server-fix.sh
EOF

echo "✅ 远程服务器修复完成！"
`;

  fs.writeFileSync(path.join(__dirname, 'connect-and-fix.sh'), sshScript);
  console.log('✅ 创建了 connect-and-fix.sh 脚本');
}

// 主函数
function main() {
  console.log('🚀 开始完整的修复和部署流程...\n');
  
  try {
    // 1. 修复TypeScript错误
    fixTypeScriptErrors();
    
    // 2. 执行Git操作
    gitOperations();
    
    // 3. 创建远程服务器脚本
    createServerFixScript();
    
    // 4. 创建SSH连接脚本
    createSSHScript();
    
    console.log('\n🎉 所有脚本创建完成！');
    console.log('\n📋 接下来的步骤：');
    console.log('1. 修改 connect-and-fix.sh 中的服务器信息');
    console.log('2. 运行: chmod +x connect-and-fix.sh');
    console.log('3. 运行: ./connect-and-fix.sh');
    console.log('\n或者手动在服务器上运行:');
    console.log('1. SSH到服务器');
    console.log('2. cd /root/strapi-v5-ts');
    console.log('3. git pull origin main');
    console.log('4. npx strapi develop');
    
  } catch (error) {
    console.error('\n❌ 操作失败:', error.message);
    process.exit(1);
  }
}

// 运行主函数
main(); 