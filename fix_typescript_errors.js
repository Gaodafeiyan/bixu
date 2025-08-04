const fs = require('fs');
const path = require('path');

console.log('🔧 开始最终修复区块链服务中的strapi引用...');

const filePath = path.join(__dirname, 'src/api/recharge-channel/services/blockchain-service.ts');

if (!fs.existsSync(filePath)) {
  console.log('❌ 文件不存在:', filePath);
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// 修复所有的 this.strapi 为 strapiInstance
const patterns = [
  {
    regex: /this\.strapi\.entityService\.findMany/g,
    replacement: 'strapiInstance.entityService.findMany'
  },
  {
    regex: /this\.strapi\.entityService\.findOne/g,
    replacement: 'strapiInstance.entityService.findOne'
  },
  {
    regex: /this\.strapi\.entityService\.update/g,
    replacement: 'strapiInstance.entityService.update'
  },
  {
    regex: /this\.strapi\.entityService\.create/g,
    replacement: 'strapiInstance.entityService.create'
  }
];

let modified = false;
patterns.forEach(pattern => {
  const newContent = content.replace(pattern.regex, pattern.replacement);
  if (newContent !== content) {
    content = newContent;
    modified = true;
  }
});

if (modified) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ 修复完成: blockchain-service.ts');
} else {
  console.log('⚠️ 未找到需要修复的模式');
}

console.log('🎉 区块链服务strapi引用最终修复完成！');