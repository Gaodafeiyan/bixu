export default ({ env }) => ({
  // 启用定时任务
  enabled: true,
  
  // 定时任务配置
  tasks: {
    // 充值扫描窗口 - 每15秒执行一次（关键修复）
    'recharge-scan-window': {
      cron: '*/15 * * * * *',
      handler: 'src/crons/recharge-scan-window',
      enabled: true,
    },
    
    // 监控钱包交易 - 每30秒执行一次
    'monitor-wallet-transactions': {
      cron: '*/30 * * * * *',
      handler: 'src/crons/monitor-wallet-transactions',
      enabled: true,
    },
    
    // 处理提现订单 - 每60秒执行一次
    'process-withdrawal-orders': {
      cron: '0 * * * * *',
      handler: 'src/crons/process-withdrawal-orders',
      enabled: true,
    },
    
    // 检查到期投资 - 每5分钟执行一次
    'check-expired-investments': {
      cron: '*/5 * * * *',
      handler: 'src/crons/check-expired-investments',
      enabled: true,
    },
  },
});