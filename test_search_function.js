const axios = require('axios');

// 配置
const BASE_URL = 'http://localhost:1337';

// 测试搜索功能
async function testSearch() {
  console.log('🔍 开始测试搜索功能...\n');

  try {
    // 1. 测试搜索"杜康酒"
    console.log('📋 1. 搜索"杜康酒"');
    const searchResult1 = await axios.get(`${BASE_URL}/api/shop-products`, {
      params: {
        search: '杜康酒',
        page: 1,
        pageSize: 10
      }
    });
    
    console.log('✅ 搜索"杜康酒"结果:');
    console.log(`- 找到商品数量: ${searchResult1.data.data.results?.length || 0}`);
    if (searchResult1.data.data.results?.length > 0) {
      searchResult1.data.data.results.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - ${product.price} USDT`);
      });
    }
    console.log('');

    // 2. 测试搜索"苹果"
    console.log('📋 2. 搜索"苹果"');
    const searchResult2 = await axios.get(`${BASE_URL}/api/shop-products`, {
      params: {
        search: '苹果',
        page: 1,
        pageSize: 10
      }
    });
    
    console.log('✅ 搜索"苹果"结果:');
    console.log(`- 找到商品数量: ${searchResult2.data.data.results?.length || 0}`);
    if (searchResult2.data.data.results?.length > 0) {
      searchResult2.data.data.results.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - ${product.price} USDT`);
      });
    }
    console.log('');

    // 3. 测试搜索不存在的商品
    console.log('📋 3. 搜索"不存在的商品"');
    const searchResult3 = await axios.get(`${BASE_URL}/api/shop-products`, {
      params: {
        search: '不存在的商品',
        page: 1,
        pageSize: 10
      }
    });
    
    console.log('✅ 搜索"不存在的商品"结果:');
    console.log(`- 找到商品数量: ${searchResult3.data.data.results?.length || 0}`);
    console.log('');

    // 4. 测试不带搜索参数（获取全部商品）
    console.log('📋 4. 获取全部商品（无搜索参数）');
    const allProducts = await axios.get(`${BASE_URL}/api/shop-products`, {
      params: {
        page: 1,
        pageSize: 10
      }
    });
    
    console.log('✅ 全部商品结果:');
    console.log(`- 商品总数: ${allProducts.data.data.results?.length || 0}`);
    if (allProducts.data.data.results?.length > 0) {
      allProducts.data.data.results.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - ${product.price} USDT`);
      });
    }

    console.log('\n✅ 搜索功能测试完成！');
    
  } catch (error) {
    console.error('❌ 搜索功能测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testSearch().catch(console.error); 