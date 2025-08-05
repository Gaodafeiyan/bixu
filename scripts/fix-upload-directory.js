const fs = require('fs');
const path = require('path');

console.log('🔧 修复上传目录...');

// 确保uploads目录存在
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ 创建uploads目录');
} else {
  console.log('✅ uploads目录已存在');
}

// 检查目录权限
try {
  fs.accessSync(uploadsDir, fs.constants.W_OK);
  console.log('✅ uploads目录可写');
} catch (error) {
  console.log('❌ uploads目录不可写，请检查权限');
}

console.log('🔧 上传目录修复完成'); 