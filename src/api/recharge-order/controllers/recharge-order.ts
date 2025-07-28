import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::recharge-order.recharge-order' as any, ({ strapi }) => ({
  // 重写默认的find方法
  async find(ctx) {
    try {
      const result = await strapi.entityService.findPage('api::recharge-order.recharge-order' as any, {
        ...ctx.query,
        populate: ['user', 'channel']
      });
      return result;
    } catch (error) {
      console.error('获取充值订单列表失败:', error);
      ctx.throw(500, `获取充值订单列表失败: ${error.message}`);
    }
  },

  // 添加默认的findOne方法
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.entityService.findOne('api::recharge-order.recharge-order' as any, id, {
        populate: ['user', 'channel']
      });
      return result;
    } catch (error) {
      console.error('获取充值订单详情失败:', error);
      ctx.throw(500, `获取充值订单详情失败: ${error.message}`);
    }
  },

  // 添加默认的create方法
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      const result = await strapi.entityService.create('api::recharge-order.recharge-order' as any, {
        data
      });
      return result;
    } catch (error) {
      console.error('创建充值订单失败:', error);
      ctx.throw(500, `创建充值订单失败: ${error.message}`);
    }
  },

  // 添加默认的update方法
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;
      const result = await strapi.entityService.update('api::recharge-order.recharge-order' as any, id, {
        data
      });
      return result;
    } catch (error) {
      console.error('更新充值订单失败:', error);
      ctx.throw(500, `更新充值订单失败: ${error.message}`);
    }
  },

  // 添加默认的delete方法
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.entityService.delete('api::recharge-order.recharge-order' as any, id);
      return result;
    } catch (error) {
      console.error('删除充值订单失败:', error);
      ctx.throw(500, `删除充值订单失败: ${error.message}`);
    }
  },
})); 