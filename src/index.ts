export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    // 移除手动服务注册，使用Strapi的自动服务发现机制
    // 服务文件现在位于正确的位置：src/api/investment-service/services/
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
