import { factories } from '@strapi/strapi';

export default factories.createCoreSchema('api::choujiang-jiangpin.choujiang-jiangpin', {
  collectionName: 'choujiang_jiangpins',
  info: {
    singularName: 'choujiang-jiangpin',
    pluralName: 'choujiang-jiangpins',
    displayName: '抽奖奖品',
    description: '抽奖系统中的奖品配置',
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
      unique: false,
      minLength: 1,
      maxLength: 100,
    },
    description: {
      type: 'text',
      maxLength: 500,
    },
    image: {
      type: 'media',
      multiple: false,
      required: false,
      allowedTypes: ['images'],
    },
    jiangpinType: {
      type: 'enumeration',
      enum: ['usdt', 'ai_token', 'physical', 'virtual'],
      required: true,
      default: 'usdt',
    },
    value: {
      type: 'decimal',
      required: true,
      min: 0,
      max: 999999.99,
    },
    zhongJiangLv: {
      type: 'decimal',
      required: true,
      min: 0,
      max: 100,
      default: 1.0,
    },
    maxQuantity: {
      type: 'integer',
      required: false,
      min: 0,
      default: 0,
    },
    currentQuantity: {
      type: 'integer',
      required: false,
      min: 0,
      default: 0,
    },
    kaiQi: {
      type: 'boolean',
      required: true,
      default: true,
    },
    paiXuShunXu: {
      type: 'integer',
      required: false,
      min: 0,
      default: 0,
    },
    category: {
      type: 'string',
      required: false,
      maxLength: 50,
    },
    rarity: {
      type: 'enumeration',
      enum: ['common', 'rare', 'epic', 'legendary'],
      required: true,
      default: 'common',
    },
    validUntil: {
      type: 'datetime',
      required: false,
    },
    minUserLevel: {
      type: 'integer',
      required: false,
      min: 0,
      default: 0,
    },
  },
}); 