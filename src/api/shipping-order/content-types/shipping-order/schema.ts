export default {
  kind: 'collectionType',
  collectionName: 'shipping_orders',
  info: {
    singularName: 'shipping-order',
    pluralName: 'shipping-orders',
    displayName: '发货订单',
    description: '实物奖品发货管理',
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {
    i18n: {
      localized: false,
    },
  },
  attributes: {
    // 关联抽奖记录（可选，支持商城订单）
    record: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'api::choujiang-ji-lu.choujiang-ji-lu',
      required: false,
    },
    // 关联商城订单（可选，支持抽奖订单）
    shopOrderId: {
      type: 'integer',
      required: false,
    },
    // 收货人信息
    receiverName: {
      type: 'string',
      required: true,
      maxLength: 50,
    },
    mobile: {
      type: 'string',
      required: true,
      maxLength: 20,
    },
    province: {
      type: 'string',
      required: true,
      maxLength: 50,
    },
    city: {
      type: 'string',
      required: true,
      maxLength: 50,
    },
    district: {
      type: 'string',
      required: true,
      maxLength: 50,
    },
    address: {
      type: 'text',
      required: true,
      maxLength: 200,
    },
    zipCode: {
      type: 'string',
      required: false,
      maxLength: 10,
    },
    // 物流信息
    trackingNo: {
      type: 'string',
      required: false,
      maxLength: 50,
    },
    carrier: {
      type: 'string',
      required: false,
      maxLength: 50,
    },
    status: {
      type: 'enumeration',
      enum: ['pending', 'processing', 'shipped', 'delivered', 'failed'],
      required: true,
      default: 'pending',
    },
    // 发货日志
    log: {
      type: 'json',
      required: false,
    },
    // 备注
    remark: {
      type: 'text',
      maxLength: 500,
    },
    // 发货时间
    shippedAt: {
      type: 'datetime',
      required: false,
    },
    // 签收时间
    deliveredAt: {
      type: 'datetime',
      required: false,
    },
  },
} as const; 