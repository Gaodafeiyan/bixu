const axios = require('axios');

// 配置
const BASE_URL = 'http://localhost:1337';
const TEST_USER = {
  email: 'test@example.com',
  password: 'test123456'
};

let authToken = null;

// 登录获取token
async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: TEST_USER.email,
      password: TEST_USER.password
    });
    
    authToken = response.data.jwt;
    console.log('✅ 登录成功');
    return true;
  } catch (error) {
    console.error('❌ 登录失败:', error.response?.data || error.message);
    return false;
  }
}

// 获取购物车
async function getCart() {
  try {
    const response = await axios.get(`${BASE_URL}/api/shop-carts`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 获取购物车成功:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ 获取购物车失败:', error.response?.data || error.message);
    return null;
  }
}

// 获取购物车数量
async function getCartCount() {
  try {
    const response = await axios.get(`${BASE_URL}/api/shop-carts/count`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 获取购物车数量成功:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ 获取购物车数量失败:', error.response?.data || error.message);
    return null;
  }
}

// 添加商品到购物车
async function addToCart(productId = 1, quantity = 1) {
  try {
    const response = await axios.post(`${BASE_URL}/api/shop-carts`, {
      productId,
      quantity
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 添加到购物车成功:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ 添加到购物车失败:', error.response?.data || error.message);
    return null;
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试购物车显示修复...\n');

  // 1. 登录
  if (!await login()) {
    console.log('❌ 登录失败，无法继续测试');
    return;
  }

  // 2. 获取当前购物车
  console.log('\n📋 1. 获取当前购物车');
  const cartData = await getCart();
  if (!cartData) return;

  // 3. 获取购物车数量
  console.log('\n🔢 2. 获取购物车数量');
  const countData = await getCartCount();
  if (!countData) return;

  // 4. 添加商品到购物车
  console.log('\n🛒 3. 添加商品到购物车');
  const addResult = await addToCart(1, 2);
  if (!addResult) return;

  // 5. 再次获取购物车
  console.log('\n📋 4. 再次获取购物车');
  const updatedCart = await getCart();
  if (!updatedCart) return;

  // 6. 再次获取购物车数量
  console.log('\n🔢 5. 再次获取购物车数量');
  const updatedCount = await getCartCount();
  if (!updatedCount) return;

  console.log('\n✅ 测试完成！');
  console.log('📊 测试结果:');
  console.log(`- 购物车商品数量: ${updatedCart.data?.length || 0}`);
  console.log(`- 购物车总数量: ${updatedCount.data?.count || 0}`);
}

// 运行测试
runTests().catch(console.error); 