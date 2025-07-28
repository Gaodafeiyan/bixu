// 服务注册文件
export default {
  'api::blockchain-service.blockchain-service': () => import('./blockchain-service'),
  'api::investment-service.investment-service': () => import('./investment-service'),
  'api::lottery-service.lottery-service': () => import('./lottery-service'),
  'api::log-service.log-service': () => import('./log-service'),
};