import Bull from 'bull';

export default ({ strapi }) => ({
  // 发货队列
  shippingQueue: new Bull('shipping-queue', {
    redis: process.env.REDIS_URL || 'redis://localhost:6379'
  }),

  // 初始化发货队列
  async initializeShippingQueue() {
    // 处理发货任务
    this.shippingQueue.process(async (job) => {
      try {
        const { shippingOrderId } = job.data;
        await this.processShippingOrder(shippingOrderId);
      } catch (error) {
        console.error('处理发货任务失败:', error);
        throw error;
      }
    });

    // 监听队列事件
    this.shippingQueue.on('completed', (job) => {
      console.log(`发货任务完成: ${job.id}`);
    });

    this.shippingQueue.on('failed', (job, err) => {
      console.error(`发货任务失败: ${job.id}`, err);
    });

    console.log('发货队列初始化完成');
  },

  // 处理发货订单
  async processShippingOrder(shippingOrderId: number) {
    try {
      const shippingOrder = await strapi.entityService.findOne('api::shipping-order.shipping-order' as any, shippingOrderId, {
        populate: ['record', 'record.jiangpin']
      });

      if (!shippingOrder) {
        throw new Error('发货订单不存在');
      }

      console.log(`开始处理发货订单: ${shippingOrderId}`);

      // 更新状态为处理中
      await strapi.entityService.update('api::shipping-order.shipping-order' as any, shippingOrderId, {
        data: {
          status: 'processing',
          log: JSON.stringify([{
            time: new Date().toISOString(),
            action: '开始处理发货',
            message: '订单已进入处理队列'
          }])
        }
      });

      // 调用物流API（这里使用模拟实现）
      const trackingInfo = await this.callLogisticsAPI(shippingOrder);

      // 更新物流信息
      await strapi.entityService.update('api::shipping-order.shipping-order' as any, shippingOrderId, {
        data: {
          trackingNo: trackingInfo.trackingNo,
          carrier: trackingInfo.carrier,
          status: 'shipped',
          shippedAt: new Date(),
          log: JSON.stringify([
            {
              time: new Date().toISOString(),
              action: '发货成功',
              message: `物流单号: ${trackingInfo.trackingNo}`,
              carrier: trackingInfo.carrier
            }
          ])
        }
      });

      console.log(`发货订单处理完成: ${shippingOrderId}, 物流单号: ${trackingInfo.trackingNo}`);
    } catch (error) {
      console.error(`处理发货订单失败: ${shippingOrderId}`, error);
      
      // 更新失败状态
      await strapi.entityService.update('api::shipping-order.shipping-order' as any, shippingOrderId, {
        data: {
          status: 'failed',
          log: JSON.stringify([
            {
              time: new Date().toISOString(),
              action: '发货失败',
              message: error.message
            }
          ])
        }
      });

      throw error;
    }
  },

  // 调用物流API（模拟实现）
  async callLogisticsAPI(shippingOrder: any): Promise<any> {
    // 这里应该调用真实的物流API
    // 目前返回模拟数据
    return {
      trackingNo: `SF${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      carrier: '顺丰速运'
    };
  },

  // 添加发货任务到队列
  async addShippingJob(shippingOrderId: number) {
    try {
      await this.shippingQueue.add({
        shippingOrderId
      }, {
        delay: 5000, // 5秒后执行
        attempts: 3,  // 最多重试3次
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      });

      console.log(`发货任务已添加到队列: ${shippingOrderId}`);
    } catch (error) {
      console.error('添加发货任务失败:', error);
      throw error;
    }
  },

  // 获取发货统计
  async getShippingStats() {
    try {
      const totalOrders = await strapi.entityService.count('api::shipping-order.shipping-order' as any);
      const pendingOrders = await strapi.entityService.count('api::shipping-order.shipping-order' as any, {
        filters: { status: 'pending' }
      });
      const processingOrders = await strapi.entityService.count('api::shipping-order.shipping-order' as any, {
        filters: { status: 'processing' }
      });
      const shippedOrders = await strapi.entityService.count('api::shipping-order.shipping-order' as any, {
        filters: { status: 'shipped' }
      });
      const deliveredOrders = await strapi.entityService.count('api::shipping-order.shipping-order' as any, {
        filters: { status: 'delivered' }
      });

      return {
        total: totalOrders,
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders
      };
    } catch (error) {
      console.error('获取发货统计失败:', error);
      throw error;
    }
  },

  // 批量导出发货订单
  async exportShippingOrders(filters: any = {}) {
    try {
      const orders = await strapi.entityService.findMany('api::shipping-order.shipping-order' as any, {
        filters,
        populate: ['record', 'record.user', 'record.jiangpin'],
        sort: { createdAt: 'desc' }
      });

      // 转换为CSV格式
      const csvData = orders.map((order: any) => ({
        '订单ID': order.id,
        '用户ID': order.record?.user?.id,
        '用户名': order.record?.user?.username,
        '奖品名称': order.record?.jiangpin?.name,
        '收货人': order.receiverName,
        '手机号': order.mobile,
        '地址': `${order.province} ${order.city} ${order.district} ${order.address}`,
        '物流单号': order.trackingNo || '',
        '承运商': order.carrier || '',
        '状态': order.status,
        '创建时间': order.createdAt,
        '发货时间': order.shippedAt || ''
      }));

      return csvData;
    } catch (error) {
      console.error('导出发货订单失败:', error);
      throw error;
    }
  }
}); 