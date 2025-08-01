/**
 * lottery-group controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::lottery-group.lottery-group' as any, ({ strapi }) => ({
  // 继承默认的find方法
  async find(ctx) {
    try {
      console.log('🔍 开始获取奖池组列表');
      console.log('🔍 查询参数:', ctx.query);
      
      // 使用findMany而不是findPage
      const result = await strapi.entityService.findMany('api::lottery-group.lottery-group' as any, {
        populate: ['coverImage', 'prizes']
      });
      
      console.log('🔍 查询结果:', result);
      console.log('🔍 结果类型:', typeof result);
      console.log('🔍 结果长度:', Array.isArray(result) ? result.length : '不是数组');
      
      return result;
    } catch (error) {
      console.error('获取奖池组列表失败:', error);
      ctx.throw(500, `获取奖池组列表失败: ${error.message}`);
    }
  },

  // 添加默认的findOne方法
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.entityService.findOne('api::lottery-group.lottery-group' as any, id, {
        populate: ['coverImage', 'prizes']
      });
      return result;
    } catch (error) {
      console.error('获取奖池组详情失败:', error);
      ctx.throw(500, `获取奖池组详情失败: ${error.message}`);
    }
  },

  // 添加默认的create方法
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      const result = await strapi.entityService.create('api::lottery-group.lottery-group' as any, {
        data
      });
      return result;
    } catch (error) {
      console.error('创建奖池组失败:', error);
      ctx.throw(500, `创建奖池组失败: ${error.message}`);
    }
  },

  // 添加默认的update方法
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;
      const result = await strapi.entityService.update('api::lottery-group.lottery-group' as any, id, {
        data
      });
      return result;
    } catch (error) {
      console.error('更新奖池组失败:', error);
      ctx.throw(500, `更新奖池组失败: ${error.message}`);
    }
  },

  // 添加默认的delete方法
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.entityService.delete('api::lottery-group.lottery-group' as any, id);
      return result;
    } catch (error) {
      console.error('删除奖池组失败:', error);
      ctx.throw(500, `删除奖池组失败: ${error.message}`);
    }
  },
})); 