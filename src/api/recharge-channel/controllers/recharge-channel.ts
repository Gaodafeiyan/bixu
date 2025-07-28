import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreController('api::recharge-channel.recharge-channel' as any, ({ strapi }) => ({
  // 重写默认的find方法
  async find(ctx) {
    try {
      const result = await strapi.entityService.findPage('api::recharge-channel.recharge-channel' as any, {
        ...ctx.query,
        populate: []
      });
      return result;
    } catch (error) {
      console.error('获取充值通道列表失败:', error);
      ctx.throw(500, `获取充值通道列表失败: ${error.message}`);
    }
  },

  // 添加默认的findOne方法
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.entityService.findOne('api::recharge-channel.recharge-channel' as any, id, {
        populate: []
      });
      return result;
    } catch (error) {
      console.error('获取充值通道详情失败:', error);
      ctx.throw(500, `获取充值通道详情失败: ${error.message}`);
    }
  },

  // 添加默认的create方法
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      const result = await strapi.entityService.create('api::recharge-channel.recharge-channel' as any, {
        data
      });
      return result;
    } catch (error) {
      console.error('创建充值通道失败:', error);
      ctx.throw(500, `创建充值通道失败: ${error.message}`);
    }
  },

  // 添加默认的update方法
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;
      const result = await strapi.entityService.update('api::recharge-channel.recharge-channel' as any, id, {
        data
      });
      return result;
    } catch (error) {
      console.error('更新充值通道失败:', error);
      ctx.throw(500, `更新充值通道失败: ${error.message}`);
    }
  },

  // 添加默认的delete方法
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.entityService.delete('api::recharge-channel.recharge-channel' as any, id);
      return result;
    } catch (error) {
      console.error('删除充值通道失败:', error);
      ctx.throw(500, `删除充值通道失败: ${error.message}`);
    }
  },

  // 获取可用的充值通道
  async getAvailableChannels(ctx) {
    try {
      const { type = 'both' } = ctx.query;
      
      const channels = await strapi.entityService.findMany('api::recharge-channel.recharge-channel' as any, {
        filters: {
          status: 'active',
          channelType: { $in: [type, 'both'] }
        },
        fields: ['id', 'name', 'network', 'asset', 'minAmount', 'maxAmount', 'feeRate', 'fixedFee']
      });

      ctx.body = {
        success: true,
        data: channels,
        message: '获取通道列表成功'
      };
    } catch (error) {
      console.error('获取通道列表失败:', error);
      ctx.throw(500, `获取通道列表失败: ${error.message}`);
    }
  },

  // 创建充值订单
  async createRecharge(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { amount, channelId } = ctx.request.body;

      if (!amount || !channelId) {
        return ctx.badRequest('缺少必要参数');
      }

      // 验证金额格式
      if (isNaN(Number(amount)) || Number(amount) <= 0) {
        return ctx.badRequest('充值金额必须是大于0的数字');
      }

      const rechargeOrder = await strapi
        .service('api::recharge-channel.recharge-channel')
        .createRechargeOrder(userId, amount, channelId);

      ctx.body = {
        success: true,
        data: {
          orderNo: rechargeOrder.orderNo,
          amount: rechargeOrder.amount,
          receiveAddress: rechargeOrder.receiveAddress,
          expectedTime: rechargeOrder.expectedTime,
          status: rechargeOrder.status
        },
        message: '充值订单创建成功'
      };
    } catch (error) {
      console.error('创建充值订单失败:', error);
      ctx.throw(500, `创建充值订单失败: ${error.message}`);
    }
  },

  // 创建提现订单
  async createWithdrawal(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { amount, address, network = 'BSC' } = ctx.request.body;

      if (!amount || !address) {
        return ctx.badRequest('缺少必要参数');
      }

      // 验证金额格式
      if (isNaN(Number(amount)) || Number(amount) <= 0) {
        return ctx.badRequest('提现金额必须是大于0的数字');
      }

      // 验证地址格式（简单验证）
      if (address.length < 10) {
        return ctx.badRequest('提现地址格式不正确');
      }

      const withdrawalOrder = await strapi
        .service('api::recharge-channel.recharge-channel')
        .createWithdrawalOrder(userId, amount, address, network);

      ctx.body = {
        success: true,
        data: {
          orderNo: withdrawalOrder.orderNo,
          amount: withdrawalOrder.amount,
          actualAmount: withdrawalOrder.actualAmount,
          fee: withdrawalOrder.fee,
          status: withdrawalOrder.status,
          requestTime: withdrawalOrder.requestTime
        },
        message: '提现订单创建成功'
      };
    } catch (error) {
      console.error('创建提现订单失败:', error);
      ctx.throw(500, `创建提现订单失败: ${error.message}`);
    }
  },

  // 获取用户充值订单列表
  async getUserRechargeOrders(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { page = 1, pageSize = 10, status } = ctx.query;

      const filters: any = { user: { id: userId } };
      if (status) {
        filters.status = status;
      }

      const [orders, total] = await strapi.db.query('api::recharge-order.recharge-order' as any).findWithCount({
        where: filters,
        populate: ['channel'],
        orderBy: { createdAt: 'desc' },
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize)
      });

      ctx.body = {
        success: true,
        data: orders,
        message: '获取充值订单列表成功'
      };
    } catch (error) {
      console.error('获取充值订单列表失败:', error);
      ctx.throw(500, `获取充值订单列表失败: ${error.message}`);
    }
  },

  // 获取用户提现订单列表
  async getUserWithdrawalOrders(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { page = 1, pageSize = 10, status } = ctx.query;

      const filters: any = { user: { id: userId } };
      if (status) {
        filters.status = status;
      }

      const [orders, total] = await strapi.db.query('api::withdrawal-order.withdrawal-order' as any).findWithCount({
        where: filters,
        populate: ['channel'],
        orderBy: { createdAt: 'desc' },
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize)
      });

      ctx.body = {
        success: true,
        data: orders,
        message: '获取提现订单列表成功'
      };
    } catch (error) {
      console.error('获取提现订单列表失败:', error);
      ctx.throw(500, `获取提现订单列表失败: ${error.message}`);
    }
  },

  // 获取充值订单详情
  async getRechargeOrderDetail(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { id } = ctx.params;

      const order = await strapi.entityService.findOne('api::recharge-order.recharge-order' as any, id, {
        populate: ['user', 'channel']
      });

      if (!order) {
        return ctx.notFound('订单不存在');
      }

      // 验证用户权限
      if ((order as any).user.id !== userId) {
        return ctx.forbidden('无权访问此订单');
      }

      ctx.body = {
        success: true,
        data: order,
        message: '获取充值订单详情成功'
      };
    } catch (error) {
      console.error('获取充值订单详情失败:', error);
      ctx.throw(500, `获取充值订单详情失败: ${error.message}`);
    }
  },

  // 获取提现订单详情
  async getWithdrawalOrderDetail(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { id } = ctx.params;

      const order = await strapi.entityService.findOne('api::withdrawal-order.withdrawal-order' as any, id, {
        populate: ['user', 'channel']
      });

      if (!order) {
        return ctx.notFound('订单不存在');
      }

      // 验证用户权限
      if ((order as any).user.id !== userId) {
        return ctx.forbidden('无权访问此订单');
      }

      ctx.body = {
        success: true,
        data: order,
        message: '获取提现订单详情成功'
      };
    } catch (error) {
      console.error('获取提现订单详情失败:', error);
      ctx.throw(500, `获取提现订单详情失败: ${error.message}`);
    }
  },

  // 取消充值订单
  async cancelRechargeOrder(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { id } = ctx.params;

      const order = await strapi.entityService.findOne('api::recharge-order.recharge-order' as any, id, {
        populate: ['user']
      });

      if (!order) {
        return ctx.notFound('订单不存在');
      }

      // 验证用户权限
      if ((order as any).user.id !== userId) {
        return ctx.forbidden('无权操作此订单');
      }

      // 只能取消待处理的订单
      if ((order as any).status !== 'pending') {
        return ctx.badRequest('只能取消待处理的订单');
      }

      // 检查是否超时
      if (new Date() > new Date((order as any).expectedTime)) {
        return ctx.badRequest('订单已超时，无法取消');
      }

      await strapi.entityService.update('api::recharge-order.recharge-order' as any, id, {
        data: { status: 'cancelled' }
      });

      ctx.body = {
        success: true,
        message: '订单取消成功'
      };
    } catch (error) {
      console.error('取消充值订单失败:', error);
      ctx.throw(500, `取消充值订单失败: ${error.message}`);
    }
  },

  // 获取充值统计
  async getRechargeStats(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { days = 30 } = ctx.query;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      const orders = await strapi.entityService.findMany('api::recharge-order.recharge-order' as any, {
        filters: {
          user: { id: userId },
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      });

      const orderList = Array.isArray(orders) ? orders : [orders];
      const totalAmount = orderList.reduce((sum, order) => {
        return sum + new Decimal(order.amount).toNumber();
      }, 0);

      const totalCount = orderList.length;

      ctx.body = {
        success: true,
        data: {
          totalAmount: totalAmount.toFixed(2),
          totalCount,
          period: `${days}天`
        },
        message: '获取充值统计成功'
      };
    } catch (error) {
      console.error('获取充值统计失败:', error);
      ctx.throw(500, `获取充值统计失败: ${error.message}`);
    }
  },

  // 获取提现统计
  async getWithdrawalStats(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { days = 30 } = ctx.query;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      const orders = await strapi.entityService.findMany('api::withdrawal-order.withdrawal-order' as any, {
        filters: {
          user: { id: userId },
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      });

      const orderList = Array.isArray(orders) ? orders : [orders];
      const totalAmount = orderList.reduce((sum, order) => {
        return sum + new Decimal(order.amount).toNumber();
      }, 0);

      const totalCount = orderList.length;

      ctx.body = {
        success: true,
        data: {
          totalAmount: totalAmount.toFixed(2),
          totalCount,
          period: `${days}天`
        },
        message: '获取提现统计成功'
      };
    } catch (error) {
      console.error('获取提现统计失败:', error);
      ctx.throw(500, `获取提现统计失败: ${error.message}`);
    }
  },
})); 