export default {
  kind: 'collectionType',
  collectionName: 'choujiang_ji_lus',
  info: {
    singularName: 'choujiang-ji-lu',
    pluralName: 'choujiang-ji-lus',
    displayName: '抽奖记录',
    description: '用户抽奖历史记录',
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
    jiangpin: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::choujiang-jiangpin.choujiang-jiangpin',
      required: true,
    },
    chance: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::choujiang-jihui.choujiang-jihui',
      required: true,
    },
    isWon: {
      type: 'boolean',
      required: true,
      default: false,
    },
    drawTime: {
      type: 'datetime',
      required: true,
    },
    prizeValue: {
      type: 'decimal',
      required: false,
    },
    sourceType: {
      type: 'enumeration',
      enum: ['investment_redeem', 'daily_login', 'invitation', 'admin_grant', 'other'],
      required: true,
      default: 'other',
    },
    sourceOrder: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::dinggou-dingdan.dinggou-dingdan',
      required: false,
    },
    ipAddress: {
      type: 'string',
      required: false,
      maxLength: 45,
    },
    userAgent: {
      type: 'text',
      required: false,
    },
  },
} as const; 