const RechargeOrderSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: {
    singularName: 'recharge-order',
    pluralName: 'recharge-orders',
    displayName: '充值订单',
    description: '用户充值订单记录',
  },
  options: {
    draftAndPublish: false,
  },
  attributes: {
    // 订单基本信息
    orderNo: {
      type: 'string',
      required: true,
      unique: true,
    },
    amount: {
      type: 'decimal',
      required: true,
    },
    currency: {
      type: 'enumeration',
      enum: ['USDT', 'USDC', 'BTC', 'ETH'],
      default: 'USDT',
    },
    
    // 订单状态
    status: {
      type: 'enumeration',
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    
    // 用户信息
    user: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'rechargeOrders',
    },
    
    // 通道信息
    channel: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::recharge-channel.recharge-channel',
      inversedBy: 'rechargeOrders',
    },
    
    // 收款地址
    receiveAddress: {
      type: 'string',
      required: true,
    },
    
    // 区块链交易信息
    txHash: {
      type: 'string',
    },
    blockNumber: {
      type: 'biginteger',
    },
    confirmations: {
      type: 'integer',
      default: 0,
    },
    
    // 时间信息
    expectedTime: {
      type: 'datetime',
    },
    receivedTime: {
      type: 'datetime',
    },
    completedTime: {
      type: 'datetime',
    },
    
    // 备注信息
    remark: {
      type: 'text',
    },
    
    // 手续费
    fee: {
      type: 'decimal',
      default: '0.00',
    },
    actualAmount: {
      type: 'decimal',
      default: '0.00',
    },
    
    // 扩展信息
    metadata: {
      type: 'json',
    },
  },
};

export default RechargeOrderSchema; 