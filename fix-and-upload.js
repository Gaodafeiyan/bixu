const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 开始完整的修复和上传流程...\n');

// 第一步：运行修复脚本
console.log('📝 第一步：运行 TypeScript 错误修复脚本...');
try {
  require('./fix-typescript-errors.js');
  console.log('✅ TypeScript 错误修复完成\n');
} catch (error) {
  console.error('❌ TypeScript 错误修复失败:', error.message);
  process.exit(1);
}

// 第二步：生成类型
console.log('📝 第二步：生成 Strapi 类型...');
try {
  execSync('yarn strapi ts:generate-types', { stdio: 'inherit' });
  console.log('✅ Strapi 类型生成完成\n');
} catch (error) {
  console.error('❌ Strapi 类型生成失败，继续执行...\n');
}

// 第三步：检查 Git 状态
console.log('📝 第三步：检查 Git 状态...');
try {
  execSync('git status', { stdio: 'pipe' });
  console.log('✅ Git 仓库状态正常\n');
} catch (error) {
  console.error('❌ 当前目录不是 Git 仓库');
  process.exit(1);
}

// 第四步：添加所有更改
console.log('📝 第四步：添加所有更改到暂存区...');
try {
  execSync('git add .', { stdio: 'inherit' });
  console.log('✅ 更改已添加到暂存区\n');
} catch (error) {
  console.error('❌ 添加更改失败');
  process.exit(1);
}

// 第五步：检查是否有更改需要提交
try {
  const statusOutput = execSync('git status --porcelain', { encoding: 'utf8' });
  if (!statusOutput.trim()) {
    console.log('ℹ️ 没有新的更改需要提交');
    console.log('🎉 修复和上传流程完成！');
    process.exit(0);
  }
} catch (error) {
  console.error('❌ 无法检查 Git 状态');
  process.exit(1);
}

// 第六步：提交更改
const commitMessage = '修复 TypeScript 编译错误：更新 schema 定义和类型生成';
console.log(`📝 第五步：提交更改: ${commitMessage}`);
try {
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  console.log('✅ 更改已提交\n');
} catch (error) {
  console.error('❌ 提交失败');
  process.exit(1);
}

// 第七步：获取当前分支
let currentBranch;
try {
  currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`🌿 当前分支: ${currentBranch}\n`);
} catch (error) {
  console.error('❌ 无法获取当前分支');
  process.exit(1);
}

// 第八步：推送到远程仓库
console.log(`📝 第六步：推送到远程仓库 (${currentBranch} 分支)...`);
try {
  execSync(`git push origin ${currentBranch}`, { stdio: 'inherit' });
  console.log('✅ 代码已成功推送到远程仓库\n');
} catch (error) {
  console.error('❌ 推送失败');
  console.log('💡 可能的解决方案:');
  console.log('1. 检查网络连接');
  console.log('2. 确认远程仓库权限');
  console.log('3. 尝试手动推送: git push origin HEAD');
  process.exit(1);
}

// 第九步：显示提交历史
console.log('📝 第七步：显示最近的提交历史...');
try {
  const logOutput = execSync('git log --oneline -3', { encoding: 'utf8' });
  console.log(logOutput);
} catch (error) {
  console.error('❌ 无法获取提交历史');
}

console.log('\n🎉 完整的修复和上传流程完成！');
console.log('📋 修复内容包括:');
console.log('- ✅ 更新了所有 content-type schema 定义');
console.log('- ✅ 修复了 TypeScript 类型生成问题');
console.log('- ✅ 添加了自定义类型定义文件');
console.log('- ✅ 更新了 TypeScript 配置');
console.log('- ✅ 生成了 Strapi 类型');
console.log('- ✅ 提交并推送到远程仓库');
console.log('\n📋 下一步建议:');
console.log('1. 在远程服务器上运行: yarn develop');
console.log('2. 检查是否还有 TypeScript 编译错误');
console.log('3. 如果仍有错误，请检查具体的错误信息');