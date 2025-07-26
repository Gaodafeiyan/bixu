const JihuaSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { singularName: 'dinggou-jihua', pluralName: 'dinggou-jihuas', displayName: '认购计划' },
  options: { draftAndPublish: false },
  attributes: {
    // 基本信息
    name          : { type: 'string', required: true, description: '计划名称' },
    jihuaCode     : { type: 'string', required: true, unique: true, description: '计划唯一代码' },
    description   : { type: 'text', description: '计划描述' },
    
    // 金额相关
    benjinUSDT    : { type: 'decimal', required: true, default: '0', description: '投资本金金额(USDT)' },
    jingtaiBili   : { type: 'decimal', required: true, description: '静态收益比例(年化)' },
    aiBili        : { type: 'decimal', required: true, description: 'AI代币奖励比例' },
    
    // 时间相关
    zhouQiTian    : { type: 'integer', required: true, description: '投资周期(天)' },
    start_date    : { type: 'datetime', description: '计划开始时间' },
    end_date      : { type: 'datetime', description: '计划结束时间' },
    
    // 槽位管理
    max_slots     : { type: 'integer', default: 100, description: '最大参与槽位' },
    current_slots : { type: 'integer', default: 0, description: '当前已用槽位' },
    
    // 状态控制
    kaiqi         : { type: 'boolean', default: true, description: '是否开启' },
    
    // 抽奖相关
    lottery_chances: { type: 'integer', default: 0, description: '赠送抽奖次数' },
    lottery_prize_id: { type: 'integer', description: '关联抽奖奖品ID' },
    
    // 关联关系
    dingdanList   : { type: 'relation', relation: 'oneToMany', target: 'api::dinggou-dingdan.dinggou-dingdan', description: '关联订单列表' },
  },
};
export default JihuaSchema; 