export default {
  kind: 'collectionType',
  collectionName: 'dinggou_jihuas',
  info: {
    singularName: 'dinggou-jihua',
    pluralName: 'dinggou-jihuas',
    displayName: '认购计划',
    description: '投资认购计划管理',
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
      description: '计划名称',
    },
    jihuaCode: {
      type: 'string',
      required: true,
      unique: true,
      description: '计划唯一代码',
    },
    description: {
      type: 'text',
      description: '计划描述',
    },
    benjinUSDT: {
      type: 'decimal',
      required: true,
      default: 0,
      description: '投资本金金额(USDT)',
    },
    jingtaiBili: {
      type: 'decimal',
      required: true,
      description: '静态收益比例(年化)',
    },
    aiBili: {
      type: 'decimal',
      required: true,
      description: 'AI代币奖励比例',
    },
    zhouQiTian: {
      type: 'integer',
      required: true,
      description: '投资周期(天)',
    },
    start_date: {
      type: 'datetime',
      description: '计划开始时间',
    },
    end_date: {
      type: 'datetime',
      description: '计划结束时间',
    },
    max_slots: {
      type: 'integer',
      default: 100,
      description: '最大参与槽位',
    },
    current_slots: {
      type: 'integer',
      default: 0,
      description: '当前已用槽位',
    },
    kaiqi: {
      type: 'boolean',
      default: true,
      description: '是否开启',
    },
    lottery_chances: {
      type: 'integer',
      default: 0,
      description: '赠送抽奖次数',
    },
    lottery_prize_id: {
      type: 'integer',
      description: '关联抽奖奖品ID',
    },
    // 新增每日限购字段
    daily_order_limit: {
      type: 'integer',
      default: 100,
      description: '每日可投资订单数量限制',
    },
    daily_order_count: {
      type: 'integer',
      default: 0,
      description: '今日已投资订单数量',
    },
    last_reset_date: {
      type: 'date',
      description: '最后重置日期（北京时间）',
    },
    dingdanList: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::dinggou-dingdan.dinggou-dingdan',
      mappedBy: 'jihua',
      description: '关联订单列表',
    },
  },
} as const;