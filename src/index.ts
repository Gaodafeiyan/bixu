export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    // 注册自定义服务 - 使用正确的 api:: 前缀格式
    strapi.service('api::investment-service.investment-service', require('./services/investment-service').default);
    strapi.service('api::invitation-reward-config.invitation-reward-config', require('./services/invitation-reward-config').default);
    strapi.service('api::lottery-service.lottery-service', require('./services/lottery-service').default);
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    // 服务启动后的初始化逻辑
  },
};
