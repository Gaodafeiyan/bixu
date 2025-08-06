const fs = require('fs');
const path = require('path');

function fixStrapiConfig() {
  console.log('🔧 开始修复Strapi配置...');
  
  const strapiDir = '/root/strapi-v5-ts';
  const uploadsDir = path.join(strapiDir, 'bixu', 'public', 'uploads');
  
  console.log('📁 检查目录结构...');
  
  // 检查并创建目录
  const dirs = [
    path.join(strapiDir, 'bixu'),
    path.join(strapiDir, 'bixu', 'public'),
    uploadsDir
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      console.log(`📁 创建目录: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ 目录已创建: ${dir}`);
    } else {
      console.log(`✅ 目录已存在: ${dir}`);
    }
  });
  
  // 检查uploads目录权限
  try {
    const stats = fs.statSync(uploadsDir);
    console.log(`📊 uploads目录权限: ${stats.mode.toString(8)}`);
    console.log(`📊 uploads目录所有者: ${stats.uid}`);
  } catch (error) {
    console.log('❌ 无法获取目录权限信息');
  }
  
  // 列出uploads目录内容
  try {
    const files = fs.readdirSync(uploadsDir);
    console.log(`📊 uploads目录中有 ${files.length} 个文件:`);
    files.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      console.log(`  📄 ${file} (${stats.size} bytes)`);
    });
  } catch (error) {
    console.log('❌ 无法读取uploads目录内容');
  }
  
  console.log('\n✅ Strapi配置修复完成！');
  console.log('\n📋 下一步操作:');
  console.log('1. 重启Strapi服务');
  console.log('2. 登录Strapi管理后台 (https://zenithus.app/admin)');
  console.log('3. 重新上传banner图片');
  console.log('4. 测试图片URL是否可访问');
}

// 运行修复
fixStrapiConfig();