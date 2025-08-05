const axios = require('axios');

const BASE_URL = 'http://localhost:1337/api';

// 测试Banner API
async function testBannerAPI() {
  console.log('🎨 测试Banner API...');
  
  try {
    // 获取活跃的Banner列表
    const bannersResponse = await axios.get(`${BASE_URL}/banners/active`);
    console.log('✅ 获取活跃Banner列表成功');
    console.log(`📊 找到 ${bannersResponse.data.data.length} 个活跃Banner`);
    
    if (bannersResponse.data.data.length > 0) {
      const firstBanner = bannersResponse.data.data[0];
      console.log(`📋 第一个Banner: ${firstBanner.title}`);
      
      // 获取Banner详情
      const bannerDetailResponse = await axios.get(`${BASE_URL}/banners/${firstBanner.id}`);
      console.log('✅ 获取Banner详情成功');
      console.log(`📋 Banner详情: ${bannerDetailResponse.data.data.title}`);
    }
    
  } catch (error) {
    console.error('❌ Banner API测试失败:', error.response?.data || error.message);
  }
}

// 测试产品介绍 API
async function testProductIntroAPI() {
  console.log('📦 测试产品介绍 API...');
  
  try {
    // 获取活跃的产品介绍列表
    const productsResponse = await axios.get(`${BASE_URL}/product-intros/active`);
    console.log('✅ 获取活跃产品介绍列表成功');
    console.log(`📊 找到 ${productsResponse.data.data.length} 个活跃产品介绍`);
    
    if (productsResponse.data.data.length > 0) {
      const firstProduct = productsResponse.data.data[0];
      console.log(`📋 第一个产品: ${firstProduct.productName}`);
      
      // 获取产品详情
      const productDetailResponse = await axios.get(`${BASE_URL}/product-intros/${firstProduct.id}`);
      console.log('✅ 获取产品详情成功');
      console.log(`📋 产品详情: ${productDetailResponse.data.data.productName}`);
      
      // 根据名称获取产品
      const productByNameResponse = await axios.get(`${BASE_URL}/product-intros/name/草本多肽`);
      console.log('✅ 根据名称获取产品成功');
      console.log(`📋 找到产品: ${productByNameResponse.data.data.productName}`);
      
      // 显示产品成分信息
      if (productDetailResponse.data.data.ingredients) {
        console.log('🔬 产品成分:');
        productDetailResponse.data.data.ingredients.forEach((ingredient, index) => {
          console.log(`  ${index + 1}. ${ingredient.name} - ${ingredient.description}`);
          if (ingredient.isImported) console.log(`     🌍 进口成分`);
          if (ingredient.hasPatent) console.log(`     📜 专利: ${ingredient.patentInfo}`);
        });
      }
      
      // 显示产品功效
      if (productDetailResponse.data.data.benefits) {
        console.log('✨ 产品功效:');
        productDetailResponse.data.data.benefits.forEach((benefit, index) => {
          console.log(`  ${index + 1}. ${benefit.icon} ${benefit.title} - ${benefit.description}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ 产品介绍 API测试失败:', error.response?.data || error.message);
  }
}

// 测试完整流程
async function testCompleteFlow() {
  console.log('🚀 测试完整流程...');
  
  try {
    // 1. 获取Banner列表
    console.log('\n1️⃣ 获取Banner列表');
    const bannersResponse = await axios.get(`${BASE_URL}/banners/active`);
    console.log(`✅ 获取到 ${bannersResponse.data.data.length} 个Banner`);
    
    // 2. 获取产品介绍列表
    console.log('\n2️⃣ 获取产品介绍列表');
    const productsResponse = await axios.get(`${BASE_URL}/product-intros/active`);
    console.log(`✅ 获取到 ${productsResponse.data.data.length} 个产品介绍`);
    
    // 3. 获取特定产品详情
    console.log('\n3️⃣ 获取产品详情');
    if (productsResponse.data.data.length > 0) {
      const product = productsResponse.data.data[0];
      const productDetailResponse = await axios.get(`${BASE_URL}/product-intros/${product.id}`);
      console.log(`✅ 产品详情获取成功: ${productDetailResponse.data.data.productName}`);
      
      // 显示产品亮点
      if (productDetailResponse.data.data.highlights) {
        console.log('🏆 产品亮点:');
        const highlights = productDetailResponse.data.data.highlights;
        console.log(`  - ${highlights.patents}项专利`);
        console.log(`  - ${highlights.importedIngredients}项进口成分`);
        console.log(`  - ${highlights.prebiotics}大益生元`);
        console.log(`  - 益生菌: ${highlights.probiotics}`);
        console.log(`  - ${highlights.peptidePatents}大肽类专利认证`);
      }
    }
    
    console.log('\n✅ 完整流程测试成功！');
    
  } catch (error) {
    console.error('❌ 完整流程测试失败:', error.response?.data || error.message);
  }
}

// 主函数
async function main() {
  console.log('🧪 开始API测试...\n');
  
  try {
    await testBannerAPI();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await testProductIntroAPI();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await testCompleteFlow();
    
    console.log('\n🎉 所有测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  }
}

// 运行测试
if (require.main === module) {
  main();
}

module.exports = { testBannerAPI, testProductIntroAPI, testCompleteFlow }; 