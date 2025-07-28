import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';
import crypto from 'crypto';

export default factories.createCoreService('api::recharge-channel.recharge-channel', ({ strapi }) => ({
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

      const todayAmount = todayOrders.reduce((sum, order) => {
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
      });

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
          network: network
        }
      });

      if (channels.length === 0) {
        throw new Error('没有可用的提现通道');
      }

      const channel = channels[0]; // 选择第一个可用通道

      // 验证金额
      const amountDecimal = new Decimal(amount);
      const minAmount = new Decimal(channel.minAmount);
      const maxAmount = new Decimal(channel.maxAmount);

      if (amountDecimal.lessThan(minAmount) || amountDecimal.greaterThan(maxAmount)) {
        throw new Error(`提现金额必须在 ${minAmount} - ${maxAmount} 之间`);
      }

      // 计算手续费
      const feeRate = new Decimal(channel.feeRate);
      const fixedFee = new Decimal(channel.fixedFee);
      const fee = amountDecimal.mul(feeRate).add(fixedFee);
      const actualAmount = amountDecimal.sub(fee);

      // 立即扣除用户余额
      const newBalance = walletBalance.sub(withdrawalAmount);
      await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
        data: {
          usdtYue: newBalance.toString()
        }
      });

      // 创建提现订单
      const orderNo = this.generateOrderNo('withdrawal');
      const withdrawalOrder = await strapi.entityService.create('api::withdrawal-order.withdrawal-order', {
        data: {
          orderNo,
          amount: amount,
          currency: channel.asset,
          status: 'pending',
          user: userId,
          channel: channel.id,
          withdrawAddress: address,
          withdrawNetwork: network,
          requestTime: new Date(),
          fee: fee.toString(),
          actualAmount: actualAmount.toString(),
        }
      });

      console.log(`创建提现订单: ${orderNo}, 用户: ${userId}, 金额: ${amount}, 手续费: ${fee}`);
      return withdrawalOrder;
    } catch (error) {
      console.error('创建提现订单失败:', error);
      throw error;
    }
  },

  // 监控钱包交易
  async monitorWalletTransactions() {
    try {
      // 获取所有活跃的充值通道
      const channels = await strapi.entityService.findMany('api::recharge-channel.recharge-channel', {
        filters: {
          status: 'active',
          channelType: { $in: ['recharge', 'both'] }
        }
      });

      for (const channel of channels) {
        await this.processChannelTransactions(channel);
      }
    } catch (error) {
      console.error('监控钱包交易失败:', error);
    }
  },

  // 处理通道交易
  async processChannelTransactions(channel: any) {
    try {
      // 获取钱包交易记录
      const transactions = await this.getWalletTransactions(channel.walletAddress, channel.network);
      
      for (const transaction of transactions) {
        await this.processTransaction(channel, transaction);
      }
    } catch (error) {
      console.error(`处理通道 ${channel.id} 交易失败:`, error);
    }
  },

  // 获取钱包交易记录（模拟实现）
  async getWalletTransactions(address: string, network: string) {
    // 这里应该调用真实的区块链API
    // 目前返回模拟数据
    return [];
  },

  // 处理交易
  async processTransaction(channel: any, transaction: any) {
    try {
      // 查找匹配的充值订单
      const orders = await strapi.entityService.findMany('api::recharge-order.recharge-order', {
        filters: {
          channel: { id: channel.id },
          status: 'pending',
          receiveAddress: channel.walletAddress
        }
      });

      for (const order of orders) {
        const orderAmount = new Decimal(order.amount);
        const txAmount = new Decimal(transaction.value);

        // 检查金额是否匹配（允许一定的误差）
        if (orderAmount.equals(txAmount)) {
          await this.completeRechargeOrder(order, transaction);
          break;
        }
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
          completedTime: new Date()
        }
      });

      // 增加用户钱包余额
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: { id: order.user.id } }
      });

      const wallet = wallets[0];
      if (wallet) {
        const currentBalance = new Decimal(wallet.usdtYue || 0);
        const rechargeAmount = new Decimal(order.amount);
        const newBalance = currentBalance.add(rechargeAmount);

        await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
          data: {
            usdtYue: newBalance.toString()
          }
        });

        console.log(`充值完成: 订单 ${order.orderNo}, 用户 ${order.user.id}, 金额 ${order.amount}`);
      }
    } catch (error) {
      console.error('完成充值订单失败:', error);
    }
  },

  // 处理提现订单
  async processWithdrawalOrders() {
    try {
      // 获取待处理的提现订单
      const pendingOrders = await strapi.entityService.findMany('api::withdrawal-order.withdrawal-order', {
        filters: { status: 'pending' },
        populate: ['user', 'channel']
      });

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
    } catch (error) {
      console.error('处理提现订单失败:', error);
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

      // 发送区块链交易（模拟实现）
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

      console.log(`提现完成: 订单 ${order.orderNo}, 用户 ${order.user.id}, 金额 ${order.amount}`);
    } catch (error) {
      console.error('执行提现失败:', error);
      throw error;
    }
  },

  // 发送交易（模拟实现）
  async sendTransaction(order: any) {
    // 这里应该调用真实的区块链API发送交易
    // 目前返回模拟数据
    return {
      hash: `0x${crypto.randomBytes(32).toString('hex')}`,
      blockNumber: Math.floor(Math.random() * 1000000),
      confirmations: 1
    };
  },
})); 