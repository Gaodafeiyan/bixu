export default {
  type: 'content-api',
  routes: [
    // 获取可用通道
    {
      method: 'GET',
      path: '/recharge-channels/available',
      handler: 'recharge-channel.getAvailableChannels',
      config: {
        auth: {},
        policies: [],
        middlewares: [],
      },
    },

    // 创建充值订单
    {
      method: 'POST',
      path: '/recharge-channels/recharge',
      handler: 'recharge-channel.createRecharge',
      config: {
        auth: {},
        policies: [],
        middlewares: [],
      },
    },

    // 创建提现订单
    {
      method: 'POST',
      path: '/recharge-channels/withdrawal',
      handler: 'recharge-channel.createWithdrawal',
      config: {
        auth: {},
        policies: [],
        middlewares: [],
      },
    },

    // 获取用户充值订单
    {
      method: 'GET',
      path: '/recharge-channels/recharge-orders',
      handler: 'recharge-channel.getUserRechargeOrders',
      config: {
        auth: {},
        policies: [],
        middlewares: [],
      },
    },

    // 获取用户提现订单
    {
      method: 'GET',
      path: '/recharge-channels/withdrawal-orders',
      handler: 'recharge-channel.getUserWithdrawalOrders',
      config: {
        auth: {},
        policies: [],
        middlewares: [],
      },
    },

    // 获取充值订单详情
    {
      method: 'GET',
      path: '/recharge-channels/recharge-orders/:id',
      handler: 'recharge-channel.getRechargeOrderDetail',
      config: {
        auth: {},
        policies: [],
        middlewares: [],
      },
    },

    // 获取提现订单详情
    {
      method: 'GET',
      path: '/recharge-channels/withdrawal-orders/:id',
      handler: 'recharge-channel.getWithdrawalOrderDetail',
      config: {
        auth: {},
        policies: [],
        middlewares: [],
      },
    },

    // 取消充值订单
    {
      method: 'PUT',
      path: '/recharge-channels/recharge-orders/:id/cancel',
      handler: 'recharge-channel.cancelRechargeOrder',
      config: {
        auth: {},
        policies: [],
        middlewares: [],
      },
    },

    // 获取充值统计
    {
      method: 'GET',
      path: '/recharge-channels/recharge-stats',
      handler: 'recharge-channel.getRechargeStats',
      config: {
        auth: {},
        policies: [],
        middlewares: [],
      },
    },

    // 获取提现统计
    {
      method: 'GET',
      path: '/recharge-channels/withdrawal-stats',
      handler: 'recharge-channel.getWithdrawalStats',
      config: {
        auth: {},
        policies: [],
        middlewares: [],
      },
    },

    // 简化的充值接口 - 不需要认证
    {
      method: 'POST',
      path: '/recharge-channels/simple-recharge',
      handler: 'recharge-channel.simpleRecharge',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },

    // 简化的提现接口 - 不需要认证
    {
      method: 'POST',
      path: '/recharge-channels/simple-withdrawal',
      handler: 'recharge-channel.simpleWithdrawal',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },

    // 默认CRUD路由
    {
      method: 'GET',
      path: '/recharge-channels',
      handler: 'recharge-channel.find',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/recharge-channels',
      handler: 'recharge-channel.create',
      config: {
        auth: {},
      },
    },
    {
      method: 'GET',
      path: '/recharge-channels/:id',
      handler: 'recharge-channel.findOne',
      config: {
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/recharge-channels/:id',
      handler: 'recharge-channel.update',
      config: {
        auth: {},
      },
    },
    {
      method: 'DELETE',
      path: '/recharge-channels/:id',
      handler: 'recharge-channel.delete',
      config: {
        auth: {},
      },
    },
  ],
}; 