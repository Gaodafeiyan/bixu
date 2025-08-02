// 服务注册文件
export default {
  'api::investment-service.investment-service': () => import('./investment-service'),
  'api::lottery-service.lottery-service': () => import('./lottery-service'),
  'api::log-service.log-service': () => import('./log-service'),
  'lottery-engine': () => import('./lottery-engine'),
  'shipping-service': () => import('./shipping-service'),
  'shop-service': () => import('./shop-service'),
};