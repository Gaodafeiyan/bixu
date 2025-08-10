export default {
  type: 'content-api',
  routes: [
    // 获取可用通道
    {
      method: 'GET',
      path: '/recharge-channels/available',
      handler: 'recharge-channel.getAvailableChannels',
      config: {
        type: 'content-api',
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
        type: 'content-api',
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
        type: 'content-api',
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
        type: 'content-api',
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
        type: 'content-api',
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
        type: 'content-api',
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
        type: 'content-api',
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
        type: 'content-api',
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
        type: 'content-api',
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
        type: 'content-api',
        auth: {},
        policies: [],
        middlewares: [],
      },
    },

    // 简化的充值接口 - 需要认证
    {
      method: 'POST',
      path: '/recharge-channels/simple-recharge',
      handler: 'recharge-channel.simpleRecharge',
      config: {
        type: 'content-api',
        auth: {},  // 空对象表示需要登录
        policies: [],
        middlewares: [],
      },
    },

    // 简化的提现接口 - 需要认证
    {
      method: 'POST',
      path: '/recharge-channels/simple-withdrawal',
      handler: 'recharge-channel.simpleWithdrawal',
      config: {
        type: 'content-api',
        auth: {},  // 空对象表示需要登录
        policies: [],
        middlewares: [],
      },
    },

    // AI代币提现接口 - 需要认证
    {
      method: 'POST',
      path: '/recharge-channels/ai-token-withdrawal',
      handler: 'recharge-channel.aiTokenWithdrawal',
      config: {
        type: 'content-api',
        auth: {},  // 空对象表示需要登录
        policies: [],
        middlewares: [],
      },
    },

    // 测试区块链服务
    {
      method: 'GET',
      path: '/recharge-channels/test-blockchain',
      handler: 'recharge-channel.testBlockchainService',
      config: {
        type: 'content-api',
        auth: false,
        policies: [],
        middlewares: [],
      },
    },

    // 获取钱包配置状态
    {
      method: 'GET',
      path: '/recharge-channels/wallet-status',
      handler: 'recharge-channel.getWalletStatus',
      config: {
        type: 'content-api',
        auth: {},
        policies: [],
        middlewares: [],
      },
    },

    // 快速配置钱包
    {
      method: 'POST',
      path: '/recharge-channels/quick-setup-wallet',
      handler: 'recharge-channel.quickSetupWallet',
      config: {
        type: 'content-api',
        auth: {},
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
        type: 'content-api',
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/recharge-channels',
      handler: 'recharge-channel.create',
      config: {
        type: 'content-api',
        auth: {},
      },
    },
    {
      method: 'GET',
      path: '/recharge-channels/:id',
      handler: 'recharge-channel.findOne',
      config: {
        type: 'content-api',
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/recharge-channels/:id',
      handler: 'recharge-channel.update',
      config: {
        type: 'content-api',
        auth: {},
      },
    },
    {
      method: 'DELETE',
      path: '/recharge-channels/:id',
      handler: 'recharge-channel.delete',
      config: {
        type: 'content-api',
        auth: {},
      },
    },
  ],
}; 