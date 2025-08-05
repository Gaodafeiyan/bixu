const fs = require('fs');
const path = require('path');

// 读取修复后的banner controller
const bannerControllerPath = path.join(__dirname, 'src/api/banner/controllers/banner.ts');
const bannerControllerContent = fs.readFileSync(bannerControllerPath, 'utf8');

console.log('🔧 Banner Controller 修复内容:');
console.log('='.repeat(50));
console.log(bannerControllerContent);
console.log('='.repeat(50));

// 创建上传脚本
const uploadScript = `
#!/bin/bash

echo "🚀 开始上传 Banner Controller 修复..."

# 备份原文件
ssh root@118.107.4.158 "cd /root/strapi-v5-ts && cp src/api/banner/controllers/banner.ts src/api/banner/controllers/banner.ts.backup"

# 上传修复后的文件
scp src/api/banner/controllers/banner.ts root@118.107.4.158:/root/strapi-v5-ts/src/api/banner/controllers/banner.ts

# 重启服务
ssh root@118.107.4.158 "cd /root/strapi-v5-ts && pm2 restart strapi"

echo "✅ Banner Controller 修复上传完成！"
echo "📝 修复内容："
echo "- 添加了 create() 方法"
echo "- 添加了 find() 方法" 
echo "- 添加了 update() 方法"
echo "- 添加了 delete() 方法"
echo "- 保留了自定义的 getActiveBanners() 和 getBannerDetail() 方法"
`;

fs.writeFileSync('upload_banner_fix.sh', uploadScript);

console.log('📁 已创建上传脚本: upload_banner_fix.sh');
console.log('💡 运行以下命令上传修复:');
console.log('   chmod +x upload_banner_fix.sh');
console.log('   ./upload_banner_fix.sh'); 