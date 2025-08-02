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

// 获取商品列表
async function getProducts() {
  try {
    const response = await axios.get(`${BASE_URL}/api/shop-products`);
    console.log('✅ 获取商品列表成功:', response.data.data?.results?.length || 0, '个商品');
    return response.data.data?.results || [];
  } catch (error) {
    console.error('❌ 获取商品列表失败:', error.response?.data || error.message);
    return [];
  }
}

// 创建单个商品订单
async function createSingleOrder(productId, quantity, shippingAddress) {
  try {
    const response = await axios.post(`${BASE_URL}/api/shop-orders/single`, {
      productId,
      quantity,
      shippingAddress
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ 创建单个商品订单成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 创建单个商品订单失败:', error.response?.data || error.message);
    return null;
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试立即购买功能...\n');

  // 1. 登录
  if (!await login()) {
    console.log('❌ 登录失败，无法继续测试');
    return;
  }

  // 2. 获取商品列表
  console.log('\n📋 1. 获取商品列表');
  const products = await getProducts();
  if (products.length === 0) {
    console.log('❌ 没有找到商品，无法测试');
    return;
  }

  // 3. 选择第一个商品进行测试
  const testProduct = products[0];
  console.log(`\n🛒 2. 测试商品: ${testProduct.name}`);
  console.log(`- 商品ID: ${testProduct.id}`);
  console.log(`- 商品价格: ${testProduct.price} USDT`);
  console.log(`- 商品库存: ${testProduct.stock}`);

  // 4. 创建测试订单
  console.log('\n📦 3. 创建立即购买订单');
  const shippingAddress = {
    receiverName: '测试用户',
    mobile: '13800138000',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    address: '测试地址123号',
    zipCode: '518000'
  };

  const orderResult = await createSingleOrder(
    testProduct.id,
    1,
    shippingAddress
  );

  if (orderResult) {
    console.log('\n✅ 立即购买功能测试完成！');
    console.log('📊 测试结果:');
    console.log(`- 订单创建: ${orderResult.success ? '成功' : '失败'}`);
    if (orderResult.data) {
      console.log(`- 订单号: ${orderResult.data.orderNumber}`);
      console.log(`- 订单金额: ${orderResult.data.totalAmount} USDT`);
      console.log(`- 订单状态: ${orderResult.data.status}`);
    }
  } else {
    console.log('\n❌ 立即购买功能测试失败');
  }
}

// 运行测试
runTests().catch(console.error); 