import { factories } from '@strapi/strapi';

export default factories.createCoreSchema('api::recharge-channel.recharge-channel', {
  kind: 'collectionType',
  collectionName: 'recharge_channels',
  info: {
    singularName: 'recharge-channel',
    pluralName: 'recharge-channels',
    displayName: '充值通道',
    description: '管理充值提现通道系统',
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
    // 通道基本信息
    name: {
      type: 'string',
      required: true,
      unique: true,
    },
    channelType: {
      type: 'enumeration',
      enum: ['recharge', 'withdrawal', 'both'],
      default: 'both',
    },
    status: {
      type: 'enumeration',
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active',
    },
    
    // 钱包配置
    walletAddress: {
      type: 'string',
      required: true,
    },
    walletPrivateKey: {
      type: 'text',
      private: true, // 敏感信息，不暴露给前端
    },
    network: {
      type: 'enumeration',
      enum: ['BSC', 'ETH', 'TRON', 'POLYGON'],
      default: 'BSC',
    },
    asset: {
      type: 'enumeration',
      enum: ['USDT', 'USDC', 'BTC', 'ETH'],
      default: 'USDT',
    },
    
    // 限额配置
    minAmount: {
      type: 'decimal',
      default: '10.00',
    },
    maxAmount: {
      type: 'decimal',
      default: '10000.00',
    },
    dailyLimit: {
      type: 'decimal',
      default: '50000.00',
    },
    
    // 费率配置
    feeRate: {
      type: 'decimal',
      default: '0.001', // 0.1%
    },
    fixedFee: {
      type: 'decimal',
      default: '1.00',
    },
    
    // 监控配置
    confirmations: {
      type: 'integer',
      default: 12,
    },
    scanInterval: {
      type: 'integer',
      default: 30, // 30秒扫描一次
    },
    
    // 统计信息
    totalRechargeAmount: {
      type: 'decimal',
      default: '0.00',
    },
    totalWithdrawalAmount: {
      type: 'decimal',
      default: '0.00',
    },
    totalTransactions: {
      type: 'integer',
      default: 0,
    },
    
    // 关联关系
    rechargeOrders: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::recharge-order.recharge-order',
      mappedBy: 'channel',
    },
    withdrawalOrders: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::withdrawal-order.withdrawal-order',
      mappedBy: 'channel',
    },
  },
}); 