// 服务注册文件
export default {
  'api::investment-service.investment-service': () => import('./investment-service'),
  'api::lottery-service.lottery-service': () => import('./lottery-service'),
  'api::log-service.log-service': () => import('./log-service'),
  'api::lottery-engine.lottery-engine': () => import('./lottery-engine'),
  'api::shipping-service.shipping-service': () => import('./shipping-service'),
};