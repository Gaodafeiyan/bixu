const WithdrawalOrderSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: {
    singularName: 'withdrawal-order',
    pluralName: 'withdrawal-orders',
    displayName: '提现订单',
    description: '用户提现订单记录',
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
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    
    // 用户信息
    user: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'withdrawalOrders',
    },
    
    // 通道信息
    channel: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::recharge-channel.recharge-channel',
      inversedBy: 'withdrawalOrders',
    },
    
    // 提现地址
    withdrawAddress: {
      type: 'string',
      required: true,
    },
    withdrawNetwork: {
      type: 'enumeration',
      enum: ['BSC', 'ETH', 'TRON', 'POLYGON'],
      default: 'BSC',
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
    requestTime: {
      type: 'datetime',
    },
    processTime: {
      type: 'datetime',
    },
    completedTime: {
      type: 'datetime',
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
    
    // 审核信息
    reviewedBy: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
    },
    reviewTime: {
      type: 'datetime',
    },
    reviewRemark: {
      type: 'text',
    },
    
    // 备注信息
    remark: {
      type: 'text',
    },
    
    // 扩展信息
    metadata: {
      type: 'json',
    },
  },
};

export default WithdrawalOrderSchema; 