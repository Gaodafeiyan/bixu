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

      console.log(`🔍 创建充值订单 - 用户ID: ${userId}, 金额: ${amount}, 通道ID: ${channelId}`);

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

      console.log(`✅ 充值订单创建成功 - 订单号: ${rechargeOrder.orderNo}, 用户ID: ${userId}`);
      console.log(`📍 充值地址: ${rechargeOrder.receiveAddress}`);
      console.log(`💰 充值金额: ${rechargeOrder.amount} ${rechargeOrder.currency}`);

      // 快速触发一次区块扫描，缩短入账延迟（仅扫描最近窗口）
      try {
        const blockchainService = strapi.service('api::recharge-channel.blockchain-service');
        if (blockchainService?.scanNextWindow) {
          // 异步触发，不阻塞接口返回
          blockchainService.scanNextWindow();
          console.log('⚡ 已触发一次快速扫描窗口');
        }
      } catch (e) {
        console.warn('⚠️ 快速扫描触发失败:', e);
      }

      ctx.body = {
        success: true,
        data: {
          orderNo: rechargeOrder.orderNo,
          amount: rechargeOrder.amount,
          receiveAddress: rechargeOrder.receiveAddress,
          expectedTime: rechargeOrder.expectedTime,
          status: rechargeOrder.status
        } as any as any,
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
      const { amount, address, network = 'BSC', currency = 'USDT' } = ctx.request.body;

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
        .createWithdrawalOrder(userId, amount, address, network, currency);

      ctx.body = {
        success: true,
        data: {
          orderNo: withdrawalOrder.orderNo,
          amount: withdrawalOrder.amount,
          actualAmount: withdrawalOrder.actualAmount,
          fee: withdrawalOrder.fee,
          status: withdrawalOrder.status,
          requestTime: withdrawalOrder.requestTime
        } as any as any,
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
        data: { status: 'cancelled' } as any as any as any as any as any
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

  // 简化的充值接口 - 不需要充值通道
  async simpleRecharge(ctx) {
    try {
      const { amount } = ctx.request.body;
      const userId = ctx.state.user.id; // 获取当前登录用户ID

      if (!amount) {
        return ctx.badRequest('缺少充值金额');
      }

      // 验证金额格式
      if (isNaN(Number(amount)) || Number(amount) <= 0) {
        return ctx.badRequest('充值金额必须是大于0的数字');
      }

      // 获取可用的充值通道
      const channels = await strapi.entityService.findMany('api::recharge-channel.recharge-channel' as any, {
        filters: {
          status: 'active',
          channelType: { $in: ['recharge', 'both'] },
          asset: 'USDT' // 只获取USDT充值通道
        },
        fields: ['id', 'name', 'walletAddress', 'network', 'asset', 'minAmount', 'maxAmount']
      });

      if (!channels || !Array.isArray(channels) || channels.length === 0) {
        return ctx.badRequest('没有可用的USDT充值通道，请在后台配置USDT充值通道');
      }

      // 选择第一个可用的通道
      const selectedChannel = channels[0] as any;
      
      // 验证金额是否在通道限制范围内
      const amountNum = Number(amount);
      if (selectedChannel.minAmount && amountNum < selectedChannel.minAmount) {
        return ctx.badRequest(`充值金额不能少于 ${selectedChannel.minAmount} ${selectedChannel.asset}`);
      }
      if (selectedChannel.maxAmount && amountNum > selectedChannel.maxAmount) {
        return ctx.badRequest(`充值金额不能超过 ${selectedChannel.maxAmount} ${selectedChannel.asset}`);
      }

      // 使用通道配置的钱包地址，统一为小写避免大小写匹配问题
      const receiveAddress = selectedChannel.walletAddress.toLowerCase();
      
      if (!receiveAddress) {
        return ctx.badRequest('充值通道未配置钱包地址');
      }
      
      // 生成订单号
      const orderNo = `RC${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      // 创建充值订单
      const rechargeOrder = await strapi.entityService.create('api::recharge-order.recharge-order' as any, {
        data: {
          orderNo,
          amount: amount,
          currency: selectedChannel.asset || "USDT",
          status: 'pending',
          user: userId, // 使用当前登录用户ID
          receiveAddress: receiveAddress,
          expectedTime: new Date(Date.now() + 30 * 60 * 1000), // 30分钟后过期
          fee: 0,
          actualAmount: amount,
          channel: selectedChannel.id,
        } as any as any
      });

      console.log(`✅ 充值订单创建成功 - 订单号: ${rechargeOrder.orderNo}, 用户ID: ${userId}`);
      console.log(`📍 充值地址: ${rechargeOrder.receiveAddress}`);
      console.log(`💰 充值金额: ${rechargeOrder.amount} ${rechargeOrder.currency}`);

      ctx.body = {
        success: true,
        data: {
          id: rechargeOrder.id,
          orderNo: rechargeOrder.orderNo,
          amount: rechargeOrder.amount,
          currency: rechargeOrder.currency,
          status: rechargeOrder.status,
          receiveAddress: rechargeOrder.receiveAddress,
          expectedTime: rechargeOrder.expectedTime,
          createdAt: rechargeOrder.createdAt,
          updatedAt: rechargeOrder.updatedAt,
          channelName: selectedChannel.name,
          network: selectedChannel.network,
          message: "请向以下地址转账USDT，到账后自动放行"
        } as any as any,
        message: '充值订单创建成功'
      };
    } catch (error) {
      console.error('创建充值订单失败:', error);
      ctx.throw(500, `创建充值订单失败: ${error.message}`);
    }
  },

  // 简化的提现接口
  async simpleWithdrawal(ctx) {
    try {
      const { amount, address } = ctx.request.body;
      const userId = ctx.state.user.id; // 获取当前登录用户ID

      // 幂等与频控：5 秒内防重复提交（与AI兑换共享同一锁）
      const acquireUserOpLock = async (opKey: string, ttlMs: number) => {
        const key = `op_lock:${opKey}:${userId}`;
        const existing = await strapi.entityService.findMany('api::system-config.system-config' as any, {
          filters: { key },
          fields: ['id', 'value'],
          limit: 1,
        }) as any[];
        const now = Date.now();
        if (Array.isArray(existing) && existing.length > 0) {
          const ts = parseInt((existing[0] as any).value || '0');
          if (!isNaN(ts) && now - ts < ttlMs) return false;
          await strapi.entityService.update('api::system-config.system-config' as any, (existing[0] as any).id, { data: { value: String(now) } as any });
          return true;
        }
        await strapi.entityService.create('api::system-config.system-config' as any, { data: { key, value: String(now) } as any });
        return true;
      };

      const locked = await acquireUserOpLock('withdraw_or_exchange', 5000);
      if (!locked) return ctx.throw(429, '操作过于频繁，请稍后再试');

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

      // 验证用户余额
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: { id: userId } }
      });

      const wallet = wallets[0];
      if (!wallet) {
        return ctx.badRequest('用户钱包不存在');
      }

      const walletBalance = new Decimal(wallet.usdtYue || 0);
      const withdrawalAmount = new Decimal(amount);

      if (walletBalance.lessThan(withdrawalAmount)) {
        return ctx.badRequest('余额不足');
      }

      // 检查是否有可用的提现通道
      const channels = await strapi.entityService.findMany('api::recharge-channel.recharge-channel' as any, {
        filters: {
          status: 'active',
          channelType: { $in: ['withdrawal', 'both'] },
          asset: 'USDT'
        },
        fields: ['id', 'name', 'walletAddress', 'walletPrivateKey']
      });

      if (!channels || !Array.isArray(channels) || channels.length === 0) {
        return ctx.badRequest('没有可用的USDT提现通道，请在后台配置USDT提现通道');
      }

      // 检查提现钱包是否有足够余额
      const blockchainService = strapi.service('api::recharge-channel.blockchain-service');
      if (blockchainService) {
        try {
          const walletConfig = await blockchainService.getWalletConfig('withdrawal', 'USDT');
          if (walletConfig) {
            const rawBalance = await strapi.service('api::recharge-channel.blockchain-service').usdtContract.methods.balanceOf(walletConfig.address).call();
            const decimals = await strapi.service('api::recharge-channel.blockchain-service').usdtContract.methods.decimals().call();
            const base = new Decimal(10).pow(decimals);
            const systemBalance = new Decimal(rawBalance).dividedBy(base);
            
            if (systemBalance.lessThan(withdrawalAmount)) {
              return ctx.badRequest(`系统提现钱包余额不足，当前余额: ${systemBalance.toString()} USDT`);
            }
          }
        } catch (error) {
          console.warn('检查系统钱包余额失败:', error);
        }
      }

      // 生成订单号
      const orderNo = `WD${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      // 查重：短时间内同地址同金额的 pending 订单
      const dup = await strapi.entityService.findMany('api::withdrawal-order.withdrawal-order' as any, {
        filters: { user: { id: userId }, status: 'pending', amount: amount.toString(), withdrawAddress: address },
        fields: ['id', 'createdAt'],
        sort: { createdAt: 'desc' },
        limit: 1,
      }) as any[];
      if (Array.isArray(dup) && dup.length) {
        const createdAt = new Date((dup[0] as any).createdAt).getTime();
        if (!isNaN(createdAt) && Date.now() - createdAt < 60_000) {
          return ctx.throw(429, '检测到重复提交，请稍后再试');
        }
      }

      // 计算手续费并校验实到金额>0
      const fee = new Decimal(amount).mul(0.001).add(1); // 0.1% + 1 USDT固定手续费
      const actualAmount = new Decimal(amount).sub(fee);
      if (actualAmount.lessThanOrEqualTo(0)) {
        return ctx.badRequest('提现金额扣除手续费后不足，请增加提现金额');
      }

      // 立即扣除用户余额
      const newBalance = walletBalance.sub(withdrawalAmount);
      await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
        data: {
          usdtYue: newBalance.toString()
        } as any
      });

      // 创建提现订单
      const withdrawalOrder = await strapi.entityService.create('api::withdrawal-order.withdrawal-order' as any, {
        data: {
          orderNo,
          amount: amount,
          currency: "USDT",
          status: 'pending',
          user: userId,
          withdrawAddress: address,
          withdrawNetwork: "BSC",
          fee: fee.toString(),
          actualAmount: actualAmount.toString(),
          requestTime: new Date()
        } as any as any
      });

      ctx.body = {
        success: true,
        data: {
          orderNo: withdrawalOrder.orderNo,
          amount: withdrawalOrder.amount,
          actualAmount: withdrawalOrder.actualAmount,
          fee: withdrawalOrder.fee,
          status: withdrawalOrder.status,
          requestTime: withdrawalOrder.requestTime,
          message: "提现申请已提交，将在24小时内处理"
        } as any as any,
        message: '提现订单创建成功'
      };
    } catch (error) {
      console.error('创建提现订单失败:', error);
      ctx.throw(500, `创建提现订单失败: ${error.message}`);
    }
  },

  // AI代币提现接口
  async aiTokenWithdrawal(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { amount, address, network = 'BSC', tokenSymbol, isExchange = false } = ctx.request.body;

      // 幂等与频控：5 秒内防重复提交（与USDT提现共享同一锁）
      const acquireUserOpLock = async (opKey: string, ttlMs: number) => {
        const key = `op_lock:${opKey}:${userId}`;
        const existing = await strapi.entityService.findMany('api::system-config.system-config' as any, {
          filters: { key },
          fields: ['id', 'value'],
          limit: 1,
        }) as any[];
        const now = Date.now();
        if (Array.isArray(existing) && existing.length > 0) {
          const ts = parseInt((existing[0] as any).value || '0');
          if (!isNaN(ts) && now - ts < ttlMs) return false;
          await strapi.entityService.update('api::system-config.system-config' as any, (existing[0] as any).id, { data: { value: String(now) } as any });
          return true;
        }
        await strapi.entityService.create('api::system-config.system-config' as any, { data: { key, value: String(now) } as any });
        return true;
      };

      const locked = await acquireUserOpLock('withdraw_or_exchange', 5000);
      if (!locked) return ctx.throw(429, '操作过于频繁，请稍后再试');

      if (!amount || !tokenSymbol) {
        return ctx.badRequest('缺少必要参数');
      }

      // 验证金额格式
      if (isNaN(Number(amount)) || Number(amount) <= 0) {
        return ctx.badRequest('金额必须是大于0的数字');
      }

      // 如果是兑换操作，不需要验证地址
      if (!isExchange) {
        if (!address || address.length < 10) {
          return ctx.badRequest('提现地址格式不正确');
        }
      }

      // 验证代币符号
      const supportedTokens = ['LINK', 'SHIB', 'CAKE', 'TWT', 'ADA'];
      if (!supportedTokens.includes(tokenSymbol)) {
        return ctx.badRequest('不支持的代币类型');
      }

      console.log(`用户 ${userId} 操作: ${isExchange ? '兑换' : '提现'} ${tokenSymbol}`);

      if (isExchange) {
        // 兑换操作：只进行余额转换，不创建提现订单
        const exchangeResult = await strapi
          .service('api::recharge-channel.recharge-channel')
          .createAiTokenExchange(userId, tokenSymbol, amount);
        
        ctx.body = {
          success: true,
          data: {
            amount: amount,
            tokenSymbol: tokenSymbol,
            exchangeAmount: exchangeResult.exchangeAmount,
            message: "兑换成功"
          },
          message: 'AI代币兑换成功'
        };
      } else {
        // 提现操作：创建提现订单
        const withdrawalOrder = await strapi
          .service('api::recharge-channel.recharge-channel')
          .createAiTokenWithdrawalOrder(userId, tokenSymbol, amount, address, network);

        ctx.body = {
          success: true,
          data: {
            orderNo: withdrawalOrder.orderNo,
            amount: withdrawalOrder.amount,
            actualAmount: withdrawalOrder.actualAmount,
            fee: withdrawalOrder.fee,
            status: withdrawalOrder.status,
            requestTime: withdrawalOrder.requestTime,
            tokenSymbol: tokenSymbol
          } as any as any,
          message: 'AI代币提现订单创建成功'
        };
      }
    } catch (error) {
      console.error('AI代币操作失败:', error);
      ctx.throw(500, `AI代币操作失败: ${error.message}`);
    }
  },

  // 测试区块链服务
  async testBlockchainService(ctx) {
    try {
      const blockchainService = strapi.service('api::recharge-channel.blockchain-service');
      
      // 初始化服务
      const initialized = await blockchainService.init();
      
      if (!initialized) {
        return ctx.throw(500, '区块链服务初始化失败');
      }
      
      // 获取钱包余额
      const balance = await blockchainService.getWalletBalance();
      
      ctx.body = {
        success: true,
        data: {
          initialized: true,
          usdtBalance: balance,
          message: '区块链服务连接正常'
        },
        message: '区块链服务测试成功'
      };
    } catch (error) {
      console.error('区块链服务测试失败:', error);
      ctx.throw(500, `区块链服务测试失败: ${error.message}`);
    }
  },

  // 获取钱包配置状态
  async getWalletStatus(ctx) {
    try {
      const blockchainService = strapi.service('api::recharge-channel.blockchain-service');
      
      // 获取充值钱包配置
      const rechargeConfig = await blockchainService.getWalletConfig('recharge', 'USDT');
      const withdrawalConfig = await blockchainService.getWalletConfig('withdrawal', 'USDT');
      
      let rechargeBalance = '0';
      let withdrawalBalance = '0';
      
      if (rechargeConfig) {
        try {
          const rawBalance = await blockchainService.usdtContract.methods.balanceOf(rechargeConfig.address).call();
          const decimals = await blockchainService.usdtContract.methods.decimals().call();
          const base = new Decimal(10).pow(decimals);
          rechargeBalance = new Decimal(rawBalance).dividedBy(base).toString();
        } catch (error) {
          console.warn('获取充值钱包余额失败:', error);
        }
      }
      
      if (withdrawalConfig) {
        try {
          const rawBalance = await blockchainService.usdtContract.methods.balanceOf(withdrawalConfig.address).call();
          const decimals = await blockchainService.usdtContract.methods.decimals().call();
          const base = new Decimal(10).pow(decimals);
          withdrawalBalance = new Decimal(rawBalance).dividedBy(base).toString();
        } catch (error) {
          console.warn('获取提现钱包余额失败:', error);
        }
      }
      
      ctx.body = {
        success: true,
        data: {
          recharge: {
            configured: !!rechargeConfig,
            address: rechargeConfig?.address || null,
            balance: rechargeBalance,
            hasPrivateKey: !!rechargeConfig?.privateKey
          },
          withdrawal: {
            configured: !!withdrawalConfig,
            address: withdrawalConfig?.address || null,
            balance: withdrawalBalance,
            hasPrivateKey: !!withdrawalConfig?.privateKey
          }
        },
        message: '获取钱包状态成功'
      };
    } catch (error) {
      console.error('获取钱包状态失败:', error);
      ctx.throw(500, `获取钱包状态失败: ${error.message}`);
    }
  },

  // 检查充值通道配置
  async checkRechargeChannels(ctx) {
    try {
      const channels = await strapi.entityService.findMany('api::recharge-channel.recharge-channel' as any, {
        filters: { status: 'active' },
        populate: ['rechargeOrders']
      });

      ctx.body = {
        success: true,
        data: channels.map(channel => ({
          id: channel.id,
          name: channel.name,
          status: channel.status,
          channelType: channel.channelType,
          asset: channel.asset,
          network: channel.network,
          walletAddress: channel.walletAddress,
          contractAddress: channel.contractAddress,
          decimals: channel.decimals,
          minAmount: channel.minAmount,
          maxAmount: channel.maxAmount,
          hasPrivateKey: !!channel.walletPrivateKey,
          orderCount: channel.rechargeOrders?.length || 0
        })),
        message: '获取充值通道配置成功'
      };
    } catch (error) {
      console.error('检查充值通道配置失败:', error);
      ctx.throw(500, `检查充值通道配置失败: ${error.message}`);
    }
  },

  // 调试充值状态
  async debugRechargeStatus(ctx) {
    try {
      const { orderNo } = ctx.query;
      
      if (!orderNo) {
        return ctx.badRequest('缺少订单号');
      }

      // 查找充值订单
      const order = await strapi.entityService.findMany('api::recharge-order.recharge-order' as any, {
        filters: { orderNo: orderNo },
        populate: ['user', 'channel']
      });

      if (!order || order.length === 0) {
        return ctx.notFound('订单不存在');
      }

      const rechargeOrder = order[0];
      
      // 获取区块链服务
      const blockchainService = strapi.service('api::recharge-channel.blockchain-service');
      
      // 检查钱包余额
      let walletBalance = '0';
      if (rechargeOrder.receiveAddress) {
        try {
          walletBalance = await blockchainService.getTokenBalanceFromAddress('USDT', rechargeOrder.receiveAddress);
        } catch (error) {
          console.warn('获取钱包余额失败:', error);
        }
      }

      // 获取最近的交易
      let recentTransactions = [];
      if (rechargeOrder.receiveAddress) {
        try {
          const web3 = blockchainService.web3;
          if (web3) {
            const currentBlock = await web3.eth.getBlockNumber();
            const fromBlock = Math.max(0, currentBlock - 1000); // 最近1000个区块
            
            // 这里可以添加获取最近交易的逻辑
            // 由于Web3的限制，这里只是示例
          }
        } catch (error) {
          console.warn('获取最近交易失败:', error);
        }
      }

      ctx.body = {
        success: true,
        data: {
          order: {
            orderNo: rechargeOrder.orderNo,
            amount: rechargeOrder.amount,
            status: rechargeOrder.status,
            receiveAddress: rechargeOrder.receiveAddress,
            createdAt: rechargeOrder.createdAt,
            expectedTime: rechargeOrder.expectedTime,
            txHash: rechargeOrder.txHash,
            completedTime: rechargeOrder.completedTime
          },
          wallet: {
            address: rechargeOrder.receiveAddress,
            balance: walletBalance
          },
          blockchain: {
            lastProcessedBlock: blockchainService.lastProcessedBlock || 0,
            scanning: blockchainService.scanning || false
          },
          debug: {
            orderExists: true,
            orderStatus: rechargeOrder.status,
            isExpired: new Date() > new Date(rechargeOrder.expectedTime),
            timeRemaining: Math.max(0, new Date(rechargeOrder.expectedTime).getTime() - Date.now())
          }
        },
        message: '充值状态查询成功'
      };
    } catch (error) {
      console.error('查询充值状态失败:', error);
      ctx.throw(500, `查询充值状态失败: ${error.message}`);
    }
  },

  // 快速配置钱包
  async quickSetupWallet(ctx) {
    try {
      const { type, address, privateKey, asset = 'USDT' } = ctx.request.body;
      
      if (!type || !address || !privateKey) {
        return ctx.badRequest('缺少必要参数');
      }
      
      if (!['recharge', 'withdrawal', 'both'].includes(type)) {
        return ctx.badRequest('类型必须是 recharge、withdrawal 或 both');
      }
      
      // 检查是否已存在相同配置
      const existingChannels = await strapi.entityService.findMany('api::recharge-channel.recharge-channel' as any, {
        filters: {
          walletAddress: address,
          asset: asset
        }
      });
      
             if (existingChannels && Array.isArray(existingChannels) && existingChannels.length > 0) {
        // 更新现有配置
        const channel = existingChannels[0];
        await strapi.entityService.update('api::recharge-channel.recharge-channel' as any, channel.id, {
          data: {
            channelType: type as any,
            walletPrivateKey: privateKey,
            status: 'active'
          } as any
        });
        
        ctx.body = {
          success: true,
          data: {
            id: channel.id,
            action: 'updated',
            message: `已更新${asset}的${type}钱包配置`
          },
          message: '钱包配置更新成功'
        };
      } else {
        // 创建新配置
        const newChannel = await strapi.entityService.create('api::recharge-channel.recharge-channel' as any, {
          data: {
            name: `${asset} ${type} 通道`,
            channelType: type,
            status: 'active',
            walletAddress: address,
            walletPrivateKey: privateKey,
            network: 'BSC',
            asset: asset,
            minAmount: '10.00',
            maxAmount: '10000.00',
            dailyLimit: '50000.00',
            feeRate: '0.001',
            fixedFee: '1.00'
          }
        });
        
        ctx.body = {
          success: true,
          data: {
            id: newChannel.id,
            action: 'created',
            message: `已创建${asset}的${type}钱包配置`
          },
          message: '钱包配置创建成功'
        };
      }
    } catch (error) {
      console.error('快速配置钱包失败:', error);
      ctx.throw(500, `快速配置钱包失败: ${error.message}`);
    }
  },
})); 