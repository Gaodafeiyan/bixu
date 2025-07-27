const JiangliSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { singularName: 'yaoqing-jiangli', pluralName: 'yaoqing-jianglis', displayName: '邀请奖励' },
  options: { draftAndPublish: false },
  attributes: {
    shouyiUSDT : { type: 'string', required: true },           // 奖励USDT金额
    tuijianRen : { type: 'relation', relation: 'manyToOne',    // 推荐人
                   target: 'plugin::users-permissions.user' },
    laiyuanRen : { type: 'relation', relation: 'manyToOne',    // 来源人（被推荐人）
                   target: 'plugin::users-permissions.user' },
    laiyuanDan : { type: 'relation', relation: 'oneToOne',     // 来源订单
                   target: 'api::dinggou-dingdan.dinggou-dingdan', mappedBy: 'jiangli' },
    // 新增字段：支持档位封顶计算制度
    calculation : { type: 'text' },                            // 计算过程说明
    parentTier : { type: 'string' },                           // 推荐人档位名称
    childPrincipal : { type: 'string' },                       // 下级投资本金
    commissionablePrincipal : { type: 'string' },              // 可计佣本金
    rewardLevel : { type: 'integer', default: 1 },             // 奖励层级（1=一级，2=二级等）
    rewardType : { type: 'enumeration', enum: ['referral', 'team', 'bonus'], default: 'referral' }, // 奖励类型
  },
};
export default JiangliSchema; 