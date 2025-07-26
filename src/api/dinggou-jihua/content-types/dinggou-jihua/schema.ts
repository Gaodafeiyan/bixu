const JihuaSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { singularName: 'dinggou-jihua', pluralName: 'dinggou-jihuas', displayName: '认购计划' },
  options: { draftAndPublish: false },
  attributes: {
    name          : { type: 'string', required: true },
    max_slots     : { type: 'integer', default: 100 },
    current_slots : { type: 'integer', default: 0 },
    start_date    : { type: 'datetime' },
    end_date      : { type: 'datetime' },
    description   : { type: 'text' },
    dingdanList   : { type: 'relation', relation: 'oneToMany', target: 'api::dinggou-dingdan.dinggou-dingdan' },
    // 统一使用中文字段名，与代码保持一致
    jingtaiBili   : { type: 'decimal', required: true },  // 静态收益比例
    aiBili        : { type: 'decimal', required: true },  // AI代币奖励比例
    zhouQiTian    : { type: 'integer', required: true },  // 周期天数
    kaiqi         : { type: 'boolean', default: true },   // 是否开启
    // 抽奖次数相关字段
    lottery_chances: { type: 'integer', default: 0 },     // 赠送抽奖次数
    lottery_prize_id: { type: 'integer' },                // 关联的抽奖奖品ID
    // 计划代码
    jihuaCode     : { type: 'string' },                   // 计划唯一代码
  },
};
export default JihuaSchema; 