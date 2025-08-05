const fs = require('fs');
const path = require('path');

console.log('🔍 检查图片文件状态...');

// 检查uploads目录
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
console.log(`📁 uploads目录: ${uploadsDir}`);

if (fs.existsSync(uploadsDir)) {
  const files = fs.readdirSync(uploadsDir);
  console.log(`📄 找到 ${files.length} 个文件:`);
  files.forEach(file => {
    const filePath = path.join(uploadsDir, file);
    const stats = fs.statSync(filePath);
    console.log(`  - ${file} (${stats.size} bytes)`);
  });
} else {
  console.log('❌ uploads目录不存在');
}

// 检查可能的其他图片目录
const possibleDirs = [
  path.join(__dirname, '..', 'uploads'),
  path.join(__dirname, '..', 'static', 'uploads'),
  path.join(__dirname, '..', 'assets', 'uploads'),
];

possibleDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 发现其他图片目录: ${dir}`);
    const files = fs.readdirSync(dir);
    console.log(`  📄 包含 ${files.length} 个文件`);
  }
});

console.log('🔍 图片文件检查完成'); 