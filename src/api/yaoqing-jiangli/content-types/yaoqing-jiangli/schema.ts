const JiangliSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { singularName: 'yaoqing-jiangli', pluralName: 'yaoqing-jianglis', displayName: '邀请奖励' },
  options: { draftAndPublish: false },
  attributes: {
    shouyiUSDT : { type: 'string', required: true },           // 改为string类型
    tuijianRen : { type: 'relation', relation: 'manyToOne',
                   target: 'plugin::users-permissions.user' },
    laiyuanRen : { type: 'relation', relation: 'manyToOne',
                   target: 'plugin::users-permissions.user' },
    laiyuanDan : { type: 'relation', relation: 'oneToOne',
                   target: 'api::dinggou-dingdan.dinggou-dingdan', mappedBy: 'jiangli' },
  },
};
export default JiangliSchema; 