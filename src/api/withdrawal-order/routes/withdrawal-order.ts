export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/withdrawal-orders',
      handler: 'withdrawal-order.find',
      config: {
        auth: {},
      },
    },
    {
      method: 'POST',
      path: '/withdrawal-orders',
      handler: 'withdrawal-order.create',
      config: {
        auth: {},
      },
    },
    {
      method: 'GET',
      path: '/withdrawal-orders/:id',
      handler: 'withdrawal-order.findOne',
      config: {
        auth: {},
      },
    },
    {
      method: 'PUT',
      path: '/withdrawal-orders/:id',
      handler: 'withdrawal-order.update',
      config: {
        auth: {},
      },
    },
    {
      method: 'DELETE',
      path: '/withdrawal-orders/:id',
      handler: 'withdrawal-order.delete',
      config: {
        auth: {},
      },
    },
  ],
}; 