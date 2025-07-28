import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::withdrawal-order.withdrawal-order' as any, ({ strapi }) => ({
  // 重写默认的find方法
  async find(ctx) {
    try {
      const result = await strapi.entityService.findPage('api::withdrawal-order.withdrawal-order' as any, {
        ...ctx.query,
        populate: ['user', 'channel']
      });
      return result;
    } catch (error) {
      console.error('获取提现订单列表失败:', error);
      ctx.throw(500, `获取提现订单列表失败: ${error.message}`);
    }
  },

  // 添加默认的findOne方法
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.entityService.findOne('api::withdrawal-order.withdrawal-order' as any, id, {
        populate: ['user', 'channel']
      });
      return result;
    } catch (error) {
      console.error('获取提现订单详情失败:', error);
      ctx.throw(500, `获取提现订单详情失败: ${error.message}`);
    }
  },

  // 添加默认的create方法
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      const result = await strapi.entityService.create('api::withdrawal-order.withdrawal-order' as any, {
        data
      });
      return result;
    } catch (error) {
      console.error('创建提现订单失败:', error);
      ctx.throw(500, `创建提现订单失败: ${error.message}`);
    }
  },

  // 添加默认的update方法
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;
      const result = await strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, id, {
        data
      });
      return result;
    } catch (error) {
      console.error('更新提现订单失败:', error);
      ctx.throw(500, `更新提现订单失败: ${error.message}`);
    }
  },

  // 添加默认的delete方法
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.entityService.delete('api::withdrawal-order.withdrawal-order' as any, id);
      return result;
    } catch (error) {
      console.error('删除提现订单失败:', error);
      ctx.throw(500, `删除提现订单失败: ${error.message}`);
    }
  },
})); 