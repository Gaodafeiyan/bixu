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
    console.log('✅ 获取购物车成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 获取购物车失败:', error.response?.data || error.message);
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
    console.log('✅ 添加到购物车成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 添加到购物车失败:', error.response?.data || error.message);
    return null;
  }
}

// 更新购物车商品数量
async function updateCartItem(cartItemId, quantity) {
  try {
    const response = await axios.put(`${BASE_URL}/api/shop-carts/${cartItemId}`, {
      quantity
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 更新购物车成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 更新购物车失败:', error.response?.data || error.message);
    return null;
  }
}

// 删除购物车商品
async function removeFromCart(cartItemId) {
  try {
    const response = await axios.delete(`${BASE_URL}/api/shop-carts/${cartItemId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 删除购物车商品成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 删除购物车商品失败:', error.response?.data || error.message);
    return null;
  }
}

// 清空购物车
async function clearCart() {
  try {
    const response = await axios.delete(`${BASE_URL}/api/shop-carts/clear`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 清空购物车成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 清空购物车失败:', error.response?.data || error.message);
    return null;
  }
}

// 创建订单
async function createOrderFromCart(cartItemIds, shippingAddress) {
  try {
    const response = await axios.post(`${BASE_URL}/api/shop-orders/from-cart`, {
      cartItemIds,
      shippingAddress
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 创建订单成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 创建订单失败:', error.response?.data || error.message);
    return null;
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试购物车功能修复...\n');

  // 1. 登录
  if (!await login()) {
    console.log('❌ 登录失败，无法继续测试');
    return;
  }

  // 2. 获取当前购物车
  console.log('\n📋 1. 获取当前购物车');
  const cartData = await getCart();
  if (!cartData) return;

  // 3. 添加商品到购物车
  console.log('\n🛒 2. 添加商品到购物车');
  const addResult = await addToCart(1, 2);
  if (!addResult) return;

  // 4. 再次获取购物车
  console.log('\n📋 3. 再次获取购物车');
  const updatedCart = await getCart();
  if (!updatedCart) return;

  // 5. 测试更新购物车商品数量
  if (updatedCart.data && updatedCart.data.length > 0) {
    const cartItem = updatedCart.data[0];
    console.log('\n🔄 4. 测试更新购物车商品数量');
    await updateCartItem(cartItem.id, 3);
  }

  // 6. 测试清空购物车
  console.log('\n🗑️ 5. 测试清空购物车');
  await clearCart();

  // 7. 验证购物车已清空
  console.log('\n📋 6. 验证购物车已清空');
  const emptyCart = await getCart();
  if (emptyCart && (!emptyCart.data || emptyCart.data.length === 0)) {
    console.log('✅ 购物车已成功清空');
  }

  // 8. 测试订单创建
  console.log('\n📦 7. 测试订单创建');
  await addToCart(1, 1);
  const finalCart = await getCart();
  if (finalCart && finalCart.data && finalCart.data.length > 0) {
    const cartItemIds = finalCart.data.map(item => item.id);
    const shippingAddress = {
      receiverName: '测试用户',
      mobile: '13800138000',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      address: '测试地址',
      zipCode: '518000'
    };
    
    await createOrderFromCart(cartItemIds, shippingAddress);
  }

  console.log('\n✅ 测试完成！');
}

// 运行测试
runTests().catch(console.error); 