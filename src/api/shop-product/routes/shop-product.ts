export default {
  routes: [
    // 获取商品分类 - 必须放在 /:id 路由之前
    {
      method: 'GET',
      path: '/shop-products/categories',
      handler: 'shop-product.getCategories',
      config: {
        auth: false, // 公开接口，无需认证
      }
    },
    // 获取商品列表
    {
      method: 'GET',
      path: '/shop-products',
      handler: 'shop-product.find',
      config: {
        auth: false, // 公开接口，无需认证
      }
    },
    // 获取商品详情
    {
      method: 'GET',
      path: '/shop-products/:id',
      handler: 'shop-product.findOne',
      config: {
        auth: false, // 公开接口，无需认证
      }
    },
    // 创建商品（管理员）
    {
      method: 'POST',
      path: '/shop-products',
      handler: 'shop-product.create',
      config: {
        auth: {
          scope: ['admin']
        }
      }
    },
    // 更新商品（管理员）
    {
      method: 'PUT',
      path: '/shop-products/:id',
      handler: 'shop-product.update',
      config: {
        auth: {
          scope: ['admin']
        }
      }
    },
    // 删除商品（管理员）
    {
      method: 'DELETE',
      path: '/shop-products/:id',
      handler: 'shop-product.delete',
      config: {
        auth: {
          scope: ['admin']
        }
      }
    },
    // 更新商品库存（管理员）
    {
      method: 'PUT',
      path: '/shop-products/:id/stock',
      handler: 'shop-product.updateStock',
      config: {
        auth: {
          scope: ['admin']
        }
      }
    }
  ]
}; 