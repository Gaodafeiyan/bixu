const fs = require('fs');
const path = require('path');

function checkUploadDirectory() {
  console.log('🔍 检查上传目录...');
  
  const uploadDir = path.join(__dirname, 'bixu', 'public', 'uploads');
  console.log('📁 上传目录路径:', uploadDir);
  
  // 检查目录是否存在
  if (fs.existsSync(uploadDir)) {
    console.log('✅ 上传目录存在');
    
    // 列出目录内容
    const files = fs.readdirSync(uploadDir);
    console.log(`📊 目录中有 ${files.length} 个文件:`);
    
    if (files.length === 0) {
      console.log('⚠️ 目录为空，没有图片文件');
    } else {
      files.forEach(file => {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        console.log(`  📄 ${file} (${stats.size} bytes)`);
      });
    }
  } else {
    console.log('❌ 上传目录不存在');
  }
  
  console.log('\n💡 问题诊断:');
  console.log('   - 后端API返回了图片路径');
  console.log('   - 但实际的图片文件没有上传到服务器');
  console.log('   - 这可能是Strapi文件上传配置问题');
  
  console.log('\n🔧 解决方案:');
  console.log('   1. 检查Strapi的文件上传配置');
  console.log('   2. 确保uploads目录有正确的权限');
  console.log('   3. 重新上传图片文件到后端');
  console.log('   4. 或者使用外部图片存储服务');
  
  console.log('\n📋 建议的修复步骤:');
  console.log('   1. 登录Strapi管理后台');
  console.log('   2. 重新上传banner图片');
  console.log('   3. 检查文件是否保存到正确位置');
  console.log('   4. 测试图片URL是否可访问');
}

// 运行检查
checkUploadDirectory();