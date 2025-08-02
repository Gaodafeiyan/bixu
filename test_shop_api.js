async function testShopAPI() {
  try {
    console.log('🧪 测试商城API...');
    
    // 测试获取商品列表
    console.log('\n📦 测试获取商品列表...');
    const productsResponse = await fetch('http://118.107.4.158:1337/api/shop-products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      console.log('✅ 商品列表API正常');
      console.log(`📊 商品数量: ${productsData.data?.results?.length || 0}`);
    } else {
      console.log('❌ 商品列表API失败:', productsResponse.status);
    }

    // 测试获取商品分类
    console.log('\n📂 测试获取商品分类...');
    const categoriesResponse = await fetch('http://118.107.4.158:1337/api/shop-products/categories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      console.log('✅ 商品分类API正常');
      console.log(`📊 分类数量: ${categoriesData.data?.length || 0}`);
    } else {
      console.log('❌ 商品分类API失败:', categoriesResponse.status);
    }

    // 测试购物车API（需要认证）
    console.log('\n🛒 测试购物车API...');
    const cartResponse = await fetch('http://118.107.4.158:1337/api/shop-carts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // 需要真实token
      },
    });

    if (cartResponse.status === 401) {
      console.log('✅ 购物车API认证正常（需要token）');
    } else if (cartResponse.ok) {
      const cartData = await cartResponse.json();
      console.log('✅ 购物车API正常');
      console.log(`📊 购物车商品数量: ${cartData.data?.length || 0}`);
    } else {
      console.log('❌ 购物车API失败:', cartResponse.status);
    }

    // 测试订单API（需要认证）
    console.log('\n📋 测试订单API...');
    const ordersResponse = await fetch('http://118.107.4.158:1337/api/shop-orders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // 需要真实token
      },
    });

    if (ordersResponse.status === 401) {
      console.log('✅ 订单API认证正常（需要token）');
    } else if (ordersResponse.ok) {
      const ordersData = await ordersResponse.json();
      console.log('✅ 订单API正常');
      console.log(`📊 订单数量: ${ordersData.data?.results?.length || 0}`);
    } else {
      console.log('❌ 订单API失败:', ordersResponse.status);
    }

    console.log('\n🎉 商城API测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testShopAPI(); 