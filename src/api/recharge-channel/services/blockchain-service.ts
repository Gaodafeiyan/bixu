import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import Decimal from 'decimal.js';

// 代币合约ABI（包含decimals方法）
const TOKEN_ABI: AbiItem[] = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  }
];

// BSC USDT合约地址
const USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';

// 添加其他代币合约地址
const ADA_CONTRACT_ADDRESS = '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47';
const LINK_CONTRACT_ADDRESS = '0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd';
const SHIB_CONTRACT_ADDRESS = '0x2859e4544c4bb03966803b044a93563bd2d0dd4d';

export default ({ strapi }) => {
  let web3: Web3 | null = null;
  let usdtContract: any = null;
  let adaContract: any = null;
  let linkContract: any = null;
  let shibContract: any = null;
  let walletAddress: string = '';
  let privateKey: string = '';

  return {
    // 保存strapi实例
    strapi,
    
    // 初始化Web3连接
    async initialize() {
      try {
        // 强制使用Ankr付费节点
        const rpcUrl = 'https://rpc.ankr.com/bsc/0cc28cc1d2308734e5535767191f325256d627fee791f33b30b8a9e9f53d02fb';
        web3 = new Web3(rpcUrl);
        
        // 设置钱包地址和私钥（从环境变量获取）
        walletAddress = process.env.BSC_WALLET_ADDRESS || '0xe3353f75d68f9096aC4A49b4968e56b5DFbd2697';
        privateKey = process.env.BSC_PRIVATE_KEY || '';
        
        if (!privateKey) {
          console.warn('⚠️ BSC私钥未配置，转账功能将不可用');
        }

        // 初始化所有代币合约
        usdtContract = new web3.eth.Contract(TOKEN_ABI, USDT_CONTRACT_ADDRESS);
        adaContract = new web3.eth.Contract(TOKEN_ABI, ADA_CONTRACT_ADDRESS);
        linkContract = new web3.eth.Contract(TOKEN_ABI, LINK_CONTRACT_ADDRESS);
        shibContract = new web3.eth.Contract(TOKEN_ABI, SHIB_CONTRACT_ADDRESS);
        
        console.log('✅ 区块链服务初始化成功');
        console.log(`📧 钱包地址: ${walletAddress}`);
        console.log(`🌐 RPC节点: Ankr付费节点`);
        console.log(`💰 支持的代币: USDT, ADA, LINK, SHIB`);
        
        return true;
      } catch (error) {
        console.error('❌ 区块链服务初始化失败:', error);
        return false;
      }
    },

    // 获取钱包USDT余额
    async getWalletBalance(): Promise<string> {
      try {
        if (!web3 || !usdtContract) {
          throw new Error('区块链服务未初始化');
        }

        // 使用动态decimals而不是硬编码1e18
        const rawBalance = await usdtContract.methods.balanceOf(walletAddress).call();
        const decimals = await usdtContract.methods.decimals().call();
        const base = new Decimal(10).pow(decimals);
        const balance = new Decimal(rawBalance).dividedBy(base);
        
        console.log(`💰 钱包USDT余额: ${balance.toString()} (原始值: ${rawBalance}, decimals: ${decimals})`);
        return balance.toString();
      } catch (error) {
        console.error('❌ 获取钱包余额失败:', error);
        throw error;
      }
    },

    // 获取指定代币余额
    async getTokenBalance(tokenSymbol: string): Promise<string> {
      return this.getTokenBalanceFromAddress(tokenSymbol, walletAddress);
    },

    // 从指定地址获取代币余额
    async getTokenBalanceFromAddress(tokenSymbol: string, address: string): Promise<string> {
      try {
        if (!web3) {
          throw new Error('区块链服务未初始化');
        }

        let contract: any = null;
        let contractAddress: string = '';

        switch (tokenSymbol.toUpperCase()) {
          case 'USDT':
            contract = usdtContract;
            contractAddress = USDT_CONTRACT_ADDRESS;
            break;
          case 'ADA':
            contract = adaContract;
            contractAddress = ADA_CONTRACT_ADDRESS;
            break;
          case 'LINK':
            contract = linkContract;
            contractAddress = LINK_CONTRACT_ADDRESS;
            break;
          case 'SHIB':
            contract = shibContract;
            contractAddress = SHIB_CONTRACT_ADDRESS;
            break;
          default:
            throw new Error(`不支持的代币: ${tokenSymbol}`);
        }

        if (!contract) {
          throw new Error(`代币合约未初始化: ${tokenSymbol}`);
        }

        const rawBalance = await contract.methods.balanceOf(address).call();
        const decimals = await contract.methods.decimals().call();
        const base = new Decimal(10).pow(decimals);
        const balance = new Decimal(rawBalance).dividedBy(base);

        console.log(`💰 ${tokenSymbol}余额: ${balance.toString()} (地址: ${address})`);
        return balance.toString();
      } catch (error) {
        console.error(`❌ 获取${tokenSymbol}余额失败:`, error);
        throw error;
      }
    },

    // 获取代币价格（这里可以集成价格API）
    async getTokenPrice(tokenSymbol: string): Promise<number> {
      // 这里可以集成CoinGecko或其他价格API
      // 暂时返回固定价格用于测试
      const prices: { [key: string]: number } = {
        'USDT': 1,
        'ADA': 0.5,
        'LINK': 15,
        'SHIB': 0.00001
      };
      
      return prices[tokenSymbol.toUpperCase()] || 0;
    },

    // 监控钱包交易
    async monitorWalletTransactions() {
      try {
        if (!web3) {
          throw new Error('区块链服务未初始化');
        }

        console.log('🔄 开始监控钱包交易...');

        // 获取所有活跃的充值通道
        const activeChannels = await this.strapi.entityService.findMany('api::recharge-channel.recharge-channel' as any, {
          filters: {
            status: 'active',
            channelType: { $in: ['recharge', 'both'] }
          }
        }) as any[];

        if (!activeChannels || activeChannels.length === 0) {
          console.log('⚠️ 没有找到活跃的充值通道');
          return;
        }

        // 获取所有待处理的充值订单
        const pendingOrders = await this.strapi.entityService.findMany('api::recharge-order.recharge-order' as any, {
          filters: {
            status: 'pending',
            receiveAddress: { $in: activeChannels.map(ch => ch.walletAddress) }
          }
        });

        console.log(`📊 找到 ${pendingOrders.length} 个待处理充值订单`);

        // 获取当前区块号
        const currentBlock = await web3.eth.getBlockNumber();
        console.log(`📦 当前区块号: ${currentBlock}`);

        // 获取上次检查的区块号
        let lastCheckedBlock = Math.max(Number(currentBlock) - 1000, 0); // 默认检查最近1000个区块

        // 尝试从数据库获取上次检查的区块号
        try {
          const config = await this.strapi.entityService.findMany('api::system-config.system-config' as any, {
            filters: { key: 'last_checked_block' }
          });
          if (config && config.length > 0) {
            lastCheckedBlock = Math.max(parseInt(config[0].value) || lastCheckedBlock, 0);
          }
        } catch (error) {
          console.log('⚠️ 无法获取上次检查的区块号，使用默认值');
        }

        console.log(`🔍 检查区块范围: ${lastCheckedBlock + 1} - ${currentBlock}`);

        // 检查每个区块的交易
        for (let blockNumber = lastCheckedBlock + 1; blockNumber <= currentBlock; blockNumber++) {
          try {
            const block = await web3.eth.getBlock(blockNumber, true);
            
            if (!block || !block.transactions) {
              continue;
            }

            // 检查每个交易
            for (const tx of block.transactions) {
              // 确保tx是交易对象而不是字符串
              if (typeof tx === 'object' && tx.to && activeChannels.some(ch => ch.walletAddress.toLowerCase() === tx.to.toLowerCase())) {
                console.log(`🎯 发现充值交易: ${tx.hash}`);
                await this.processIncomingTransaction(tx);
              }
            }

            // 更新最后检查的区块号
            await this.updateLastCheckedBlock(blockNumber);
          } catch (error) {
            console.error(`❌ 检查区块 ${blockNumber} 失败:`, error);
            
            // 记录跳过的区块
            await this.recordSkippedBlock(blockNumber, blockNumber, error.message);
          }
        }

        console.log('✅ 钱包交易监控完成');
      } catch (error) {
        console.error('❌ 监控钱包交易失败:', error);
        throw error;
      }
    },

    // 更新最后检查的区块号
    async updateLastCheckedBlock(blockNumber: number) {
      try {
        // 查找或创建系统配置
        const configs = await this.strapi.entityService.findMany('api::system-config.system-config' as any, {
          filters: { key: 'last_checked_block' }
        });
        
        if (configs && configs.length > 0) {
          await this.strapi.entityService.update('api::system-config.system-config' as any, configs[0].id, {
            data: { value: blockNumber.toString() }
          });
        } else {
          await this.strapi.entityService.create('api::system-config.system-config' as any, {
            data: {
              key: 'last_checked_block',
              value: blockNumber.toString(),
              description: '最后检查的区块号'
            }
          });
        }
      } catch (error) {
        console.error('❌ 更新最后检查区块号失败:', error);
      }
    },

    // 记录跳过的区块
    async recordSkippedBlock(fromBlock: number, toBlock: number, errorMessage: string) {
      try {
        await this.strapi.entityService.create('api::system-config.system-config' as any, {
          data: {
            key: `skipped_block_${fromBlock}_${toBlock}`,
            value: JSON.stringify({
              fromBlock,
              toBlock,
              errorMessage,
              timestamp: new Date().toISOString()
            }),
            description: `跳过的区块段 ${fromBlock}-${toBlock}`
          }
        });
      } catch (error) {
        console.error('❌ 记录跳过区块失败:', error);
      }
    },

    // 处理收到的交易
    async processIncomingTransaction(tx: any) {
      try {
        console.log(`🔍 处理交易: ${tx.hash}`);

        // 获取所有活跃的充值通道钱包地址
        const activeChannels = await this.strapi.entityService.findMany('api::recharge-channel.recharge-channel' as any, {
          filters: {
            status: 'active',
            channelType: { $in: ['recharge', 'both'] }
          }
        }) as any[];
        
        const walletAddresses = activeChannels.map(channel => channel.walletAddress);
        
        // 查找匹配的充值订单 - 只查找最近24小时内的订单
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const orders = await this.strapi.entityService.findMany('api::recharge-order.recharge-order' as any, {
          filters: {
            status: 'pending',
            receiveAddress: { $in: walletAddresses },
            createdAt: { $gte: oneDayAgo }
          },
          populate: ['user'], // 包含user关系
          sort: { createdAt: 'desc' } // 按创建时间倒序，优先匹配最新订单
        });

        // 查找匹配的订单
        const matchingOrder = orders.find(order => 
          order.receiveAddress.toLowerCase() === tx.to.toLowerCase() &&
          parseFloat(order.amount) === parseFloat(web3.utils.fromWei(tx.value || '0', 'ether'))
        );

        if (matchingOrder) {
          console.log(`✅ 找到匹配的充值订单: ${matchingOrder.orderNo}`);
          await this.completeRechargeOrder(matchingOrder, tx.hash, web3.utils.fromWei(tx.value || '0', 'ether'));
        } else {
          console.log(`⚠️ 未找到匹配的充值订单，交易值: ${web3.utils.fromWei(tx.value || '0', 'ether')} ETH`);
        }
      } catch (error) {
        console.error('❌ 处理交易失败:', error);
      }
    },

    // 完成充值订单
    async completeRechargeOrder(order: any, txHash: string, amount: string) {
      try {
        console.log(`💰 完成充值订单: ${order.orderNo}, 金额: ${amount} ETH`);

        // 更新订单状态
        await this.strapi.entityService.update('api::recharge-order.recharge-order' as any, order.id, {
          data: {
            status: 'completed',
            txHash: txHash,
            blockNumber: await web3.eth.getTransactionReceipt(txHash).then(receipt => receipt.blockNumber),
            confirmations: 12,
            receivedTime: new Date(),
            completedTime: new Date()
          }
        });

        // 增加用户钱包余额
        const wallets = await this.strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
          filters: { user: { id: order.user.id } }
        });

        const wallet = wallets[0];
        if (wallet) {
          const currentBalance = parseFloat(wallet.usdtYue || '0');
          const newBalance = currentBalance + parseFloat(amount);

          await this.strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
            data: {
              usdtYue: newBalance.toString()
            }
          });

          console.log(`✅ 用户余额已更新: ${currentBalance} -> ${newBalance} USDT`);

          // 发送充值成功推送通知
          try {
            const { HybridPushService } = require('../../../services/push/hybrid-push');
            const hybridPushService = new HybridPushService(this.strapi);
            await hybridPushService.sendToUser(order.user.id, 
              '充值成功', 
              `您的账户已成功充值${amount}USDT，当前余额${newBalance}USDT`
            );
            console.log(`📱 充值成功推送已发送给用户 ${order.user.id}`);
          } catch (error) {
            console.error('❌ 发送充值成功推送失败:', error);
          }
        } else {
          console.warn(`⚠️ 用户 ${order.user.id} 没有找到钱包记录`);
        }
      } catch (error) {
        console.error('❌ 完成充值订单失败:', error);
        throw error;
      }
    },

    // 执行提现
    async executeWithdrawal(order: any) {
      try {
        console.log(`🔄 执行提现: ${order.orderNo}, 代币: ${order.currency}, 金额: ${order.actualAmount}`);

        switch (order.currency.toUpperCase()) {
          case 'USDT':
            return await this.executeUsdtWithdrawal(order);
          case 'ADA':
            return await this.executeAdaWithdrawal(order);
          case 'LINK':
            return await this.executeLinkWithdrawal(order);
          case 'SHIB':
            return await this.executeShibWithdrawal(order);
          default:
            throw new Error(`不支持的提现代币: ${order.currency}`);
        }
      } catch (error) {
        console.error('❌ 执行提现失败:', error);
        throw error;
      }
    },

    // 处理待处理的提现订单
    async processPendingWithdrawals() {
      try {
        console.log('🔄 开始处理待处理的提现订单...');

        // 获取所有待处理的提现订单
        const pendingOrders = await this.strapi.entityService.findMany('api::withdrawal-order.withdrawal-order' as any, {
          filters: {
            status: 'pending'
          },
          populate: ['user'],
          sort: { createdAt: 'asc' }
        });

        console.log(`📊 找到 ${pendingOrders.length} 个待处理提现订单`);

        for (const order of pendingOrders) {
          try {
            console.log(`🔄 处理提现订单: ${order.orderNo}`);
            await this.executeWithdrawal(order);
            
            // 添加延迟避免请求过于频繁
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (error) {
            console.error(`❌ 处理提现订单 ${order.orderNo} 失败:`, error);
            
            // 更新订单状态为失败
            await this.strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
              data: {
                status: 'failed',
                processTime: new Date(),
                remark: error.message
              }
            });
          }
        }

        console.log('✅ 提现订单处理完成');
      } catch (error) {
        console.error('❌ 处理提现订单失败:', error);
        throw error;
      }
    },

    // 执行ADA提现
    async executeAdaWithdrawal(order: any) {
      try {
        console.log(`🔄 执行ADA提现转账: ${order.orderNo}, 金额: ${order.actualAmount} ADA`);

        // 检查钱包余额
        const walletBalance = await this.getTokenBalance('ADA');
        const requiredAmount = parseFloat(order.actualAmount);
        const currentBalance = parseFloat(walletBalance);

        if (currentBalance < requiredAmount) {
          const errorMsg = `钱包ADA余额不足: 需要${requiredAmount} ADA, 当前余额 ${currentBalance} ADA`;
          console.error(`❌ ${errorMsg}`);
          
          // 更新订单状态为失败
          await this.strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
            data: {
              status: 'failed',
              processTime: new Date(),
              remark: errorMsg
            }
          });
          
          throw new Error(errorMsg);
        }

        // 更新订单状态为处理中
        await this.strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
          data: {
            status: 'processing',
            processTime: new Date()
          }
        });

        // 获取ADA代币的decimals
        const decimals = await adaContract.methods.decimals().call();
        console.log(`🔍 ADA decimals: ${decimals}`);
        
        // 根据decimals计算转账金额
        const base = new Decimal(10).pow(decimals);
        const amountInSmallestUnit = new Decimal(order.actualAmount).mul(base);
        
        console.log(`💰 转账金额: ${order.actualAmount} ADA = ${amountInSmallestUnit.toString()} (最小单位)`);
        
        // 创建转账交易
        const tx = {
          from: walletAddress,
          to: ADA_CONTRACT_ADDRESS,
          data: adaContract.methods.transfer(order.withdrawAddress, amountInSmallestUnit.toString()).encodeABI(),
          gas: '100000',
          gasPrice: await web3.eth.getGasPrice()
        };

        // 签名并发送交易
        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction!);

        // 更新订单状态为完成
        await this.strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
          data: {
            status: 'completed',
            txHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            confirmations: 1,
            completedTime: new Date()
          }
        });

        console.log(`✅ ADA提现转账完成: ${order.orderNo}, tx: ${receipt.transactionHash}`);
        
        // 发送提现成功推送通知
        try {
          if (order.user && order.user.id) {
            const { HybridPushService } = require('../../../services/push/hybrid-push');
            const hybridPushService = new HybridPushService(this.strapi);
            await hybridPushService.sendToUser(order.user.id,
              '提现成功',
              `您的${order.currency}提现已成功，金额${order.actualAmount}${order.currency}`
            );
            console.log(`📱 提现成功推送已发送给用户 ${order.user.id}`);
          } else {
            console.warn(`⚠️ 提现订单 ${order.orderNo} 缺少用户信息，跳过推送通知`);
          }
        } catch (error) {
          console.error('❌ 发送提现成功推送失败:', error);
        }
        
        return receipt.transactionHash;
      } catch (error) {
        console.error('❌ 执行ADA提现转账失败:', error);
        
        // 回滚aiYue余额（提现失败时恢复用户余额）
        try {
          // 直接通过用户ID查找钱包，避免关联查询问题
          const wallets = await this.strapi.db.query('api::qianbao-yue.qianbao-yue').findMany({
            where: { user: order.user }
          });
          
          if (wallets && wallets.length > 0) {
            const wallet = wallets[0];
            const currentAiYue = new Decimal(wallet.aiYue || '0');
            
            // 使用订单中记录的USDT价值进行回滚
            const rollbackAmount = new Decimal(order.deductedUsdtValue || '0');
            const newAiYue = currentAiYue.plus(rollbackAmount);
            
            await this.strapi.db.query('api::qianbao-yue.qianbao-yue').update({
              where: { id: wallet.id },
              data: {
                aiYue: newAiYue.toString()
              }
            });
            
            console.log(`🔄 回滚ADA提现失败: 恢复 ${rollbackAmount.toString()} USDT, 新余额 ${newAiYue.toString()}`);
          }
        } catch (rollbackError) {
          console.error('❌ 回滚aiYue余额失败:', rollbackError);
        }
        
        throw error;
      }
    },

    // 执行LINK提现
    async executeLinkWithdrawal(order: any) {
      try {
        console.log(`🔄 执行LINK提现转账: ${order.orderNo}, 金额: ${order.actualAmount} LINK`);

        // 检查钱包余额
        const walletBalance = await this.getTokenBalance('LINK');
        const requiredAmount = parseFloat(order.actualAmount);
        const currentBalance = parseFloat(walletBalance);

        if (currentBalance < requiredAmount) {
          const errorMsg = `钱包LINK余额不足: 需要${requiredAmount} LINK, 当前余额 ${currentBalance} LINK`;
          console.error(`❌ ${errorMsg}`);
          
          // 更新订单状态为失败
          await this.strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
            data: {
              status: 'failed',
              processTime: new Date(),
              remark: errorMsg
            }
          });
          
          throw new Error(errorMsg);
        }

        // 更新订单状态为处理中
        await this.strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
          data: {
            status: 'processing',
            processTime: new Date()
          }
        });

        // 获取LINK代币的decimals
        const decimals = await linkContract.methods.decimals().call();
        console.log(`🔍 LINK decimals: ${decimals}`);
        
        // 根据decimals计算转账金额
        const base = new Decimal(10).pow(decimals);
        const amountInSmallestUnit = new Decimal(order.actualAmount).mul(base);
        
        console.log(`💰 转账金额: ${order.actualAmount} LINK = ${amountInSmallestUnit.toString()} (最小单位)`);
        
        // 创建转账交易
        const tx = {
          from: walletAddress,
          to: LINK_CONTRACT_ADDRESS,
          data: linkContract.methods.transfer(order.withdrawAddress, amountInSmallestUnit.toString()).encodeABI(),
          gas: '100000',
          gasPrice: await web3.eth.getGasPrice()
        };

        // 签名并发送交易
        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction!);

        // 更新订单状态为完成
        await this.strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
          data: {
            status: 'completed',
            txHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            confirmations: 1,
            completedTime: new Date()
          }
        });

        console.log(`✅ LINK提现转账完成: ${order.orderNo}, tx: ${receipt.transactionHash}`);
        
        // 发送提现成功推送通知
        try {
          if (order.user && order.user.id) {
            const { HybridPushService } = require('../../../services/push/hybrid-push');
            const hybridPushService = new HybridPushService(this.strapi);
            await hybridPushService.sendToUser(order.user.id,
              '提现成功',
              `您的${order.currency}提现已成功，金额${order.actualAmount}${order.currency}`
            );
            console.log(`📱 提现成功推送已发送给用户 ${order.user.id}`);
          } else {
            console.warn(`⚠️ 提现订单 ${order.orderNo} 缺少用户信息，跳过推送通知`);
          }
        } catch (error) {
          console.error('❌ 发送提现成功推送失败:', error);
        }
        
        return receipt.transactionHash;
      } catch (error) {
        console.error('❌ 执行LINK提现转账失败:', error);
        
        // 回滚aiYue余额（提现失败时恢复用户余额）
        try {
          // 直接通过用户ID查找钱包，避免关联查询问题
          const wallets = await this.strapi.db.query('api::qianbao-yue.qianbao-yue').findMany({
            where: { user: order.user }
          });
          
          if (wallets && wallets.length > 0) {
            const wallet = wallets[0];
            const currentAiYue = new Decimal(wallet.aiYue || '0');
            
            // 使用订单中记录的USDT价值进行回滚
            const rollbackAmount = new Decimal(order.deductedUsdtValue || '0');
            const newAiYue = currentAiYue.plus(rollbackAmount);
            
            await this.strapi.db.query('api::qianbao-yue.qianbao-yue').update({
              where: { id: wallet.id },
              data: {
                aiYue: newAiYue.toString()
              }
            });
            
            console.log(`🔄 回滚LINK提现失败: 恢复 ${rollbackAmount.toString()} USDT, 新余额 ${newAiYue.toString()}`);
          }
        } catch (rollbackError) {
          console.error('❌ 回滚aiYue余额失败:', rollbackError);
        }
        
        throw error;
      }
    },

    // 执行SHIB提现
    async executeShibWithdrawal(order: any) {
      try {
        console.log(`🔄 执行SHIB提现转账: ${order.orderNo}, 金额: ${order.actualAmount} SHIB`);

        // 检查钱包余额
        const walletBalance = await this.getTokenBalance('SHIB');
        const requiredAmount = parseFloat(order.actualAmount);
        const currentBalance = parseFloat(walletBalance);

        if (currentBalance < requiredAmount) {
          const errorMsg = `钱包SHIB余额不足: 需要${requiredAmount} SHIB, 当前余额 ${currentBalance} SHIB`;
          console.error(`❌ ${errorMsg}`);
          
          // 更新订单状态为失败
          await this.strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
            data: {
              status: 'failed',
              processTime: new Date(),
              remark: errorMsg
            }
          });
          
          throw new Error(errorMsg);
        }

        // 更新订单状态为处理中
        await this.strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
          data: {
            status: 'processing',
            processTime: new Date()
          }
        });

        // 获取SHIB代币的decimals
        const decimals = await shibContract.methods.decimals().call();
        console.log(`🔍 SHIB decimals: ${decimals}`);
        
        // 根据decimals计算转账金额
        const base = new Decimal(10).pow(decimals);
        const amountInSmallestUnit = new Decimal(order.actualAmount).mul(base);
        
        console.log(`💰 转账金额: ${order.actualAmount} SHIB = ${amountInSmallestUnit.toString()} (最小单位)`);
        
        // 创建转账交易
        const tx = {
          from: walletAddress,
          to: SHIB_CONTRACT_ADDRESS,
          data: shibContract.methods.transfer(order.withdrawAddress, amountInSmallestUnit.toString()).encodeABI(),
          gas: '100000',
          gasPrice: await web3.eth.getGasPrice()
        };

        // 签名并发送交易
        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction!);

        // 更新订单状态为完成
        await this.strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
          data: {
            status: 'completed',
            txHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            confirmations: 1,
            completedTime: new Date()
          }
        });

        console.log(`✅ SHIB提现转账完成: ${order.orderNo}, tx: ${receipt.transactionHash}`);
        
        // 发送提现成功推送通知
        try {
          if (order.user && order.user.id) {
            const { HybridPushService } = require('../../../services/push/hybrid-push');
            const hybridPushService = new HybridPushService(this.strapi);
            await hybridPushService.sendToUser(order.user.id,
              '提现成功',
              `您的${order.currency}提现已成功，金额${order.actualAmount}${order.currency}`
            );
            console.log(`📱 提现成功推送已发送给用户 ${order.user.id}`);
          } else {
            console.warn(`⚠️ 提现订单 ${order.orderNo} 缺少用户信息，跳过推送通知`);
          }
        } catch (error) {
          console.error('❌ 发送提现成功推送失败:', error);
        }
        
        return receipt.transactionHash;
      } catch (error) {
        console.error('❌ 执行SHIB提现转账失败:', error);
        
        // 回滚aiYue余额（提现失败时恢复用户余额）
        try {
          // 直接通过用户ID查找钱包，避免关联查询问题
          const wallets = await this.strapi.db.query('api::qianbao-yue.qianbao-yue').findMany({
            where: { user: order.user }
          });
          
          if (wallets && wallets.length > 0) {
            const wallet = wallets[0];
            const currentAiYue = new Decimal(wallet.aiYue || '0');
            
            // 使用订单中记录的USDT价值进行回滚
            const rollbackAmount = new Decimal(order.deductedUsdtValue || '0');
            const newAiYue = currentAiYue.plus(rollbackAmount);
            
            await this.strapi.db.query('api::qianbao-yue.qianbao-yue').update({
              where: { id: wallet.id },
              data: {
                aiYue: newAiYue.toString()
              }
            });
            
            console.log(`🔄 回滚SHIB提现失败: 恢复 ${rollbackAmount.toString()} USDT, 新余额 ${newAiYue.toString()}`);
          }
        } catch (rollbackError) {
          console.error('❌ 回滚aiYue余额失败:', rollbackError);
        }
        
        throw error;
      }
    },

    // 执行USDT提现（原有方法保持不变）
    async executeUsdtWithdrawal(order: any) {
      try {
        console.log(`🔄 执行USDT提现转账: ${order.orderNo}, 金额: ${order.actualAmount} USDT`);

        // 检查钱包余额
        const walletBalance = await this.getWalletBalance();
        const requiredAmount = parseFloat(order.actualAmount);
        const currentBalance = parseFloat(walletBalance);

        if (currentBalance < requiredAmount) {
          const errorMsg = `钱包USDT余额不足: 需要${requiredAmount} USDT, 当前余额 ${currentBalance} USDT`;
          console.error(`❌ ${errorMsg}`);
          
          // 更新订单状态为失败
          await this.strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
            data: {
              status: 'failed',
              processTime: new Date(),
              remark: errorMsg
            }
          });
          
          throw new Error(errorMsg);
        }

        // 更新订单状态为处理中
        await this.strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
          data: {
            status: 'processing',
            processTime: new Date()
          }
        });

        // 获取USDT代币的decimals
        const decimals = await usdtContract.methods.decimals().call();
        console.log(`🔍 USDT decimals: ${decimals}`);
        
        // 根据decimals计算转账金额
        const base = new Decimal(10).pow(decimals);
        const amountInSmallestUnit = new Decimal(order.actualAmount).mul(base);
        
        console.log(`💰 转账金额: ${order.actualAmount} USDT = ${amountInSmallestUnit.toString()} (最小单位)`);
        
        // 创建转账交易
        const tx = {
          from: walletAddress,
          to: USDT_CONTRACT_ADDRESS,
          data: usdtContract.methods.transfer(order.withdrawAddress, amountInSmallestUnit.toString()).encodeABI(),
          gas: '100000',
          gasPrice: await web3.eth.getGasPrice()
        };

        // 签名并发送交易
        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction!);

        // 更新订单状态为完成
        await this.strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
          data: {
            status: 'completed',
            txHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            confirmations: 1,
            completedTime: new Date()
          }
        });

        console.log(`✅ USDT提现转账完成: ${order.orderNo}, tx: ${receipt.transactionHash}`);
        
        // 发送提现成功推送通知
        try {
          if (order.user && order.user.id) {
            const { HybridPushService } = require('../../../services/push/hybrid-push');
            const hybridPushService = new HybridPushService(this.strapi);
            await hybridPushService.sendToUser(order.user.id,
              '提现成功',
              `您的${order.currency}提现已成功，金额${order.actualAmount}${order.currency}`
            );
            console.log(`📱 提现成功推送已发送给用户 ${order.user.id}`);
          } else {
            console.warn(`⚠️ 提现订单 ${order.orderNo} 缺少用户信息，跳过推送通知`);
          }
        } catch (error) {
          console.error('❌ 发送提现成功推送失败:', error);
        }
        
        return receipt.transactionHash;
      } catch (error) {
        console.error('❌ 执行USDT提现转账失败:', error);
        
        // 回滚aiYue余额（提现失败时恢复用户余额）
        try {
          // 直接通过用户ID查找钱包，避免关联查询问题
          const wallets = await this.strapi.db.query('api::qianbao-yue.qianbao-yue').findMany({
            where: { user: order.user }
          });
          
          if (wallets && wallets.length > 0) {
            const wallet = wallets[0];
            const currentAiYue = new Decimal(wallet.aiYue || '0');
            
            // 使用订单中记录的USDT价值进行回滚
            const rollbackAmount = new Decimal(order.deductedUsdtValue || '0');
            const newAiYue = currentAiYue.plus(rollbackAmount);
            
            await this.strapi.db.query('api::qianbao-yue.qianbao-yue').update({
              where: { id: wallet.id },
              data: {
                aiYue: newAiYue.toString()
              }
            });
            
            console.log(`🔄 回滚USDT提现失败: 恢复 ${rollbackAmount.toString()} USDT, 新余额 ${newAiYue.toString()}`);
          }
        } catch (rollbackError) {
          console.error('❌ 回滚aiYue余额失败:', rollbackError);
        }
        
        throw error;
      }
    }
  };
};
