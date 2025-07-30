export default {
  kind: 'collectionType',
  collectionName: 'ai_tokens',
  info: {
    singularName: 'ai-token',
    pluralName: 'ai-tokens',
    displayName: 'AI代币',
    description: 'AI代币配置信息',
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
      unique: true,
      maxLength: 100,
    },
    symbol: {
      type: 'string',
      required: true,
      unique: true,
      maxLength: 20,
    },
    contract_address: {
      type: 'string',
      maxLength: 100,
      description: '合约地址 (SPL Token Address)',
    },
    price_source: {
      type: 'enumeration',
      enum: ['coingecko', 'binance', 'dexscreener'],
      required: true,
      description: '价格数据源',
    },
    price_api_id: {
      type: 'string',
      maxLength: 100,
      description: 'API中的代币ID或符号',
    },
    weight: {
      type: 'integer',
      default: 20,
      min: 1,
      max: 100,
      description: '权重(影响被选中概率)',
    },
    is_active: {
      type: 'boolean',
      default: true,
      description: '是否启用',
    },
    logo_url: {
      type: 'string',
      maxLength: 255,
      description: '代币图标URL',
    },
    description: {
      type: 'text',
      description: '代币描述',
    },
  },
} as const; 