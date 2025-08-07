const { execSync } = require('child_process');

console.log('🔧 提交修复到Git...\n');

try {
  // 添加所有更改
  console.log('添加更改...');
  execSync('git add .', { stdio: 'inherit' });
  
  // 提交修复
  console.log('提交修复...');
  execSync('git commit -m "修复Strapi v5中间件问题 - 移除strapi::users-permissions中间件（v5中由插件自动处理）"', { stdio: 'inherit' });
  
  // 推送到远程仓库
  console.log('推送到远程仓库...');
  execSync('git push origin main', { stdio: 'inherit' });
  
  console.log('\n✅ 修复已成功提交到Git！');
  console.log('🚀 请在服务器上运行以下命令：');
  console.log('cd /root/strapi-v5-ts');
  console.log('git pull');
  console.log('npm run develop');
  
} catch (error) {
  console.error('❌ Git操作失败:', error.message);
} 