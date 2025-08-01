const http = require('http');

const BASE_URL = 'http://118.107.4.158:1337';

// 简单的HTTP GET请求
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// 检查奖品图片
async function checkPrizeImages() {
  try {
    console.log('🔍 检查奖品图片信息...');
    
    // 获取奖品列表
    const response = await makeRequest(`${BASE_URL}/api/choujiang-jiangpins`);
    const prizes = response.data || [];
    
    console.log(`📦 总奖品数量: ${prizes.length}`);
    
    prizes.forEach((prize, index) => {
      console.log(`\n🎁 奖品 ${index + 1}: ${prize.name}`);
      console.log(`   ID: ${prize.id}`);
      console.log(`   中奖概率: ${prize.zhongJiangLv}%`);
      console.log(`   奖品类型: ${prize.jiangpinType}`);
      console.log(`   价值: ${prize.value}`);
      
      if (prize.image) {
        console.log(`   📸 图片信息:`);
        console.log(`     图片ID: ${prize.image.id}`);
        console.log(`     图片名称: ${prize.image.name}`);
        console.log(`     图片URL: ${prize.image.url}`);
        
        if (prize.image.formats) {
          console.log(`     缩略图URL: ${prize.image.formats.thumbnail?.url || '无'}`);
          console.log(`     小图URL: ${prize.image.formats.small?.url || '无'}`);
        }
      } else {
        console.log(`   ❌ 没有图片`);
      }
    });
    
    console.log('\n✅ 奖品图片检查完成');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

// 运行检查
checkPrizeImages(); 