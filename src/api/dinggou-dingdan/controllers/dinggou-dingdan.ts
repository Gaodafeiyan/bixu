import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::dinggou-dingdan.dinggou-dingdan', ({ strapi }) => ({
  // 获取用户订单
  async getUserOrders(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { page = 1, pageSize = 10, status } = ctx.query;

      const filters: any = { user: userId };
      if (status) {
        filters.status = status;
      }

      const orders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
        filters,
        populate: ['jihua'],
        pagination: {
          page: parseInt(String(page)),
          pageSize: parseInt(String(pageSize))
        },
        sort: { createdAt: 'desc' }
      });

      ctx.body = {
        success: true,
        data: orders,
        pagination: {
          page: parseInt(String(page)),
          pageSize: parseInt(String(pageSize)),
          total: orders.length
        }
      };
    } catch (error) {
      console.error('获取用户订单失败:', error);
      ctx.throw(500, `获取用户订单失败: ${error.message}`);
    }
  },

  // 更新订单状态
  async updateOrderStatus(ctx) {
    try {
      const { orderId } = ctx.params;
      const { status } = ctx.request.body;
      const userId = ctx.state.user.id;

      // 获取订单信息
      const order = await strapi.entityService.findOne('api::dinggou-dingdan.dinggou-dingdan', orderId);
      if (!order) {
        return ctx.notFound('订单不存在');
      }

      // 验证订单所有者
      if (order.user !== userId) {
        return ctx.forbidden('无权操作此订单');
      }

      // 更新订单状态
      const updatedOrder = await strapi.entityService.update('api::dinggou-dingdan.dinggou-dingdan', orderId, {
        data: { status }
      });

      ctx.body = {
        success: true,
        data: updatedOrder,
        message: '订单状态更新成功'
      };
    } catch (error) {
      console.error('更新订单状态失败:', error);
      ctx.throw(500, `更新订单状态失败: ${error.message}`);
    }
  },

  // 获取订单详情
  async getOrderDetail(ctx) {
    try {
      const { orderId } = ctx.params;
      const userId = ctx.state.user.id;

      const order = await strapi.entityService.findOne('api::dinggou-dingdan.dinggou-dingdan', orderId, {
        populate: ['user', 'jihua', 'jiangli']
      });

      if (!order) {
        return ctx.notFound('订单不存在');
      }

      // 验证订单所有者
      if (order.user.id !== userId) {
        return ctx.forbidden('无权查看此订单');
      }

      ctx.body = {
        success: true,
        data: order
      };
    } catch (error) {
      console.error('获取订单详情失败:', error);
      ctx.throw(500, `获取订单详情失败: ${error.message}`);
    }
  },

  // 重写create方法，添加数据验证
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      
      // 验证data字段
      if (!data) {
        return ctx.badRequest('缺少data字段');
      }
      
      // 验证必要字段
      if (!data.user || !data.jihua || !data.amount) {
        return ctx.badRequest('缺少必要字段');
      }
      
      // 验证用户是否存在
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', data.user);
      if (!user) {
        return ctx.badRequest('用户不存在');
      }
      
      // 验证计划是否存在
      const plan = await strapi.entityService.findOne('api::dinggou-jihua.dinggou-jihua', data.jihua);
      if (!plan) {
        return ctx.badRequest('认购计划不存在');
      }
      
      const order = await strapi.entityService.create('api::dinggou-dingdan.dinggou-dingdan', {
        data: {
          user: data.user,
          jihua: data.jihua,
          amount: data.amount,
          principal: data.principal || data.amount,
          yield_rate: data.yield_rate || plan.jingtaiBili,
          cycle_days: data.cycle_days || plan.zhouQiTian,
          start_at: data.start_at || new Date(),
          end_at: data.end_at || new Date(Date.now() + (data.cycle_days || plan.zhouQiTian) * 24 * 60 * 60 * 1000),
          status: data.status || 'pending'
        }
      });
      
      ctx.body = { 
        success: true,
        data: order 
      };
    } catch (error) {
      console.error('创建订单失败:', error);
      ctx.throw(500, `创建订单失败: ${error.message}`);
    }
  },
})); 