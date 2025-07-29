const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始上传代码文件到 Git 仓库（排除文档）...');

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

// 定义要上传的文件和目录
const filesToAdd = [
  // 核心代码文件
  'src/**/*.ts',
  'src/**/*.js',
  'src/**/*.json',
  'src/**/*.tsx',
  'src/**/*.jsx',
  
  // 配置文件
  'package.json',
  'yarn.lock',
  'tsconfig.json',
  '.editorconfig',
  '.gitignore',
  
  // 类型定义
  'types/**/*.d.ts',
  'types/**/*.ts',
  
  // 修复脚本（只上传核心的）
  'fix-typescript-errors.js',
  
  // 其他必要文件
  'favicon.png',
  'README.md'
];

// 定义要排除的文件和目录
const filesToExclude = [
  // 文档文件
  '*.md',
  'docs/**/*',
  'documentation/**/*',
  
  // 临时和缓存文件
  '.cache/**/*',
  'dist/**/*',
  'build/**/*',
  '.tmp/**/*',
  'node_modules/**/*',
  
  // 日志文件
  '*.log',
  'logs/**/*',
  
  // 测试文件
  '**/*.test.*',
  '**/*.spec.*',
  'tests/**/*',
  'test/**/*',
  
  // 调试脚本
  'debug_*.js',
  'test_*.js',
  'simple_*.js',
  'check_*.js',
  'get_*.js',
  'create_*.js',
  
  // PowerShell 脚本
  '*.ps1',
  
  // 其他文档
  'TYPESCRIPT_FIX_GUIDE.md',
  'API_DOCUMENTATION.md',
  'DEPLOYMENT_GUIDE_*.md',
  'BLOCKCHAIN_CONFIGURATION_GUIDE.md',
  'RECHARGE_WITHDRAWAL_CHANNEL_API.md',
  'PRODUCTION_DEPLOYMENT.md',
  'SERVER_FIX_GUIDE.md',
  'CODE_REVIEW.md',
  'PROJECT_SUMMARY.md',
  'TESTING.md',
  'FIX_SUMMARY.md',
  'AUTHENTICATION_ISSUE_ANALYSIS.md',
  'AUTH_FIX_SUGGESTIONS.md',
  'API_TEST_REPORT.md',
  'HIGH_PRIORITY_FIXES.md',
  'LOTTERY_TEST_REPORT.md',
  'ADMIN_PANEL_MISSING_FEATURES_ANALYSIS.md',
  'AI_TOKEN_PRICE_CONVERSION.md',
  'BIXU_INTEGRATION_GUIDE.md',
  '后端认购计划完整对接文档.md'
];

console.log('📦 添加指定的代码文件到暂存区...');

// 先重置暂存区
try {
  execSync('git reset', { stdio: 'inherit' });
  console.log('✅ 重置暂存区');
} catch (error) {
  console.error('❌ 重置暂存区失败');
  process.exit(1);
}

// 添加指定的文件
for (const pattern of filesToAdd) {
  try {
    execSync(`git add "${pattern}"`, { stdio: 'inherit' });
    console.log(`✅ 添加文件: ${pattern}`);
  } catch (error) {
    console.log(`⚠️ 跳过文件: ${pattern} (可能不存在)`);
  }
}

// 从暂存区移除要排除的文件
for (const pattern of filesToExclude) {
  try {
    execSync(`git reset "${pattern}"`, { stdio: 'inherit' });
    console.log(`✅ 排除文件: ${pattern}`);
  } catch (error) {
    // 忽略错误，文件可能不在暂存区
  }
}

// 检查暂存区的文件
console.log('\n📋 暂存区的文件:');
try {
  const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' });
  if (stagedFiles.trim()) {
    console.log(stagedFiles);
  } else {
    console.log('ℹ️ 暂存区为空');
  }
} catch (error) {
  console.log('ℹ️ 暂存区为空');
}

// 检查是否有更改需要提交
try {
  const statusOutput = execSync('git status --porcelain', { encoding: 'utf8' });
  if (!statusOutput.trim()) {
    console.log('ℹ️ 没有新的更改需要提交');
    console.log('🎉 上传流程完成！');
    process.exit(0);
  }
} catch (error) {
  console.error('❌ 无法检查 Git 状态');
  process.exit(1);
}

// 提交更改
const commitMessage = '修复 TypeScript 编译错误：更新 schema 定义和类型生成';
console.log(`\n💾 提交更改: ${commitMessage}`);
try {
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  console.log('✅ 更改已提交');
} catch (error) {
  console.error('❌ 提交失败');
  process.exit(1);
}

// 推送到远程仓库
console.log(`\n🚀 推送到远程仓库 (${currentBranch} 分支)...`);
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
  const logOutput = execSync('git log --oneline -3', { encoding: 'utf8' });
  console.log(logOutput);
} catch (error) {
  console.error('❌ 无法获取提交历史');
}

console.log('\n🎉 代码上传完成！');
console.log('📋 上传内容包括:');
console.log('- ✅ 所有 src/ 目录下的代码文件');
console.log('- ✅ 配置文件 (package.json, tsconfig.json 等)');
console.log('- ✅ 类型定义文件');
console.log('- ✅ 修复脚本');
console.log('- ❌ 排除了所有文档文件');
console.log('- ❌ 排除了调试和测试文件');