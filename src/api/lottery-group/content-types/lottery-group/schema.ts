export default {
  kind: 'collectionType',
  collectionName: 'lottery_groups',
  info: {
    singularName: 'lottery-group',
    pluralName: 'lottery-groups',
    displayName: '奖池组',
    description: '抽奖奖池分组管理',
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
    name: {
      type: 'string',
      required: true,
      maxLength: 100,
    },
    description: {
      type: 'text',
      maxLength: 500,
    },
    sort: {
      type: 'integer',
      required: false,
      default: 0,
    },
    coverImage: {
      type: 'media',
      multiple: false,
      required: false,
      allowedTypes: ['images'],
    },
    visible: {
      type: 'boolean',
      required: true,
      default: true,
    },
    // 关联的奖品
    prizes: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::choujiang-jiangpin.choujiang-jiangpin',
      mappedBy: 'group',
    },
    // 活动时间
    startAt: {
      type: 'datetime',
      required: false,
    },
    endAt: {
      type: 'datetime',
      required: false,
    },
    // 奖池配置
    config: {
      type: 'json',
      required: false,
    },
  },
} as const; 