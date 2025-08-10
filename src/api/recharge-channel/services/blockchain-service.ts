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

// BSC USDT合约地址 - 将从后台配置动态获取
const DEFAULT_USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';

// 添加其他代币合约地址
const ADA_CONTRACT_ADDRESS = '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47';
const LINK_CONTRACT_ADDRESS = '0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd';
const SHIB_CONTRACT_ADDRESS = '0x2859e4544c4bb03966803b044a93563bd2d0dd4d';

// 小窗口扫描配置
const SCAN_STEP = 100; // 每次扫描100个区块，平衡性能和及时性
const SCAN_BACK_RANGE = 3000; // 回扫范围：3000个区块
const CHAIN_CONFIRMATIONS = 3; // BSC/Polygon确认数：3个
const SCAN_ALWAYS = true; // 总是回扫，不管有没有pending订单
let lastProcessedBlock = 0;

// 调试开关
const VERBOSE = true; // 强制启用详细日志，方便调试

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
    
    // 加载检查点
    async _loadCheckpoint(): Promise<number> {
      try {
        const config = await strapi.entityService.findMany('api::system-config.system-config' as any, {
          filters: { key: 'last_processed_block' },
          fields: ['value'],
          limit: 1
        });
        return config && config.length > 0 ? parseInt(config[0].value) : 0;
      } catch (error) {
        console.warn('⚠️ 加载检查点失败:', error);
        return 0;
      }
    },

    // 保存检查点
    async _saveCheckpoint(blockNumber: number): Promise<void> {
      try {
        const existing = await strapi.entityService.findMany('api::system-config.system-config' as any, {
          filters: { key: 'last_processed_block' },
          fields: ['id'],
          limit: 1
        });

        if (existing && existing.length > 0) {
          await strapi.entityService.update('api::system-config.system-config' as any, existing[0].id, {
            data: { value: blockNumber.toString() }
          });
        } else {
          await strapi.entityService.create('api::system-config.system-config' as any, {
            data: { key: 'last_processed_block', value: blockNumber.toString() }
          });
        }
      } catch (error) {
        console.warn('⚠️ 保存检查点失败:', error);
      }
    },
    
    // 初始化Web3连接 - 重命名为init
    async init() {
      try {
        // 强制使用Ankr付费节点
        const rpcUrl = 'https://rpc.ankr.com/bsc/0cc28cc1d2308734e5535767191f325256d627fee791f33b30b8a9e9f53d02fb';
        web3 = new Web3(rpcUrl);
        
        // 初始化所有代币合约
        usdtContract = new web3.eth.Contract(TOKEN_ABI, DEFAULT_USDT_CONTRACT_ADDRESS);
        adaContract = new web3.eth.Contract(TOKEN_ABI, ADA_CONTRACT_ADDRESS);
        linkContract = new web3.eth.Contract(TOKEN_ABI, LINK_CONTRACT_ADDRESS);
        shibContract = new web3.eth.Contract(TOKEN_ABI, SHIB_CONTRACT_ADDRESS);
        
        // 加载上次处理的区块号
        lastProcessedBlock = await this._loadCheckpoint();
        console.log(`📍 加载检查点: 上次处理区块 ${lastProcessedBlock}`);
        
        // 如果检查点为0，从当前区块开始
        if (lastProcessedBlock === 0) {
          const currentBlock = await web3.eth.getBlockNumber();
          lastProcessedBlock = Math.max(0, Number(currentBlock) - 100); // 从100个区块前开始
          console.log(`🔄 检查点为0，从区块 ${lastProcessedBlock} 开始扫描`);
        }
        
        console.log('✅ 区块链服务初始化成功');
        console.log(`🌐 RPC节点: Ankr付费节点`);
        console.log(`💰 支持的代币: USDT, ADA, LINK, SHIB`);
        console.log(`🔍 扫描起始区块: ${lastProcessedBlock}`);
        console.log(`🔄 钱包配置将从数据库动态获取`);
        
        return true;
      } catch (error) {
        console.error('❌ 区块链服务初始化失败:', error);
        return false;
      }
    },

    // 小窗口扫描方法
    async scanNextWindow() {
      try {
        if (!web3) {
          console.warn('⚠️ Web3未初始化，跳过扫描');
          return;
        }

        const currentBlock = await web3.eth.getBlockNumber();
        const tip = Number(currentBlock);
        
        // 计算扫描范围
        const fromBlock = Math.max(lastProcessedBlock + 1, tip - SCAN_BACK_RANGE - CHAIN_CONFIRMATIONS);
        const toBlock = tip - CHAIN_CONFIRMATIONS;

        if (fromBlock > toBlock) {
          if (VERBOSE) console.log('📊 没有新区块需要扫描');
          return;
        }

        if (VERBOSE) {
          console.log(`🔍 扫描区块范围: ${fromBlock} - ${toBlock} (共${toBlock - fromBlock + 1}个区块)`);
          console.log(`📊 当前区块: ${tip}, 确认数: ${CHAIN_CONFIRMATIONS}`);
        }
        
        await this.scanRange(fromBlock, toBlock);
        lastProcessedBlock = toBlock;
        await this._saveCheckpoint(lastProcessedBlock);
        
      } catch (error) {
        console.error('❌ 扫描区块失败:', error);
      }
    },

    // 扫描指定范围的区块
    async scanRange(fromBlock: number, toBlock: number) {
      try {
        // 获取活跃的充值渠道
        const activeChannels = await this.strapi.entityService.findMany('api::recharge-channel.recharge-channel' as any, {
          filters: { status: 'active' }
        });

        if (!activeChannels || !Array.isArray(activeChannels) || activeChannels.length === 0) {
          if (VERBOSE) console.log('⚠️ 没有活跃的充值渠道');
          return;
        }

        // 扫描每个区块
        for (let blockNumber = fromBlock; blockNumber <= toBlock; blockNumber++) {
          try {
            const block = await web3!.eth.getBlock(blockNumber, true);
            if (!block || !block.transactions) continue;

            // 检查每个交易
            for (const tx of block.transactions) {
              if (typeof tx === 'object' && tx.to) {
                // 检查ETH转账到充值地址
                if (activeChannels.some((ch: any) => ch.walletAddress.toLowerCase() === tx.to.toLowerCase())) {
                  if (VERBOSE) console.log(`🎯 发现ETH充值交易: ${tx.hash}`);
                  await this.processIncomingTransaction(tx);
                }
                
                // 检查代币转账到充值地址 - 基于后台配置
                for (const channel of activeChannels) {
                  if (channel.contractAddress && tx.to.toLowerCase() === channel.contractAddress.toLowerCase() && tx.input && tx.input.length > 10) {
                    try {
                      const methodId = tx.input.slice(0, 10);
                      if (methodId === '0xa9059cbb') { // transfer方法
                        const toAddress = '0x' + tx.input.slice(10, 74);
                        if (channel.walletAddress.toLowerCase() === toAddress.toLowerCase()) {
                          if (VERBOSE) console.log(`🎯 发现${channel.asset}充值交易: ${tx.hash}, 到地址: ${toAddress}, 通道: ${channel.name}`);
                          await this.processIncomingTransaction(tx);
                        }
                      }
                    } catch (error) {
                      if (VERBOSE) console.warn(`⚠️ 解析${channel.asset}交易失败: ${error.message}`);
                    }
                  }
                }
              }
            }
          } catch (blockError) {
            if (VERBOSE) console.warn(`⚠️ 扫描区块 ${blockNumber} 失败:`, blockError);
            continue;
          }
        }
      } catch (error) {
        console.error('❌ 扫描区块范围失败:', error);
      }
    },

    // 动态获取钱包配置
    async getWalletConfig(channelType: 'recharge' | 'withdrawal' | 'both', asset: string = 'USDT'): Promise<{address: string, privateKey: string} | null> {
      try {
        const channels = await this.strapi.entityService.findMany('api::recharge-channel.recharge-channel' as any, {
          filters: {
            status: 'active',
            channelType: { $in: [channelType, 'both'] },
            asset: asset
          },
          fields: ['walletAddress', 'walletPrivateKey'],
          limit: 1
        });

        if (!channels || !Array.isArray(channels) || channels.length === 0) {
          console.warn(`⚠️ 未找到${asset}的${channelType}通道配置`);
          return null;
        }

        const channel = channels[0];
        if (!channel.walletAddress || !channel.walletPrivateKey) {
          console.warn(`⚠️ ${asset}的${channelType}通道配置不完整`);
          return null;
        }

        return {
          address: channel.walletAddress,
          privateKey: channel.walletPrivateKey
        };
      } catch (error) {
        console.error(`❌ 获取${asset}的${channelType}钱包配置失败:`, error);
        return null;
      }
    },

    // 获取钱包USDT余额
    async getWalletBalance(): Promise<string> {
      try {
        if (!web3 || !usdtContract) {
          throw new Error('区块链服务未初始化');
        }

        // 动态获取提现钱包配置
        const walletConfig = await this.getWalletConfig('withdrawal', 'USDT');
        if (!walletConfig) {
          throw new Error('未找到USDT提现钱包配置');
        }

        // 使用动态decimals而不是硬编码1e18
        const rawBalance = await usdtContract.methods.balanceOf(walletConfig.address).call();
        const decimals = await usdtContract.methods.decimals().call();
        const base = new Decimal(10).pow(decimals);
        const balance = new Decimal(rawBalance).dividedBy(base);
        
        console.log(`💰 钱包USDT余额: ${balance.toString()} (地址: ${walletConfig.address}, 原始值: ${rawBalance}, decimals: ${decimals})`);
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
            contractAddress = DEFAULT_USDT_CONTRACT_ADDRESS;
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

    // 监控钱包交易 - 已废弃，使用scanNextWindow替代
    async monitorWalletTransactions() {
      console.log('⚠️ monitorWalletTransactions已废弃，使用scanNextWindow替代');
      return 0;
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

        // 获取所有活跃的充值通道钱包地址，统一为小写
        const activeChannels = await this.strapi.entityService.findMany('api::recharge-channel.recharge-channel' as any, {
          filters: {
            status: 'active',
            channelType: { $in: ['recharge', 'both'] }
          }
        }) as any[];
        
        // 创建小写地址集合，避免大小写匹配问题
        const addrSet = new Set(activeChannels.map(ch => String(ch.walletAddress).toLowerCase()));
        
        // 查找匹配的充值订单 - 不在DB层面过滤地址，避免大小写问题
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const ordersAll = await this.strapi.entityService.findMany('api::recharge-order.recharge-order' as any, {
          filters: {
            createdAt: { $gte: sevenDaysAgo }
          },
          populate: ['user'], // 包含user关系
          sort: { createdAt: 'desc' } // 按创建时间倒序，优先匹配最新订单
        });
        
        // 在内存中过滤匹配的订单，避免大小写问题
        const orders = ordersAll.filter(o => 
          o.receiveAddress && addrSet.has(String(o.receiveAddress).toLowerCase())
        );

        console.log(`📊 找到 ${orders.length} 个相关订单`);

        // 检查是否是ETH转账
        if (tx.value && tx.value !== '0x0') {
          const ethAmount = parseFloat(web3.utils.fromWei(tx.value, 'ether'));
          
          // 优先匹配pending订单
          let matchingOrder = orders.find(order => 
            order.status === 'pending' &&
            order.receiveAddress.toLowerCase() === tx.to.toLowerCase() &&
            parseFloat(order.amount) === ethAmount
          );

          // 如果没有pending订单，尝试匹配其他状态的订单（防止重复入账）
          if (!matchingOrder) {
            matchingOrder = orders.find(order => 
              order.receiveAddress.toLowerCase() === tx.to.toLowerCase() &&
              parseFloat(order.amount) === ethAmount &&
              order.txHash !== tx.hash // 避免重复处理
            );
          }

          if (matchingOrder) {
            console.log(`✅ 找到匹配的ETH充值订单: ${matchingOrder.orderNo}, 状态: ${matchingOrder.status}`);
            if (matchingOrder.status === 'pending') {
              await this.completeRechargeOrder(matchingOrder, tx.hash, ethAmount.toString());
            } else {
              console.log(`⚠️ 订单 ${matchingOrder.orderNo} 已处理过，跳过`);
            }
            return;
          }
        }

        // 检查代币转账 - 基于后台配置
        for (const channel of activeChannels) {
          if (channel.contractAddress && tx.to && tx.to.toLowerCase() === channel.contractAddress.toLowerCase() && tx.input && tx.input.length > 10) {
            try {
              // 解析代币转账数据
              const methodId = tx.input.slice(0, 10);
              if (methodId === '0xa9059cbb') { // transfer方法
                // 使用Web3 ABI解码器，更稳定可靠
                const decoded = web3.eth.abi.decodeParameters(
                  ['address', 'uint256'],
                  '0x' + tx.input.slice(10)
                );
                const toAddress = String(decoded[0]).toLowerCase(); // 统一为小写
                const rawAmount = String(decoded[1]); // 十进制字符串
                
                // 动态获取合约decimals，避免配置错误
                const erc = new web3.eth.Contract(TOKEN_ABI, channel.contractAddress);
                const decimals = await erc.methods.decimals().call();
                const tokenAmount = new Decimal(rawAmount).dividedBy(new Decimal(10).pow(decimals));

                console.log(`🔍 检测到${channel.asset}转账: 到地址 ${toAddress}, 金额 ${tokenAmount.toString()} ${channel.asset}, decimals: ${decimals}`);

                // 查找匹配的充值订单 - 允许一定的金额误差
                let matchingOrder = orders.find(order => {
                  const orderAmount = new Decimal(order.amount);
                  const difference = orderAmount.minus(tokenAmount).abs();
                  const tolerance = new Decimal(0.01); // 减少容差到0.01，提高匹配精度
                  
                  return order.status === 'pending' &&
                         order.receiveAddress.toLowerCase() === toAddress && 
                         difference.lessThanOrEqualTo(tolerance);
                });

                // 如果没有pending订单，尝试匹配其他状态的订单
                if (!matchingOrder) {
                  matchingOrder = orders.find(order => {
                    const orderAmount = new Decimal(order.amount);
                    const difference = orderAmount.minus(tokenAmount).abs();
                    const tolerance = new Decimal(0.01);
                    
                    return order.receiveAddress.toLowerCase() === toAddress && 
                           difference.lessThanOrEqualTo(tolerance) &&
                           order.txHash !== tx.hash; // 避免重复处理
                  });
                }

                if (matchingOrder) {
                  console.log(`✅ 找到匹配的${channel.asset}充值订单: ${matchingOrder.orderNo}, 状态: ${matchingOrder.status}`);
                  if (matchingOrder.status === 'pending') {
                    await this.completeRechargeOrder(matchingOrder, tx.hash, tokenAmount.toString());
                  } else {
                    console.log(`⚠️ 订单 ${matchingOrder.orderNo} 已处理过，跳过`);
                  }
                  return;
                }
              }
            } catch (decodeError) {
              console.log(`⚠️ 解析${channel.asset}转账数据失败: ${decodeError.message}`);
            }
          }
        }

        console.log(`⚠️ 未找到匹配的充值订单，交易哈希: ${tx.hash}`);
      } catch (error) {
        console.error('❌ 处理交易失败:', error);
      }
    },

    // 完成充值订单
    async completeRechargeOrder(order: any, txHash: string, amount: string) {
      try {
        console.log(`💰 完成充值订单: ${order.orderNo}, 金额: ${amount} USDT`);

        // 幂等性检查：如果订单已经完成且txHash相同，跳过
        if (order.status === 'completed' && order.txHash === txHash) {
          console.log(`⚠️ 订单 ${order.orderNo} 已处理过，跳过重复处理`);
          return;
        }

        // 获取交易收据
        let blockNumber = 0;
        try {
          const receipt = await web3.eth.getTransactionReceipt(txHash);
          blockNumber = Number(receipt.blockNumber); // 修复：将bigint转换为number
        } catch (receiptError) {
          console.warn(`⚠️ 获取交易收据失败: ${receiptError.message}`);
        }

        // 更新订单状态
        await this.strapi.entityService.update('api::recharge-order.recharge-order' as any, order.id, {
          data: {
            status: 'completed',
            txHash: txHash,
            blockNumber: blockNumber,
            confirmations: CHAIN_CONFIRMATIONS,
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

    // 处理待处理的提现订单 - 重命名为processWithdrawals
    async processWithdrawals() {
      try {
        if (!web3) {
          console.warn('⚠️ Web3未初始化，跳过提现处理');
          return;
        }

        // 获取待处理的提现订单
        const pendingWithdrawals = await this.strapi.entityService.findMany('api::withdrawal-order.withdrawal-order' as any, {
          filters: { status: 'pending' },
          populate: { user: true }
        });

        if (!pendingWithdrawals || pendingWithdrawals.length === 0) {
          if (VERBOSE) console.log('✅ 无待处理提现订单');
          return;
        }

        if (VERBOSE) console.log(`📊 找到 ${pendingWithdrawals.length} 个待处理提现订单`);

        for (const order of pendingWithdrawals) {
          try {
            await this.executeWithdrawal(order);
          } catch (error) {
            console.error(`❌ 处理提现订单 ${order.id} 失败:`, error);
          }
        }

        if (VERBOSE) console.log('✅ 提现订单处理完成');
      } catch (error) {
        console.error('❌ 处理提现订单失败:', error);
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

        // 动态获取提现钱包配置
        const walletConfig = await this.getWalletConfig('withdrawal', 'USDT');
        if (!walletConfig) {
          const errorMsg = '未找到USDT提现钱包配置';
          console.error(`❌ ${errorMsg}`);
          
          await this.strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
            data: {
              status: 'failed',
              processTime: new Date(),
              remark: errorMsg
            }
          });
          
          throw new Error(errorMsg);
        }

        // 检查钱包余额
        const rawBalance = await usdtContract.methods.balanceOf(walletConfig.address).call();
        const decimals = await usdtContract.methods.decimals().call();
        const base = new Decimal(10).pow(decimals);
        const currentBalance = new Decimal(rawBalance).dividedBy(base);
        const requiredAmount = new Decimal(order.actualAmount);

        console.log(`💰 提现钱包USDT余额: ${currentBalance.toString()} (地址: ${walletConfig.address})`);

        if (currentBalance.lessThan(requiredAmount)) {
          const errorMsg = `钱包USDT余额不足: 需要${requiredAmount.toString()} USDT, 当前余额 ${currentBalance.toString()} USDT`;
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

        console.log(`🔍 USDT decimals: ${decimals}`);
        
        // 根据decimals计算转账金额
        const amountInSmallestUnit = requiredAmount.mul(base);
        
        console.log(`💰 转账金额: ${order.actualAmount} USDT = ${amountInSmallestUnit.toString()} (最小单位)`);
        
        // 创建转账交易
        const tx = {
          from: walletConfig.address,
          to: DEFAULT_USDT_CONTRACT_ADDRESS,
          data: usdtContract.methods.transfer(order.withdrawAddress, amountInSmallestUnit.toString()).encodeABI(),
          gas: '100000',
          gasPrice: await web3.eth.getGasPrice()
        };

        // 签名并发送交易
        const signedTx = await web3.eth.accounts.signTransaction(tx, walletConfig.privateKey);
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
