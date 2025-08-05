export default {
  routes: [
    {
      method: 'GET',
      path: '/banners/active',
      handler: 'banner.getActiveBanners',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/banners/:id',
      handler: 'banner.getBannerDetail',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/banners',
      handler: 'banner.find',
      config: {
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/banners',
      handler: 'banner.create',
      config: {
        policies: []
      }
    },
    {
      method: 'PUT',
      path: '/banners/:id',
      handler: 'banner.update',
      config: {
        policies: []
      }
    },
    {
      method: 'DELETE',
      path: '/banners/:id',
      handler: 'banner.delete',
      config: {
        policies: []
      }
    }
  ]
}; 