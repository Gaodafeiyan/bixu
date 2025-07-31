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

// 添加获取实时价格的方法
async function getTokenPrice(tokenSymbol: string): Promise<number> {
  try {
    const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${tokenSymbol}USDT`);
    const data = await response.json() as { price: string };
    return parseFloat(data.price);
  } catch (error) {
    console.error(`获取${tokenSymbol}价格失败:`, error);
    // 返回默认价格作为备用
    const defaultPrices: { [key: string]: number } = {
      'ADA': 0.5,
      'LINK': 15.0,
      'SHIB': 0.00002
    };
    return defaultPrices[tokenSymbol] || 1.0;
  }
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
  async createWithdrawalOrder(userId: number, amount: string, address: string, network: string, currency: string = 'USDT') {
    try {
      // 验证用户余额
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: { id: userId } }
      });

      const wallet = wallets[0];
      if (!wallet) {
        throw new Error('用户钱包不存在');
      }

      let walletBalance: Decimal;
      let balanceField: string;

      if (currency === 'USDT') {
        // USDT余额检查
        walletBalance = new Decimal(wallet.usdtYue || 0);
        balanceField = 'usdtYue';
      } else {
        // 其他代币余额检查
        let tokenBalances = {};
        if (wallet.aiTokenBalances) {
          try {
            tokenBalances = JSON.parse(wallet.aiTokenBalances);
          } catch (error) {
            console.error('解析aiTokenBalances失败:', error);
            tokenBalances = {};
          }
        }
        walletBalance = new Decimal(tokenBalances[currency] || 0);
        balanceField = 'aiTokenBalances';
      }

      const withdrawalAmount = new Decimal(amount);

      if (walletBalance.lessThan(withdrawalAmount)) {
        throw new Error(`${currency}余额不足`);
      }

      // 获取可用的提现通道
      const channels = await strapi.entityService.findMany('api::recharge-channel.recharge-channel' as any, {
        filters: {
          status: 'active',
          channelType: { $in: ['withdrawal', 'both'] },
          network: network,
          asset: currency
        }
      });

      const channelList = Array.isArray(channels) ? channels : [channels];
      if (channelList.length === 0) {
        throw new Error(`没有可用的${currency}提现通道`);
      }

      const channel = channelList[0]; // 选择第一个可用通道

      // 验证金额
      const amountDecimal = new Decimal(amount);
      const minAmount = new Decimal(channel.minAmount);
      const maxAmount = new Decimal(channel.maxAmount);

      if (amountDecimal.lessThan(minAmount) || amountDecimal.greaterThan(maxAmount)) {
        throw new Error(`${currency}提现金额必须在 ${minAmount} - ${maxAmount} 之间`);
      }

      // 计算手续费
      const feeRate = new Decimal(channel.feeRate);
      const fixedFee = new Decimal(channel.fixedFee);
      const fee = amountDecimal.mul(feeRate).add(fixedFee);
      
      // 确保手续费不会超过提现金额
      const maxFee = amountDecimal.mul(new Decimal('0.1')); // 最大手续费为提现金额的10%
      const actualFee = fee.greaterThan(maxFee) ? maxFee : fee;
      
      const actualAmount = amountDecimal.sub(actualFee);
      
      // 如果扣除手续费后金额太小，则拒绝提现
      if (actualAmount.lessThanOrEqualTo(0)) {
        throw new Error(`${currency}提现金额扣除手续费后不足，请增加提现金额或选择其他代币`);
      }

      // 立即扣除用户余额
      let updateData: any = {};
      
      if (currency === 'USDT') {
        const newBalance = walletBalance.sub(withdrawalAmount);
        updateData.usdtYue = newBalance.toString();
      } else {
        // 更新aiTokenBalances中的特定代币余额
        let tokenBalances = {};
        if (wallet.aiTokenBalances) {
          try {
            tokenBalances = JSON.parse(wallet.aiTokenBalances);
          } catch (error) {
            console.error('解析aiTokenBalances失败:', error);
            tokenBalances = {};
          }
        }
        
        const currentBalance = new Decimal(tokenBalances[currency] || 0);
        const newBalance = currentBalance.sub(withdrawalAmount);
        tokenBalances[currency] = newBalance.toString();
        updateData.aiTokenBalances = JSON.stringify(tokenBalances);
      }

      await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
        data: updateData
      });

      // 创建提现订单
      const orderNo = generateOrderNo('withdrawal');
      const withdrawalOrder = await strapi.entityService.create('api::withdrawal-order.withdrawal-order' as any, {
        data: {
          orderNo,
          amount: amount,
          currency: currency,
          status: 'pending',
          user: userId,
          channel: channel.id,
          withdrawAddress: address,
          withdrawNetwork: network,
          requestTime: new Date(),
          fee: actualFee.toString(),
          actualAmount: actualAmount.toString(),
        }
      });

      console.log(`创建${currency}提现订单: ${orderNo}, 用户: ${userId}, 金额: ${amount}, 手续费: ${actualFee}`);
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
      console.log(`🔍 查找提现通道参数: tokenSymbol=${tokenSymbol}, network=${network}`);
      
      // 先查找所有可用的提现通道，不限制asset
      const allChannels = await strapi.entityService.findMany('api::recharge-channel.recharge-channel' as any, {
        filters: {
          status: 'active',
          channelType: { $in: ['withdrawal', 'both'] }
        }
      });
      
      console.log(`🔍 所有可用的提现通道:`, allChannels);
      
      // 根据NAME字段匹配tokenSymbol
      const matchedChannels = allChannels.filter((channel: any) => 
        channel.name && channel.name.toUpperCase() === tokenSymbol.toUpperCase()
      );
      
      console.log(`🔍 根据NAME字段匹配的通道:`, matchedChannels);
      
      if (matchedChannels.length === 0) {
        console.error(`❌ 没有找到NAME为${tokenSymbol}的提现通道`);
        console.error(`❌ 请检查后台充值通道配置中是否有: NAME=${tokenSymbol}, channelType=withdrawal, status=active`);
        throw new Error(`没有可用的${tokenSymbol}提现通道`);
      }

      const channel = matchedChannels[0]; // 选择第一个匹配的通道

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

      // 获取实时价格并计算USDT价值
      let usdtValue: Decimal;
      if (tokenSymbol === 'USDT') {
        // USDT直接使用数量作为价值
        usdtValue = amountDecimal;
      } else {
        // 其他代币需要根据实时价格计算USDT价值
        const tokenPrice = await getTokenPrice(tokenSymbol);
        usdtValue = amountDecimal.mul(new Decimal(tokenPrice));
        console.log(`💰 ${tokenSymbol}实时价格: ${tokenPrice} USDT`);
        console.log(`💰 提现${amount} ${tokenSymbol} = ${usdtValue.toString()} USDT`);
      }

      // 检查余额是否足够
      if (aiYueBalance.lessThan(usdtValue)) {
        throw new Error(`AI代币价值余额不足: 需要 ${usdtValue.toString()} USDT, 当前余额 ${aiYueBalance.toString()} USDT`);
      }

      // 立即扣除用户AI代币价值余额（扣除USDT价值）
      const newAiYueBalance = aiYueBalance.sub(usdtValue);
      
      // 解析现有的aiTokenBalances
      let tokenBalances = {};
      if (wallet.aiTokenBalances) {
        try {
          tokenBalances = JSON.parse(wallet.aiTokenBalances);
          console.log(`🔍 解析现有aiTokenBalances: ${wallet.aiTokenBalances}`);
          console.log(`🔍 解析后的tokenBalances:`, tokenBalances);
        } catch (error) {
          console.error('解析aiTokenBalances失败:', error);
          tokenBalances = {};
        }
      } else {
        console.log(`🔍 用户钱包aiTokenBalances为空或null`);
      }

      // 将转换后的代币数量添加到aiTokenBalances中
      const currentTokenBalance = new Decimal(tokenBalances[tokenSymbol] || '0');
      const newTokenBalance = currentTokenBalance.add(actualAmount);
      tokenBalances[tokenSymbol] = newTokenBalance.toString();
      
      console.log(`🔍 更新${tokenSymbol}余额: 当前${currentTokenBalance.toString()} + 新增${actualAmount.toString()} = ${newTokenBalance.toString()}`);
      console.log(`🔍 更新后的tokenBalances:`, tokenBalances);

      // 更新钱包余额：扣除aiYue，添加代币余额
      const updateData = {
        aiYue: newAiYueBalance.toString(),
        aiTokenBalances: JSON.stringify(tokenBalances)
      };
      
      console.log(`🔍 准备更新钱包数据:`, updateData);
      console.log(`🔍 钱包ID: ${wallet.id}`);
      console.log(`🔍 用户ID: ${userId}`);
      
      try {
        const updatedWallet = await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
          data: updateData
        });
        
        console.log(`✅ 钱包更新成功:`, updatedWallet);
        console.log(`✅ 更新后的aiYue: ${updatedWallet.aiYue}`);
        console.log(`✅ 更新后的aiTokenBalances: ${updatedWallet.aiTokenBalances}`);
      } catch (updateError) {
        console.error(`❌ 钱包更新失败:`, updateError);
        throw new Error(`钱包更新失败: ${updateError.message}`);
      }

      console.log(`💰 更新钱包余额: aiYue减少${usdtValue.toString()} USDT, ${tokenSymbol}增加${actualAmount.toString()}`);

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
          deductedUsdtValue: usdtValue.toString(), // 记录扣除的USDT价值
        }
      });

      console.log(`创建AI代币提现订单: ${orderNo}, 用户: ${userId}, 代币: ${tokenSymbol}, 数量: ${amount}, USDT价值: ${usdtValue.toString()}, 手续费: ${fee}`);
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