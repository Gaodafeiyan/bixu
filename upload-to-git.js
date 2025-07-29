const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始上传修复后的代码到 Git 仓库...');

// 检查当前目录
const currentDir = process.cwd();
console.log(`📍 当前目录: ${currentDir}`);

// 检查是否是 Git 仓库
try {
  execSync('git status', { stdio: 'pipe' });
  console.log('✅ 确认是 Git 仓库');
} catch (error) {
  console.error('❌ 当前目录不是 Git 仓库');
  process.exit(1);
}

// 检查远程仓库
try {
  const remoteOutput = execSync('git remote -v', { encoding: 'utf8' });
  console.log('📡 远程仓库信息:');
  console.log(remoteOutput);
} catch (error) {
  console.error('❌ 无法获取远程仓库信息');
  process.exit(1);
}

// 获取当前分支
const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
console.log(`🌿 当前分支: ${currentBranch}`);

// 检查是否有未提交的更改
try {
  const statusOutput = execSync('git status --porcelain', { encoding: 'utf8' });
  if (statusOutput.trim()) {
    console.log('📝 检测到未提交的更改:');
    console.log(statusOutput);
  } else {
    console.log('✅ 没有未提交的更改');
  }
} catch (error) {
  console.error('❌ 无法检查 Git 状态');
  process.exit(1);
}

// 添加所有更改
console.log('📦 添加所有更改到暂存区...');
try {
  execSync('git add .', { stdio: 'inherit' });
  console.log('✅ 更改已添加到暂存区');
} catch (error) {
  console.error('❌ 添加更改失败');
  process.exit(1);
}

// 提交更改
const commitMessage = '修复 TypeScript 编译错误：更新 schema 定义和类型生成';
console.log(`💾 提交更改: ${commitMessage}`);
try {
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  console.log('✅ 更改已提交');
} catch (error) {
  console.error('❌ 提交失败');
  process.exit(1);
}

// 推送到远程仓库
console.log(`🚀 推送到远程仓库 (${currentBranch} 分支)...`);
try {
  execSync(`git push origin ${currentBranch}`, { stdio: 'inherit' });
  console.log('✅ 代码已成功推送到远程仓库');
} catch (error) {
  console.error('❌ 推送失败');
  console.log('💡 可能的解决方案:');
  console.log('1. 检查网络连接');
  console.log('2. 确认远程仓库权限');
  console.log('3. 尝试: git push origin HEAD');
  process.exit(1);
}

// 显示提交历史
console.log('\n📋 最近的提交历史:');
try {
  const logOutput = execSync('git log --oneline -5', { encoding: 'utf8' });
  console.log(logOutput);
} catch (error) {
  console.error('❌ 无法获取提交历史');
}

console.log('\n🎉 Git 操作完成！');
console.log('📋 修复内容包括:');
console.log('- 更新了所有 content-type schema 定义');
console.log('- 修复了 TypeScript 类型生成问题');
console.log('- 添加了自定义类型定义文件');
console.log('- 更新了 TypeScript 配置');