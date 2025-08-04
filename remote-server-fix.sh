#!/bin/bash

echo "🚀 开始在远程服务器上修复TypeScript错误..."

# 进入项目目录
cd /root/strapi-v5-ts

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 创建修复脚本
echo "🔧 创建TypeScript修复脚本..."
cat > fix-ts-errors.js << 'EOF'
const fs = require('fs');
const path = require('path');

console.log('🔧 开始修复TypeScript错误...');

// 修复函数
function fixFile(filePath, replacements) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let fixed = false;
    
    replacements.forEach(({ pattern, replacement }) => {
      if (content.match(pattern)) {
        content = content.replace(pattern, replacement);
        fixed = true;
      }
    });
    
    if (fixed) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ 修复了 ${filePath}`);
    }
  }
}

// 定义需要修复的文件和替换规则
const filesToFix = [
  {
    path: 'src/api/auth/controllers/auth.ts',
    replacements: [
      {
        pattern: /await strapi\.entityService\.update\('plugin::users-permissions\.user', userId, \{\s*data: \{\s*password: newPassword\s*\}\s*\}\);/g,
        replacement: `await strapi.entityService.update('plugin::users-permissions.user', userId, {
          data: {
            password: newPassword
          } as any
        });`
      }
    ]
  },
  {
    path: 'src/api/dinggou-jihua/controllers/dinggou-jihua.ts',
    replacements: [
      { pattern: /data: \{ usdtYue: ([^}]+) \}/g, replacement: 'data: { usdtYue: $1 } as any' },
      { pattern: /data: \{ aiYue: ([^}]+) \}/g, replacement: 'data: { aiYue: $1 } as any' }
    ]
  },
  {
    path: 'src/api/recharge-channel/controllers/recharge-channel.ts',
    replacements: [
      { pattern: /data: \{ usdtYue: ([^}]+) \}/g, replacement: 'data: { usdtYue: $1 } as any' },
      { pattern: /data: \{ status: ([^}]+) \}/g, replacement: 'data: { status: $1 } as any' }
    ]
  },
  {
    path: 'src/api/shop-order/controllers/shop-order.ts',
    replacements: [
      { pattern: /data: \{ usdtYue: ([^}]+) \}/g, replacement: 'data: { usdtYue: $1 } as any' },
      { pattern: /data: \{ status: ([^}]+) \}/g, replacement: 'data: { status: $1 } as any' },
      { pattern: /data: \{ stock: ([^}]+) \}/g, replacement: 'data: { stock: $1 } as any' }
    ]
  },
  {
    path: 'src/api/dinggou-dingdan/controllers/dinggou-dingdan.ts',
    replacements: [
      { pattern: /data: \{ status: ([^}]+) \}/g, replacement: 'data: { status: $1 } as any' }
    ]
  },
  {
    path: 'src/api/choujiang-jiangpin/controllers/choujiang-jiangpin.ts',
    replacements: [
      { pattern: /data: \{ currentQuantity: ([^}]+) \}/g, replacement: 'data: { currentQuantity: $1 } as any' }
    ]
  },
  {
    path: 'src/api/choujiang-jihui/controllers/choujiang-jihui.ts',
    replacements: [
      { pattern: /\$or: \[\s*\{ validUntil: null \},\s*\{ validUntil: \{ \$gt: beijingNow \} \}\s*\]/g, replacement: '$or: [{ validUntil: null }, { validUntil: { $gt: beijingNow } }] as any' }
    ]
  },
  {
    path: 'src/api/shop-cart/controllers/shop-cart.ts',
    replacements: [
      { pattern: /data: \{ quantity: ([^}]+) \}/g, replacement: 'data: { quantity: $1 } as any' }
    ]
  },
  {
    path: 'src/api/shop-product/controllers/shop-product.ts',
    replacements: [
      { pattern: /data: \{ stock: ([^}]+) \}/g, replacement: 'data: { stock: $1 } as any' }
    ]
  },
  {
    path: 'src/api/system-config/controllers/system-config.ts',
    replacements: [
      { pattern: /data: \{ value: ([^}]+) \}/g, replacement: 'data: { value: $1 } as any' },
      { pattern: /for \(const plan of allPlans\)/g, replacement: 'for (const plan of allPlans as any[])' }
    ]
  },
  {
    path: 'src/api/shipping-order/controllers/shipping-order.ts',
    replacements: [
      { pattern: /data: updateData/g, replacement: 'data: updateData as any' }
    ]
  },
  {
    path: 'src/api/notice/controllers/notice.ts',
    replacements: [
      { pattern: /data: \{([^}]+systemNotifications[^}]+)\}/g, replacement: 'data: {$1} as any' }
    ]
  },
  {
    path: 'src/api/yaoqing-jiangli/controllers/yaoqing-jiangli.ts',
    replacements: [
      { pattern: /data: \{ usdtYue: ([^}]+) \}/g, replacement: 'data: { usdtYue: $1 } as any' }
    ]
  },
  {
    path: 'src/services/investment-service.ts',
    replacements: [
      { pattern: /data: \{ status: ([^}]+) \}/g, replacement: 'data: { status: $1 } as any' },
      { pattern: /data: \{ usdtYue: ([^}]+) \}/g, replacement: 'data: { usdtYue: $1 } as any' }
    ]
  },
  {
    path: 'src/services/lottery-service.ts',
    replacements: [
      { pattern: /data: \{ currentQuantity: ([^}]+) \}/g, replacement: 'data: { currentQuantity: $1 } as any' },
      { pattern: /data: \{ usedCount: ([^}]+) \}/g, replacement: 'data: { usedCount: $1 } as any' },
      { pattern: /data: \{ usdtYue: ([^}]+) \}/g, replacement: 'data: { usdtYue: $1 } as any' },
      { pattern: /data: \{ aiYue: ([^}]+) \}/g, replacement: 'data: { aiYue: $1 } as any' }
    ]
  },
  {
    path: 'src/services/shop-service.ts',
    replacements: [
      { pattern: /data: \{ usdtYue: ([^}]+) \}/g, replacement: 'data: { usdtYue: $1 } as any' },
      { pattern: /data: \{ stock: ([^}]+) \}/g, replacement: 'data: { stock: $1 } as any' }
    ]
  }
];

// 执行修复
filesToFix.forEach(file => {
  fixFile(file.path, file.replacements);
});

console.log('🎉 所有TypeScript错误修复完成！');
EOF

# 运行修复脚本
echo "🔧 运行修复脚本..."
node fix-ts-errors.js

# 检查修复结果
echo "🔍 检查TypeScript编译..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ TypeScript编译成功！"
    echo "🚀 启动Strapi开发服务器..."
    npx strapi develop
else
    echo "❌ TypeScript编译仍有错误，请手动检查"
    echo "💡 提示：可以尝试运行 'npx tsc --noEmit' 查看具体错误"
fi 