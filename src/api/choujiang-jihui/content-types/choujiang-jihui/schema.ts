export default {
  kind: 'collectionType',
  collectionName: 'choujiang_jihuis',
  info: {
    singularName: 'choujiang-jihui',
    pluralName: 'choujiang-jihuis',
    displayName: '抽奖机会',
    description: '用户抽奖机会管理',
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
      inversedBy: 'choujiangJihuis',
      required: true,
    },
    jiangpin: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::choujiang-jiangpin.choujiang-jiangpin',
      required: true,
    },
    count: {
      type: 'integer',
      required: true,
      min: 1,
      default: 1,
    },
    usedCount: {
      type: 'integer',
      required: false,
      min: 0,
      default: 0,
    },
    reason: {
      type: 'string',
      required: false,
      maxLength: 200,
    },
    type: {
      type: 'enumeration',
      enum: ['investment_redeem', 'daily_login', 'invitation', 'admin_grant', 'other'],
      required: true,
      default: 'other',
    },
    validUntil: {
      type: 'datetime',
      required: false,
    },
    isActive: {
      type: 'boolean',
      required: true,
      default: true,
    },
    sourceOrder: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::dinggou-dingdan.dinggou-dingdan',
      required: false,
    },
  },
} as const; 