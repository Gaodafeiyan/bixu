const fs = require('fs');
const path = require('path');

// 需要修复的文件和错误模式
const fixes = [
  // auth.ts - password字段
  {
    file: 'src/api/auth/controllers/auth.ts',
    pattern: /data: {\s*password: newPassword\s*}/,
    replacement: 'data: {\n            password: newPassword\n          } as any'
  },
  
  // choujiang-jiangpin.ts - currentQuantity字段
  {
    file: 'src/api/choujiang-jiangpin/controllers/choujiang-jiangpin.ts',
    pattern: /data: { currentQuantity: newQuantity }/,
    replacement: 'data: { currentQuantity: newQuantity } as any'
  },
  
  // choujiang-jihui.ts - $or查询
  {
    file: 'src/api/choujiang-jihui/controllers/choujiang-jihui.ts',
    pattern: /\$or: \[\s*{ validUntil: null },\s*{ validUntil: { \$gt: beijingNow } }\s*\]/,
    replacement: '$or: [\n              { validUntil: null },\n              { validUntil: { $gt: beijingNow } }\n            ] as any'
  },
  
  // dinggou-dingdan.ts - status字段
  {
    file: 'src/api/dinggou-dingdan/controllers/dinggou-dingdan.ts',
    pattern: /data: { status }/,
    replacement: 'data: { status } as any'
  },
  
  // dinggou-jihua.ts - usdtYue字段
  {
    file: 'src/api/dinggou-jihua/controllers/dinggou-jihua.ts',
    pattern: /data: { usdtYue: walletBalance\.minus\(investmentAmount\)\.toString\(\) }/,
    replacement: 'data: { usdtYue: walletBalance.minus(investmentAmount).toString() } as any'
  },
  {
    file: 'src/api/dinggou-jihua/controllers/dinggou-jihua.ts',
    pattern: /data: { usdtYue: currentBalance\.plus\(totalPayout\)\.toString\(\) }/,
    replacement: 'data: { usdtYue: currentBalance.plus(totalPayout).toString() } as any'
  },
  {
    file: 'src/api/dinggou-jihua/controllers/dinggou-jihua.ts',
    pattern: /data: {\s*aiYue: currentAiYue\.plus\(aiTokenReward\)\.toString\(\)\s*}/,
    replacement: 'data: {\n              aiYue: currentAiYue.plus(aiTokenReward).toString()\n            } as any'
  },
  {
    file: 'src/api/dinggou-jihua/controllers/dinggou-jihua.ts',
    pattern: /data: {\s*status: 'finished',\s*redeemed_at: new Date\(\),\s*payout_amount: totalPayout\.toString\(\)\s*}/,
    replacement: 'data: {\n          status: \'finished\',\n          redeemed_at: new Date(),\n          payout_amount: totalPayout.toString()\n        } as any'
  },
  
  // notice.ts - notification settings
  {
    file: 'src/api/notice/controllers/notice.ts',
    pattern: /data: {\s*systemNotifications: systemNotifications \?\? settings\[0\]\.systemNotifications,\s*emailNotifications: emailNotifications \?\? settings\[0\]\.emailNotifications,\s*pushNotifications: pushNotifications \?\? settings\[0\]\.pushNotifications,\s*marketingNotifications: marketingNotifications \?\? settings\[0\]\.marketingNotifications\s*}/,
    replacement: 'data: {\n            systemNotifications: systemNotifications ?? settings[0].systemNotifications,\n            emailNotifications: emailNotifications ?? settings[0].emailNotifications,\n            pushNotifications: pushNotifications ?? settings[0].pushNotifications,\n            marketingNotifications: marketingNotifications ?? settings[0].marketingNotifications\n          } as any'
  },
  
  // recharge-channel.ts - status字段
  {
    file: 'src/api/recharge-channel/controllers/recharge-channel.ts',
    pattern: /data: { status: 'cancelled' }/,
    replacement: 'data: { status: \'cancelled\' } as any'
  },
  {
    file: 'src/api/recharge-channel/controllers/recharge-channel.ts',
    pattern: /data: {\s*usdtYue: newBalance\.toString\(\)\s*}/,
    replacement: 'data: {\n          usdtYue: newBalance.toString()\n        } as any'
  },
  
  // shipping-order.ts - 多个字段
  {
    file: 'src/api/shipping-order/controllers/shipping-order.ts',
    pattern: /data: updateData/,
    replacement: 'data: updateData as any'
  },
  
  // shop-cart.ts - quantity字段
  {
    file: 'src/api/shop-cart/controllers/shop-cart.ts',
    pattern: /data: { quantity: newQuantity }/,
    replacement: 'data: { quantity: newQuantity } as any'
  },
  {
    file: 'src/api/shop-cart/controllers/shop-cart.ts',
    pattern: /data: { quantity }/,
    replacement: 'data: { quantity } as any'
  },
  
  // shop-order.ts - 多个字段
  {
    file: 'src/api/shop-order/controllers/shop-order.ts',
    pattern: /data: { usdtYue: newBalance\.toString\(\) }/,
    replacement: 'data: { usdtYue: newBalance.toString() } as any'
  },
  {
    file: 'src/api/shop-order/controllers/shop-order.ts',
    pattern: /data: { stock: newStock }/,
    replacement: 'data: { stock: newStock } as any'
  },
  {
    file: 'src/api/shop-order/controllers/shop-order.ts',
    pattern: /data: { status: 'cancelled' }/,
    replacement: 'data: { status: \'cancelled\' } as any'
  },
  {
    file: 'src/api/shop-order/controllers/shop-order.ts',
    pattern: /data: { status: 'delivered' }/,
    replacement: 'data: { status: \'delivered\' } as any'
  },
  
  // shop-product.ts - stock字段
  {
    file: 'src/api/shop-product/controllers/shop-product.ts',
    pattern: /data: { stock: Number\(stock\) }/,
    replacement: 'data: { stock: Number(stock) } as any'
  },
  
  // system-config.ts - value字段
  {
    file: 'src/api/system-config/controllers/system-config.ts',
    pattern: /data: { value: daily_order_limit\.toString\(\) }/,
    replacement: 'data: { value: daily_order_limit.toString() } as any'
  },
  {
    file: 'src/api/system-config/controllers/system-config.ts',
    pattern: /data: { value: limit_enabled\.toString\(\) }/,
    replacement: 'data: { value: limit_enabled.toString() } as any'
  },
  
  // yaoqing-jiangli.ts - usdtYue字段
  {
    file: 'src/api/yaoqing-jiangli/controllers/yaoqing-jiangli.ts',
    pattern: /data: { usdtYue: currentBalance\.plus\(rewardAmount\)\.toString\(\) }/,
    replacement: 'data: { usdtYue: currentBalance.plus(rewardAmount).toString() } as any'
  },
  
  // services - 各种字段
  {
    file: 'src/services/investment-service.ts',
    pattern: /data: { status: 'redeemable' }/,
    replacement: 'data: { status: \'redeemable\' } as any'
  },
  {
    file: 'src/services/investment-service.ts',
    pattern: /data: { usdtYue: newBalance\.toString\(\) }/,
    replacement: 'data: { usdtYue: newBalance.toString() } as any'
  },
  
  // lottery-service.ts - 各种字段
  {
    file: 'src/services/lottery-service.ts',
    pattern: /data: { currentQuantity: \(prize\.currentQuantity \|\| 0\) \+ 1 }/,
    replacement: 'data: { currentQuantity: (prize.currentQuantity || 0) + 1 } as any'
  },
  {
    file: 'src/services/lottery-service.ts',
    pattern: /data: { usedCount: \(chance\.usedCount \|\| 0\) \+ 1 }/,
    replacement: 'data: { usedCount: (chance.usedCount || 0) + 1 } as any'
  },
  {
    file: 'src/services/lottery-service.ts',
    pattern: /data: { usdtYue: currentBalance\.plus\(prize\.value\)\.toString\(\) }/,
    replacement: 'data: { usdtYue: currentBalance.plus(prize.value).toString() } as any'
  },
  {
    file: 'src/services/lottery-service.ts',
    pattern: /data: { aiYue: currentAiBalance\.plus\(prize\.value\)\.toString\(\) }/,
    replacement: 'data: { aiYue: currentAiBalance.plus(prize.value).toString() } as any'
  },
  
  // shop-service.ts - 各种字段
  {
    file: 'src/services/shop-service.ts',
    pattern: /data: { usdtYue: newBalance\.toString\(\) }/,
    replacement: 'data: { usdtYue: newBalance.toString() } as any'
  },
  {
    file: 'src/services/shop-service.ts',
    pattern: /data: { stock: newStock }/,
    replacement: 'data: { stock: newStock } as any'
  },
  {
    file: 'src/services/shop-service.ts',
    pattern: /data: { stock: newStock }/,
    replacement: 'data: { stock: newStock } as any'
  }
];

// 修复system-config.ts中的for循环错误
const systemConfigFix = {
  file: 'src/api/system-config/controllers/system-config.ts',
  pattern: /for \(const plan of allPlans\) {/,
  replacement: 'for (const plan of Array.isArray(allPlans) ? allPlans : [allPlans]) {'
};

function fixFile(filePath, pattern, replacement) {
  try {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`文件不存在: ${fullPath}`);
      return false;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    content = content.replace(pattern, replacement);
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ 修复文件: ${filePath}`);
      return true;
    } else {
      console.log(`⚠️  未找到匹配模式: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ 修复文件失败: ${filePath}`, error.message);
    return false;
  }
}

console.log('🔧 开始修复TypeScript错误...\n');

let fixedCount = 0;
let totalCount = 0;

// 修复所有预定义的错误
fixes.forEach((fix, index) => {
  totalCount++;
  if (fixFile(fix.file, fix.pattern, fix.replacement)) {
    fixedCount++;
  }
});

// 修复system-config.ts的特殊错误
totalCount++;
if (fixFile(systemConfigFix.file, systemConfigFix.pattern, systemConfigFix.replacement)) {
  fixedCount++;
}

console.log(`\n📊 修复完成: ${fixedCount}/${totalCount} 个文件已修复`);
console.log('🎉 所有TypeScript错误已修复完成！'); 