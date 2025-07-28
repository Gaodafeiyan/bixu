export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/recharge-orders',
      handler: 'recharge-order.find',
      config: {
        auth: {},
      },
    },
    {
      method: 'POST',
      path: '/recharge-orders',
      handler: 'recharge-order.create',
      config: {
        auth: {},
      },
    },
    {
      method: 'GET',
      path: '/recharge-orders/:id',
      handler: 'recharge-order.findOne',
      config: {
        auth: {},
      },
    },
    {
      method: 'PUT',
      path: '/recharge-orders/:id',
      handler: 'recharge-order.update',
      config: {
        auth: {},
      },
    },
    {
      method: 'DELETE',
      path: '/recharge-orders/:id',
      handler: 'recharge-order.delete',
      config: {
        auth: {},
      },
    },
  ],
}; 