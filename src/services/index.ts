// 服务注册文件
export default {
  'blockchain-service': () => import('./blockchain-service'),
  'investment-service': () => import('./investment-service'),
  'lottery-service': () => import('./lottery-service'),
  'log-service': () => import('./log-service'),
};