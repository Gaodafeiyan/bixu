export default {
  kind: 'collectionType',
  collectionName: 'shop_shipping_orders',
  info: {
    singularName: 'shop-shipping-order',
    pluralName: 'shop-shipping-orders',
    displayName: '商城发货订单',
    description: '商城实物商品发货管理',
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
    // 关联商城订单
    shopOrder: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'api::shop-order.shop-order',
      required: true,
    },
    // 关联商品
    product: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'api::shop-product.shop-product',
      required: true,
    },
    // 关联用户
    user: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      required: true,
    },
    // 订单号
    orderNumber: {
      type: 'string',
      required: true,
      unique: true,
      maxLength: 50,
    },
    // 商品数量
    quantity: {
      type: 'integer',
      required: true,
      min: 1,
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