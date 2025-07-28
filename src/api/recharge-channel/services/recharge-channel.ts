import { Strapi } from '@strapi/strapi';
import Decimal from 'decimal.js';
import crypto from 'crypto';

export default ({ strapi }: { strapi: Strapi }) => ({
  // 生成订单号
  generateOrderNo(type: 'recharge' | 'withdrawal'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const prefix = type === 'recharge' ? 'RC' : 'WD';
    return `${prefix}${timestamp}${random}`;
  },

  // 创建充值订单
  async createRechargeOrder(userId: number, amount: string, channelId: number) {
    try {
      // 获取通道信息
      const channel = await strapi.entityService.findOne('api::recharge-channel.recharge-channel', channelId);
      if (!channel || channel.status !== 'active') {
        throw new Error('充值通道不可用');
      }

      // 验证金额
      const amountDecimal = new Decimal(amount);
      const minAmount = new Decimal(channel.minAmount);
      const maxAmount = new Decimal(channel.maxAmount);

      if (amountDecimal.lessThan(minAmount) || amountDecimal.greaterThan(maxAmount)) {
        throw new Error(`充值金额必须在 ${minAmount} - ${maxAmount} 之间`);
      }

      // 检查日限额
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = await strapi.entityService.findMany('api::recharge-order.recharge-order', {
        filters: {
          channel: { id: channelId },
          status: { $in: ['pending', 'processing', 'completed'] },
          createdAt: { $gte: today }
        }
      });

      const todayAmount = (todayOrders as any[]).reduce((sum, order) => {
        return sum + new Decimal(order.amount).toNumber();
      }, 0);

      const dailyLimit = new Decimal(channel.dailyLimit);
      if (todayAmount + amountDecimal.toNumber() > dailyLimit.toNumber()) {
        throw new Error('超出日充值限额');
      }

      // 创建充值订单
      const orderNo = this.generateOrderNo('recharge');
      const rechargeOrder = await strapi.entityService.create('api::recharge-order.recharge-order', {
        data: {
          orderNo,
          amount: amount,
          currency: channel.asset,
          status: 'pending',
          user: userId,
          channel: channelId,
          receiveAddress: channel.walletAddress,
          expectedTime: new Date(Date.now() + 30 * 60 * 1000), // 30分钟后过期
          fee: '0.00',
          actualAmount: amount,
        }
      });

      console.log(`创建充值订单: ${orderNo}, 用户: ${userId}, 金额: ${amount}`);
      return rechargeOrder;
    } catch (error) {
      console.error('创建充值订单失败:', error);
      throw error;
    }
  },

  // 创建提现订单
  async createWithdrawalOrder(userId: number, amount: string, address: string, network: string) {
    try {
      // 验证用户余额
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: { id: userId } }
      }) as any[];

      const wallet = wallets[0];
      if (!wallet) {
        throw new Error('用户钱包不存在');
      }

      const walletBalance = new Decimal(wallet.usdtYue || 0);
      const withdrawalAmount = new Decimal(amount);

      if (walletBalance.lessThan(withdrawalAmount)) {
        throw new Error('余额不足');
      }

      // 获取可用的提现通道
      const channels = await strapi.entityService.findMany('api::recharge-channel.recharge-channel', {
        filters: {
          status: 'active',
          channelType: { $in: ['withdrawal', 'both'] },
          network: network,
          asset: 'USDT'
        }
      }) as any[];

      if (channels.length === 0) {
        throw new Error('暂无可用的提现通道');
      }

      // 选择最佳通道（余额充足且手续费最低）
      const bestChannel = channels.reduce((best, current) => {
        const currentFee = new Decimal(current.fixedFee).plus(new Decimal(current.feeRate).mul(amount));
        const bestFee = new Decimal(best.fixedFee).plus(new Decimal(best.feeRate).mul(amount));
        return currentFee.lessThan(bestFee) ? current : best;
      });

      // 计算手续费
      const fee = new Decimal(bestChannel.fixedFee).plus(new Decimal(bestChannel.feeRate).mul(amount));
      const actualAmount = withdrawalAmount.minus(fee);

      if (actualAmount.lessThanOrEqualTo(0)) {
        throw new Error('提现金额不足以支付手续费');
      }

      // 创建提现订单
      const orderNo = this.generateOrderNo('withdrawal');
      const withdrawalOrder = await strapi.entityService.create('api::withdrawal-order.withdrawal-order', {
        data: {
          orderNo,
          amount: amount,
          currency: 'USDT',
          status: 'pending',
          user: userId,
          channel: bestChannel.id,
          withdrawAddress: address,
          withdrawNetwork: network,
          requestTime: new Date(),
          fee: fee.toString(),
          actualAmount: actualAmount.toString(),
        }
      });

      // 立即扣除用户虚拟余额
      const newBalance = walletBalance.minus(withdrawalAmount);
      await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
        data: { usdtYue: newBalance.toString() }
      });

      console.log(`创建提现订单: ${orderNo}, 用户: ${userId}, 金额: ${amount}, 手续费: ${fee}`);
      return withdrawalOrder;
    } catch (error) {
      console.error('创建提现订单失败:', error);
      throw error;
    }
  },

  // 监控钱包交易（定时任务调用）
  async monitorWalletTransactions() {
    try {
      console.log('🔄 开始监控钱包交易...');

      // 获取所有活跃的充值通道
      const channels = await strapi.entityService.findMany('api::recharge-channel.recharge-channel', {
        filters: {
          status: 'active',
          channelType: { $in: ['recharge', 'both'] }
        }
      }) as any[];

      for (const channel of channels) {
        try {
          await this.processChannelTransactions(channel);
        } catch (error) {
          console.error(`处理通道 ${channel.name} 交易失败:`, error);
        }
      }

      console.log('✅ 钱包交易监控完成');
    } catch (error) {
      console.error('❌ 钱包交易监控失败:', error);
    }
  },

  // 处理单个通道的交易
  async processChannelTransactions(channel: any) {
    try {
      // 这里应该调用区块链API获取最新交易
      // 为了演示，我们模拟获取交易
      const transactions = await this.getWalletTransactions(channel.walletAddress, channel.network);
      
      for (const tx of transactions) {
        await this.processTransaction(channel, tx);
      }
    } catch (error) {
      console.error(`处理通道 ${channel.name} 交易失败:`, error);
    }
  },

  // 获取钱包交易（需要集成区块链API）
  async getWalletTransactions(address: string, network: string) {
    // TODO: 集成真实的区块链API
    // 这里返回模拟数据
    return [];
  },

  // 处理单个交易
  async processTransaction(channel: any, transaction: any) {
    try {
      // 查找匹配的充值订单
      const orders = await strapi.entityService.findMany('api::recharge-order.recharge-order', {
        filters: {
          channel: { id: channel.id },
          status: 'pending',
          receiveAddress: channel.walletAddress
        }
      }) as any[];

      // 匹配订单（根据金额和时间窗口）
      const matchedOrder = orders.find(order => {
        const orderAmount = new Decimal(order.amount);
        const txAmount = new Decimal(transaction.amount);
        const timeDiff = Math.abs(new Date(order.expectedTime).getTime() - new Date(transaction.timestamp).getTime());
        
        return orderAmount.equals(txAmount) && timeDiff <= 30 * 60 * 1000; // 30分钟内
      });

      if (matchedOrder) {
        await this.completeRechargeOrder(matchedOrder, transaction);
      }
    } catch (error) {
      console.error('处理交易失败:', error);
    }
  },

  // 完成充值订单
  async completeRechargeOrder(order: any, transaction: any) {
    try {
      // 更新订单状态
      await strapi.entityService.update('api::recharge-order.recharge-order', order.id, {
        data: {
          status: 'completed',
          txHash: transaction.hash,
          blockNumber: transaction.blockNumber,
          confirmations: transaction.confirmations,
          receivedTime: new Date(),
          completedTime: new Date(),
          actualAmount: transaction.amount
        }
      });

      // 更新用户虚拟钱包余额
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: { id: order.user.id } }
      }) as any[];

      if (wallets.length > 0) {
        const wallet = wallets[0];
        const currentBalance = new Decimal(wallet.usdtYue || 0);
        const newBalance = currentBalance.plus(new Decimal(transaction.amount));

        await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
          data: { usdtYue: newBalance.toString() }
        });

        console.log(`✅ 充值完成: 订单 ${order.orderNo}, 用户 ${order.user.id}, 金额 ${transaction.amount}`);
      }
    } catch (error) {
      console.error('完成充值订单失败:', error);
      throw error;
    }
  },

  // 处理提现订单
  async processWithdrawalOrders() {
    try {
      console.log('🔄 开始处理提现订单...');

      // 获取待处理的提现订单
      const pendingOrders = await strapi.entityService.findMany('api::withdrawal-order.withdrawal-order', {
        filters: { status: 'pending' },
        populate: ['user', 'channel']
      }) as any[];

      for (const order of pendingOrders) {
        try {
          await this.executeWithdrawal(order);
        } catch (error) {
          console.error(`处理提现订单 ${order.orderNo} 失败:`, error);
          
          // 更新订单状态为失败
          await strapi.entityService.update('api::withdrawal-order.withdrawal-order', order.id, {
            data: {
              status: 'failed',
              remark: error.message
            }
          });
        }
      }

      console.log('✅ 提现订单处理完成');
    } catch (error) {
      console.error('❌ 处理提现订单失败:', error);
    }
  },

  // 执行提现
  async executeWithdrawal(order: any) {
    try {
      // 更新订单状态为处理中
      await strapi.entityService.update('api::withdrawal-order.withdrawal-order', order.id, {
        data: {
          status: 'processing',
          processTime: new Date()
        }
      });

      // TODO: 调用区块链API执行转账
      const transaction = await this.sendTransaction(order);
      
      // 更新订单状态为完成
      await strapi.entityService.update('api::withdrawal-order.withdrawal-order', order.id, {
        data: {
          status: 'completed',
          txHash: transaction.hash,
          blockNumber: transaction.blockNumber,
          confirmations: transaction.confirmations,
          completedTime: new Date()
        }
      });

      console.log(`✅ 提现完成: 订单 ${order.orderNo}, 用户 ${order.user.id}, 金额 ${order.actualAmount}`);
    } catch (error) {
      console.error('执行提现失败:', error);
      throw error;
    }
  },

  // 发送交易（需要集成区块链API）
  async sendTransaction(order: any) {
    // TODO: 集成真实的区块链API
    // 这里返回模拟数据
    return {
      hash: '0x' + crypto.randomBytes(32).toString('hex'),
      blockNumber: Math.floor(Math.random() * 1000000),
      confirmations: 1
    };
  }
}); 