import Decimal from 'decimal.js';
import crypto from 'crypto';

// 生成订单号工具函数
function generateOrderNo(type: 'recharge' | 'withdrawal'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const prefix = type === 'recharge' ? 'RC' : 'WD';
  return `${prefix}${timestamp}${random}`;
}

// 获取钱包交易记录（模拟实现）
async function getWalletTransactions(address: string, network: string) {
  // 这里应该调用真实的区块链API
  // 目前返回模拟数据
  return [];
}

// 处理交易
async function processTransaction(channel: any, transaction: any, strapi: any) {
  try {
    // 查找匹配的充值订单
          const orders = await strapi.entityService.findMany('api::recharge-order.recharge-order' as any, {
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
        await completeRechargeOrder(order, transaction, strapi);
        break;
      }
    }
  } catch (error) {
    console.error('处理交易失败:', error);
  }
}

// 完成充值订单
async function completeRechargeOrder(order: any, transaction: any, strapi: any) {
  try {
    // 更新订单状态
    await strapi.entityService.update('api::recharge-order.recharge-order' as any, order.id, {
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
}

// 执行提现
async function executeWithdrawal(order: any, strapi: any) {
  try {
    // 更新订单状态为处理中
    await strapi.entityService.update('api::withdrawal-order.withdrawal-order', order.id, {
      data: {
        status: 'processing',
        processTime: new Date()
      }
    });

    // 发送区块链交易（模拟实现）
    const transaction = await sendTransaction(order);
    
    // 更新订单状态为完成
    await strapi.entityService.update('api::withdrawal-order.withdrawal-order', order.id, {
      data: {
        status: 'completed',
        txHash: transaction.hash,
        completedTime: new Date()
      }
    });

    console.log(`提现完成: 订单 ${order.orderNo}, 用户 ${order.user.id}, 金额 ${order.amount}`);
  } catch (error) {
    console.error(`执行提现失败: 订单 ${order.orderNo}`, error);
    throw error;
  }
}

// 发送交易（模拟实现）
async function sendTransaction(order: any) {
  // 这里应该调用真实的区块链API
  // 目前返回模拟数据
  return {
    hash: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    blockNumber: Math.floor(Math.random() * 1000000),
    confirmations: 1
  };
}

export default ({ strapi }) => ({


  // 创建充值订单
  async createRechargeOrder(userId: number, amount: string, channelId: number) {
    try {
      // 获取通道信息
      const channel = await strapi.entityService.findOne('api::recharge-channel.recharge-channel' as any, channelId);
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
      const todayOrders = await strapi.entityService.findMany('api::recharge-order.recharge-order' as any, {
        filters: {
          channel: { id: channelId },
          status: { $in: ['pending', 'processing', 'completed'] },
          createdAt: { $gte: today }
        }
      });

      const orderList = Array.isArray(todayOrders) ? todayOrders : [todayOrders];
      const todayAmount = orderList.reduce((sum, order) => {
        return sum + new Decimal(order.amount).toNumber();
      }, 0);

      const dailyLimit = new Decimal(channel.dailyLimit);
      if (todayAmount + amountDecimal.toNumber() > dailyLimit.toNumber()) {
        throw new Error('超出日充值限额');
      }

      // 创建充值订单
      const orderNo = generateOrderNo('recharge');
      const rechargeOrder = await strapi.entityService.create('api::recharge-order.recharge-order' as any, {
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
      const channels = await strapi.entityService.findMany('api::recharge-channel.recharge-channel' as any, {
        filters: {
          status: 'active',
          channelType: { $in: ['withdrawal', 'both'] },
          network: network
        }
      });

      const channelList = Array.isArray(channels) ? channels : [channels];
      if (channelList.length === 0) {
        throw new Error('没有可用的提现通道');
      }

      const channel = channelList[0]; // 选择第一个可用通道

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
      const orderNo = generateOrderNo('withdrawal');
      const withdrawalOrder = await strapi.entityService.create('api::withdrawal-order.withdrawal-order' as any, {
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

  // 创建AI代币提现订单
  async createAiTokenWithdrawalOrder(userId: number, tokenSymbol: string, amount: string, address: string, network: string) {
    try {
      // 验证用户AI代币余额
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: { id: userId } }
      });

      const wallet = wallets[0];
      if (!wallet) {
        throw new Error('用户钱包不存在');
      }

      // 检查用户AI代币价值余额
      const aiYueBalance = new Decimal(wallet.aiYue || '0');
      if (aiYueBalance.lessThanOrEqualTo(0)) {
        throw new Error('AI代币价值余额不足');
      }

      // 获取可用的提现通道
      const channels = await strapi.entityService.findMany('api::recharge-channel.recharge-channel' as any, {
        filters: {
          status: 'active',
          channelType: { $in: ['withdrawal', 'both'] },
          network: network,
          asset: tokenSymbol
        }
      });

      const channelList = Array.isArray(channels) ? channels : [channels];
      if (channelList.length === 0) {
        throw new Error(`没有可用的${tokenSymbol}提现通道`);
      }

      const channel = channelList[0]; // 选择第一个可用通道

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

      // 立即扣除用户AI代币价值余额
      const newAiYueBalance = aiYueBalance.sub(amountDecimal);
      
      await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
        data: {
          aiYue: newAiYueBalance.toString()
        }
      });

      // 创建提现订单
      const orderNo = generateOrderNo('withdrawal');
      const withdrawalOrder = await strapi.entityService.create('api::withdrawal-order.withdrawal-order' as any, {
        data: {
          orderNo,
          amount: amount,
          currency: tokenSymbol,
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

      console.log(`创建AI代币提现订单: ${orderNo}, 用户: ${userId}, 代币: ${tokenSymbol}, 金额: ${amount}, 手续费: ${fee}`);
      return withdrawalOrder;
    } catch (error) {
      console.error('创建AI代币提现订单失败:', error);
      throw error;
    }
  },

  // 监控钱包交易
  async monitorWalletTransactions() {
    try {
      // 获取所有活跃的充值通道
      const channels = await strapi.entityService.findMany('api::recharge-channel.recharge-channel' as any, {
        filters: {
          status: 'active',
          channelType: { $in: ['recharge', 'both'] }
        }
      });

      const channelList = Array.isArray(channels) ? channels : [channels];
      for (const channel of channelList) {
        await this.processChannelTransactions(channel, strapi);
      }
    } catch (error) {
      console.error('监控钱包交易失败:', error);
    }
  },

  // 处理通道交易
  async processChannelTransactions(channel: any, strapi: any) {
    try {
      // 获取钱包交易记录
      const transactions = await getWalletTransactions(channel.walletAddress, channel.network);
      
      for (const transaction of transactions) {
        await processTransaction(channel, transaction, strapi);
      }
    } catch (error) {
      console.error(`处理通道 ${channel.id} 交易失败:`, error);
    }
  },



  // 处理提现订单
  async processWithdrawalOrders() {
    try {
      // 获取待处理的提现订单
      const pendingOrders = await strapi.entityService.findMany('api::withdrawal-order.withdrawal-order' as any, {
        filters: { status: 'pending' },
        populate: ['user', 'channel']
      });

      const orderList = Array.isArray(pendingOrders) ? pendingOrders : [pendingOrders];
      for (const order of orderList) {
        try {
          await executeWithdrawal(order, strapi);
        } catch (error) {
          console.error(`处理提现订单 ${order.orderNo} 失败:`, error);
          
          // 更新订单状态为失败
          await strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
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


}); 