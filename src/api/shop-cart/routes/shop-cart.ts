export default {
  routes: [
    // 获取用户购物车
    {
      method: 'GET',
      path: '/shop-carts',
      handler: 'shop-cart.getUserCart',
      config: {
        auth: {}  // 空对象表示需要登录
      }
    },
    // 添加商品到购物车
    {
      method: 'POST',
      path: '/shop-carts',
      handler: 'shop-cart.addToCart',
      config: {
        auth: {}  // 空对象表示需要登录
      }
    },
    // 更新购物车商品数量
    {
      method: 'PUT',
      path: '/shop-carts/:id',
      handler: 'shop-cart.updateCartItem',
      config: {
        auth: {}  // 空对象表示需要登录
      }
    },
    // 删除购物车商品
    {
      method: 'DELETE',
      path: '/shop-carts/:id',
      handler: 'shop-cart.removeFromCart',
      config: {
        auth: {}  // 空对象表示需要登录
      }
    },
    // 清空购物车
    {
      method: 'DELETE',
      path: '/shop-carts/clear',
      handler: 'shop-cart.clearCart',
      config: {
        auth: {}  // 空对象表示需要登录
      }
    },
    // 获取购物车商品总数
    {
      method: 'GET',
      path: '/shop-carts/count',
      handler: 'shop-cart.getCartCount',
      config: {
        auth: {}  // 空对象表示需要登录
      }
    }
  ]
}; 