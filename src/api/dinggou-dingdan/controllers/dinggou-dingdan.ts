import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::dinggou-dingdan.dinggou-dingdan', ({ strapi }) => ({
  // 添加默认的find方法
  async find(ctx) {
    try {
      const result = await strapi.entityService.findPage('api::dinggou-dingdan.dinggou-dingdan', {
        ...ctx.query,
        populate: ['user', 'jihua']
      });
      return result;
    } catch (error) {
      console.error('获取订单列表失败:', error);
      ctx.throw(500, `获取订单列表失败: ${error.message}`);
    }
  },

  // 添加默认的findOne方法
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.entityService.findOne('api::dinggou-dingdan.dinggou-dingdan', id, {
        populate: ['user', 'jihua']
      });
      return result;
    } catch (error) {
      console.error('获取订单详情失败:', error);
      ctx.throw(500, `获取订单详情失败: ${error.message}`);
    }
  },

  // 添加默认的update方法
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;
      const result = await strapi.entityService.update('api::dinggou-dingdan.dinggou-dingdan', id, {
        data
      });
      return result;
    } catch (error) {
      console.error('更新订单失败:', error);
      ctx.throw(500, `更新订单失败: ${error.message}`);
    }
  },

  // 添加默认的delete方法
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.entityService.delete('api::dinggou-dingdan.dinggou-dingdan', id);
      return result;
    } catch (error) {
      console.error('删除订单失败:', error);
      ctx.throw(500, `删除订单失败: ${error.message}`);
    }
  },

  // 获取用户订单
  async getUserOrders(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { page = 1, pageSize = 10, status } = ctx.query;

      const filters: any = { user: { id: userId } };
      if (status) {
        filters.status = status;
      }

      const orders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
        filters: { user: { id: userId } },
        populate: ['jihua'],
        pagination: {
          page: parseInt(String(page)),
          pageSize: parseInt(String(pageSize))
        }
      }) as any[];

      ctx.body = {
        success: true,
        data: {
          orders,
          pagination: {
            page: parseInt(String(page)),
            pageSize: parseInt(String(pageSize)),
            total: orders.length
          }
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
      if ((order as any).user !== userId) {
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
      
      if (!data) {
        return ctx.badRequest('缺少data字段');
      }
      
      if (!data.user || !data.jihua || !data.amount) {
        return ctx.badRequest('缺少必要字段');
      }
      
      // 验证用户是否存在
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', data.user);
      if (!user) {
        return ctx.badRequest('用户不存在');
      }
      
      // 验证计划是否存在
      const jihua = await strapi.entityService.findOne('api::dinggou-jihua.dinggou-jihua', data.jihua);
      if (!jihua) {
        return ctx.badRequest('认购计划不存在');
      }
      
      // 验证金额
      if (isNaN(Number(data.amount)) || Number(data.amount) <= 0) {
        return ctx.badRequest('金额必须是大于0的数字');
      }
      
      const order = await strapi.entityService.create('api::dinggou-dingdan.dinggou-dingdan', {
        data: {
          user: data.user,
          jihua: data.jihua,
          amount: data.amount,
          principal: data.principal || data.amount,
          yield_rate: data.yield_rate || 0,
          cycle_days: data.cycle_days || 30,
          start_at: data.start_at || new Date(),
          end_at: data.end_at || new Date(Date.now() + (data.cycle_days || 30) * 24 * 60 * 60 * 1000),
          status: data.status || 'pending'
        }
      });
      
      ctx.body = {
        success: true,
        data: order,
        message: '订单创建成功'
      };
    } catch (error) {
      console.error('创建订单失败:', error);
      ctx.throw(500, `创建订单失败: ${error.message}`);
    }
  },

  // 调试：获取用户所有订单详情
  async debugUserOrders(ctx) {
    try {
      const userId = ctx.state.user.id;
      
      // 获取用户所有订单（不限制状态）
      const allOrders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
        filters: { user: { id: userId } },
        populate: ['jihua']
      }) as any[];

      console.log(`用户 ${userId} 的所有订单:`);
      allOrders.forEach((order, index) => {
        console.log(`订单 ${index + 1}:`);
        console.log(`  - ID: ${order.id}`);
        console.log(`  - 状态: ${order.status}`);
        console.log(`  - 金额: ${order.principal || order.amount}`);
        console.log(`  - 计划ID: ${order.jihua?.id}`);
        console.log(`  - 计划名称: ${order.jihua?.name}`);
        console.log(`  - 创建时间: ${order.createdAt}`);
        console.log(`  - 更新时间: ${order.updatedAt}`);
      });

      ctx.body = {
        success: true,
        data: {
          userId,
          totalOrders: allOrders.length,
          orders: allOrders.map(order => ({
            id: order.id,
            status: order.status,
            principal: order.principal,
            amount: order.amount,
            jihuaId: order.jihua?.id,
            jihuaName: order.jihua?.name,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
          }))
        }
      };
    } catch (error) {
      console.error('调试用户订单失败:', error);
      ctx.throw(500, `调试用户订单失败: ${error.message}`);
    }
  },
})); 