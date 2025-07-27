const QianbaoSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { singularName: 'qianbao-yue', pluralName: 'qianbao-yues', displayName: '钱包余额' },
  options: { draftAndPublish: false },
  attributes: {
    usdtYue : { type: 'string', default: '0' },
    aiYue   : { type: 'string', default: '0' },
    aiTokenBalances: { 
      type: 'json', 
      default: '{}',
      description: 'AI代币余额JSON格式 {tokenId: balance}'
    },
    user  : { type: 'relation', relation: 'oneToOne',
                target: 'plugin::users-permissions.user' },
  },
};
export default QianbaoSchema; 