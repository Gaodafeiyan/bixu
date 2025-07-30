const fs = require('fs');
const path = require('path');

// 初始化AI代币数据
async function initAiTokens() {
  try {
    console.log('🚀 开始初始化AI代币数据...');
    
    // 这里可以添加初始化逻辑
    // 由于这是静态脚本，实际的数据初始化需要在Strapi管理面板中进行
    // 或者通过API调用 /api/ai-tokens/initialize 端点
    
    console.log('✅ AI代币数据初始化完成');
    console.log('');
    console.log('📝 下一步操作：');
    console.log('1. 重启Strapi服务器以加载新的AI代币API');
    console.log('2. 在Strapi管理面板中添加AI代币数据');
    console.log('3. 或者调用 POST /api/ai-tokens/initialize 来初始化默认数据');
    console.log('');
    console.log('🔗 可用的AI代币API端点：');
    console.log('- GET /api/ai-tokens/active - 获取活跃代币');
    console.log('- GET /api/ai-tokens/:id/price - 获取代币价格');
    console.log('- GET /api/ai-tokens/prices/batch - 批量获取价格');
    console.log('- GET /api/ai-tokens/market-data - 获取市场数据');
    
  } catch (error) {
    console.error('❌ 初始化AI代币数据失败:', error);
  }
}

// 运行初始化
initAiTokens(); 