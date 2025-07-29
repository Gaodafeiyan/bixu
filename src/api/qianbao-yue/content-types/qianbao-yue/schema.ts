export default {
  kind: 'collectionType',
  collectionName: 'qianbao_yues',
  info: {
    singularName: 'qianbao-yue',
    pluralName: 'qianbao-yues',
    displayName: '钱包余额',
    description: '用户钱包余额管理',
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
    usdtYue: {
      type: 'decimal',
      default: 0,
      required: false,
    },
    aiYue: {
      type: 'decimal',
      default: 0,
      required: false,
    },
    aiTokenBalances: {
      type: 'json',
      default: {},
      description: 'AI代币余额JSON格式 {tokenId: balance}',
    },
    user: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'plugin::users-permissions.user',
    },
  },
} as const;