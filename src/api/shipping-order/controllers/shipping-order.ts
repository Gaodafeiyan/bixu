import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::shipping-order.shipping-order' as any, ({ strapi }) => ({
  // 继承默认的find方法
  async find(ctx) {
    try {
      const result = await strapi.entityService.findPage('api::shipping-order.shipping-order' as any, {
        ...ctx.query,
        populate: ['record', 'record.user', 'record.jiangpin']
      });
      return result;
    } catch (error) {
      console.error('获取发货订单列表失败:', error);
      ctx.throw(500, `获取发货订单列表失败: ${error.message}`);
    }
  },

  // 添加默认的findOne方法
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.entityService.findOne('api::shipping-order.shipping-order' as any, id, {
        populate: ['record', 'record.user', 'record.jiangpin']
      });
      return result;
    } catch (error) {
      console.error('获取发货订单详情失败:', error);
      ctx.throw(500, `获取发货订单详情失败: ${error.message}`);
    }
  },

  // 添加默认的create方法
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      const result = await strapi.entityService.create('api::shipping-order.shipping-order' as any, {
        data
      });
      return result;
    } catch (error) {
      console.error('创建发货订单失败:', error);
      ctx.throw(500, `创建发货订单失败: ${error.message}`);
    }
  },

  // 添加默认的update方法
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;
      const result = await strapi.entityService.update('api::shipping-order.shipping-order' as any, id, {
        data
      });
      return result;
    } catch (error) {
      console.error('更新发货订单失败:', error);
      ctx.throw(500, `更新发货订单失败: ${error.message}`);
    }
  },

  // 添加默认的delete方法
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.entityService.delete('api::shipping-order.shipping-order' as any, id);
      return result;
    } catch (error) {
      console.error('删除发货订单失败:', error);
      ctx.throw(500, `删除发货订单失败: ${error.message}`);
    }
  },

  // 获取发货统计
  async getShippingStats(ctx) {
    try {
      const shippingService = strapi.service('shipping-service' as any);
      const stats = await shippingService.getShippingStats();

      ctx.body = {
        success: true,
        data: stats,
        message: '获取发货统计成功'
      };
    } catch (error) {
      console.error('获取发货统计失败:', error);
      ctx.throw(500, `获取发货统计失败: ${error.message}`);
    }
  },

  // 批量发货
  async batchShip(ctx) {
    try {
      const { orderIds } = ctx.request.body;

      if (!orderIds || !Array.isArray(orderIds)) {
        return ctx.badRequest('请选择要发货的订单');
      }

      const shippingService = strapi.service('shipping-service' as any);
      const results = [];

      for (const orderId of orderIds) {
        try {
          await shippingService.addShippingJob(orderId);
          results.push({ orderId, success: true });
        } catch (error) {
          results.push({ orderId, success: false, error: error.message });
        }
      }

      ctx.body = {
        success: true,
        data: {
          total: orderIds.length,
          results
        },
        message: '批量发货任务已添加到队列'
      };
    } catch (error) {
      console.error('批量发货失败:', error);
      ctx.throw(500, `批量发货失败: ${error.message}`);
    }
  },

  // 导出发货订单
  async exportOrders(ctx) {
    try {
      const { filters } = ctx.query;
      const shippingService = strapi.service('shipping-service' as any);
      const csvData = await shippingService.exportShippingOrders(filters);

      ctx.body = {
        success: true,
        data: csvData,
        message: '导出发货订单成功'
      };
    } catch (error) {
      console.error('导出发货订单失败:', error);
      ctx.throw(500, `导出发货订单失败: ${error.message}`);
    }
  },

  // 更新收货地址
  async updateAddress(ctx) {
    try {
      const { id } = ctx.params;
      const { receiverName, mobile, province, city, district, address, zipCode } = ctx.request.body;

      const updateData = {
        receiverName,
        mobile,
        province,
        city,
        district,
        address,
        zipCode
      };

      const result = await strapi.entityService.update('api::shipping-order.shipping-order' as any, id, {
        data: updateData
      });

      ctx.body = {
        success: true,
        data: result,
        message: '更新收货地址成功'
      };
    } catch (error) {
      console.error('更新收货地址失败:', error);
      ctx.throw(500, `更新收货地址失败: ${error.message}`);
    }
  },

  // 手动发货
  async manualShip(ctx) {
    try {
      const { id } = ctx.params;
      const { trackingNo, carrier } = ctx.request.body;

      const updateData = {
        trackingNo,
        carrier,
        status: 'shipped',
        shippedAt: new Date(),
        log: JSON.stringify([
          {
            time: new Date().toISOString(),
            action: '手动发货',
            message: `物流单号: ${trackingNo}, 承运商: ${carrier}`
          }
        ])
      };

      const result = await strapi.entityService.update('api::shipping-order.shipping-order' as any, id, {
        data: updateData
      });

      ctx.body = {
        success: true,
        data: result,
        message: '手动发货成功'
      };
    } catch (error) {
      console.error('手动发货失败:', error);
      ctx.throw(500, `手动发货失败: ${error.message}`);
    }
  },

  // 获取待发货订单
  async getPendingOrders(ctx) {
    try {
      const { page = 1, pageSize = 20 } = ctx.query;

      const result = await strapi.entityService.findPage('api::shipping-order.shipping-order' as any, {
        filters: { status: 'pending' },
        populate: ['record', 'record.user', 'record.jiangpin'],
        pagination: {
          page: parseInt(String(page)),
          pageSize: parseInt(String(pageSize))
        },
        sort: { createdAt: 'asc' }
      });

      ctx.body = {
        success: true,
        data: result,
        message: '获取待发货订单成功'
      };
    } catch (error) {
      console.error('获取待发货订单失败:', error);
      ctx.throw(500, `获取待发货订单失败: ${error.message}`);
    }
  },

  // 手动创建发货订单（用于处理现有记录）
  async createFromRecord(ctx) {
    try {
      const { recordId } = ctx.request.body;
      
      // 检查是否已存在发货订单
      const existingOrder = await strapi.entityService.findMany('api::shipping-order.shipping-order' as any, {
        filters: { record: recordId }
      });
      
      if (existingOrder && existingOrder.length > 0) {
        return ctx.badRequest('该记录已存在发货订单');
      }
      
      // 获取抽奖记录
      const record = await strapi.entityService.findOne('api::choujiang-ji-lu.choujiang-ji-lu' as any, recordId, {
        populate: ['jiangpin']
      });
      
      if (!record) {
        return ctx.badRequest('抽奖记录不存在');
      }
      
      // 创建发货订单
      const shippingOrder = await strapi.entityService.create('api::shipping-order.shipping-order' as any, {
        data: {
          record: recordId,
          status: 'pending',
          remark: `奖品: ${(record as any).jiangpin?.name || '未知奖品'}`
        }
      });
      
      ctx.body = {
        success: true,
        data: shippingOrder,
        message: '发货订单创建成功'
      };
    } catch (error) {
      console.error('创建发货订单失败:', error);
      ctx.throw(500, `创建发货订单失败: ${error.message}`);
    }
  }
})); 