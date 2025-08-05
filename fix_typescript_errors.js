const fs = require('fs');
const path = require('path');

// 修复merge conflict标记的脚本
function fixMergeConflicts() {
  console.log('🔧 开始修复merge conflict标记...');
  
  const filePath = path.join(__dirname, 'bixu', 'src', 'api', 'recharge-channel', 'services', 'blockchain-service.ts');
  
  try {
    // 读取文件内容
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 检查是否存在merge conflict标记
    const hasConflictMarkers = content.includes('<<<<<<< HEAD') || 
                              content.includes('=======') || 
                              content.includes('>>>>>>>');
    
    if (!hasConflictMarkers) {
      console.log('✅ 文件中没有发现merge conflict标记');
      return;
    }
    
    console.log('⚠️ 发现merge conflict标记，开始修复...');
    
    // 移除所有merge conflict标记
    // 保留HEAD分支的内容（通常是当前分支）
    content = content.replace(/<<<<<<< HEAD\n([\s\S]*?)\n=======\n[\s\S]*?\n>>>>>>> [^\n]*\n/g, '$1');
    
    // 移除单独的冲突标记
    content = content.replace(/<<<<<<< HEAD\n/g, '');
    content = content.replace(/=======\n/g, '');
    content = content.replace(/>>>>>>> [^\n]*\n/g, '');
    
    // 写回文件
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log('✅ merge conflict标记已修复');
    
    // 验证修复结果
    const newContent = fs.readFileSync(filePath, 'utf8');
    const stillHasMarkers = newContent.includes('<<<<<<< HEAD') || 
                           newContent.includes('=======') || 
                           newContent.includes('>>>>>>>');
    
    if (stillHasMarkers) {
      console.log('⚠️ 仍有残留的冲突标记，请手动检查');
    } else {
      console.log('✅ 文件已完全清理');
    }
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

// 运行修复
fixMergeConflicts();