export default {
  routes: [
    {
      method: 'GET',
      path: '/product-intros/active',
      handler: 'product-intro.getActiveProducts',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/product-intros/name/:name',
      handler: 'product-intro.getProductByName',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/product-intros/:id',
      handler: 'product-intro.getProductDetail',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/product-intros',
      handler: 'product-intro.find',
      config: {
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/product-intros',
      handler: 'product-intro.create',
      config: {
        policies: []
      }
    },
    {
      method: 'PUT',
      path: '/product-intros/:id',
      handler: 'product-intro.update',
      config: {
        policies: []
      }
    },
    {
      method: 'DELETE',
      path: '/product-intros/:id',
      handler: 'product-intro.delete',
      config: {
        policies: []
      }
    }
  ]
}; 