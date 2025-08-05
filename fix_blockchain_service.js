const fs = require('fs');
const path = require('path');

// 读取文件
const filePath = path.join(__dirname, 'src/api/recharge-channel/services/blockchain-service.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 替换所有的 strapi.entityService 为 strapiInstance.entityService
content = content.replace(/strapi\.entityService/g, 'strapiInstance.entityService');

// 写回文件
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ 已修复 blockchain-service.ts 中的 strapi 引用问题'); 