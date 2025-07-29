export default {
  kind: 'collectionType',
  collectionName: 'dinggou_dingdans',
  info: {
    singularName: 'dinggou-dingdan',
    pluralName: 'dinggou-dingdans',
    displayName: '认购订单',
    description: '投资认购订单管理',
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
    user: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      required: true,
    },
    jihua: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::dinggou-jihua.dinggou-jihua',
      inversedBy: 'dingdanList',
      required: true,
    },
    jiangli: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'api::yaoqing-jiangli.yaoqing-jiangli',
      required: false,
    },
    amount: {
      type: 'decimal',
      required: true,
    },
    principal: {
      type: 'decimal',
      required: true,
    },
    yield_rate: {
      type: 'decimal',
      required: true,
    },
    cycle_days: {
      type: 'integer',
      required: true,
    },
    start_at: {
      type: 'datetime',
      required: true,
    },
    end_at: {
      type: 'datetime',
      required: true,
    },
    redeemed_at: {
      type: 'datetime',
      required: false,
    },
    payout_amount: {
      type: 'decimal',
      required: false,
    },
    status: {
      type: 'enumeration',
      enum: ['pending', 'running', 'finished', 'cancelled', 'redeemable'],
      default: 'pending',
      required: true,
    },
  },
} as const;