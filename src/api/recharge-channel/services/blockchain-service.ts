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
        return '0';
      }
    },

    // 获取指定代币余额
    async getTokenBalance(tokenSymbol: string): Promise<string> {
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
            throw new Error(`不支持的代币类型: ${tokenSymbol}`);
        }

        if (!contract) {
          throw new Error(`代币合约未初始化: ${tokenSymbol}`);
        }

        console.log(`🔍 查询${tokenSymbol}余额 - 合约地址: ${contractAddress}`);
        console.log(`🔍 查询${tokenSymbol}余额 - 钱包地址: ${walletAddress}`);

        // 获取原始余额
        const rawBalance = await contract.methods.balanceOf(walletAddress).call();
        
        // 动态读取代币的decimals
        const decimals = await contract.methods.decimals().call();
        console.log(`🔍 ${tokenSymbol} decimals: ${decimals}`);
        
        // 根据decimals计算实际余额
        const base = new Decimal(10).pow(decimals);
        const balance = new Decimal(rawBalance).dividedBy(base);
        
        console.log(`💰 钱包${tokenSymbol}余额: ${balance.toString()} (原始值: ${rawBalance}, decimals: ${decimals})`);
        return balance.toString();
      } catch (error) {
        console.error(`❌ 获取${tokenSymbol}余额失败:`, error);
        return '0';
      }
    },

    // 获取代币实时价格
    async getTokenPrice(tokenSymbol: string): Promise<number> {
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
    },

    // 分页查询日志，避免日志条数超限
    async getLogsPaged(
      params: { address: string; topics: (string|null)[]; fromBlock: number; toBlock: number },
      logLimit = 9500
    ): Promise<any[]> {
      const { fromBlock, toBlock } = params;

      let logs: any[];
      try {
        logs = await web3.eth.getPastLogs(params);
      } catch (err: any) {
        // 只有这里才会捕到 -32005
        if (err?.code !== -32005) throw err;          // 其它异常直接抛给外层
        logs = null as any;                           // 标记需要递归
        console.warn(`⚠️  RPC limit (-32005) from ${fromBlock} to ${toBlock}`);
      }

      // ① RPC 成功且条数在阈值内 —— 返回
      if (logs && logs.length <= logLimit) return logs;

      // ② RPC 成功但条数超阈值，或 RPC 直接报 -32005 —— 进入二分
      if (fromBlock === toBlock) {
        console.error(`❌ 单区块 ${fromBlock} 仍超限，记录告警后跳过`);
        await this.recordSkippedBlock(fromBlock, toBlock, `单区块仍超限: -32005`);
        return [];                                    // 不再抛异常
      }

      const mid = Math.floor((fromBlock + toBlock) / 2);
      const left = await this.getLogsPaged({ ...params, fromBlock, toBlock: mid }, logLimit);
      const right = await this.getLogsPaged({ ...params, fromBlock: mid + 1, toBlock }, logLimit);
      return [...left, ...right];
    },

    // 监控钱包交易
    async monitorWalletTransactions() {
      try {
        if (!web3) {
          throw new Error('区块链服务未初始化');
        }

        console.log('🔄 开始监控钱包交易...');

        // 先获取待处理的充值订单
        const pendingOrders = await strapi.entityService.findMany('api::recharge-order.recharge-order' as any, {
          filters: {
            status: 'pending',
            receiveAddress: walletAddress
          }
        });

        console.log(`📊 发现 ${pendingOrders.length} 个待处理充值订单`);

        if (pendingOrders.length === 0) {
          console.log('✅ 无待处理充值订单');
          return 0;
        }

        // 获取最新区块
        const latestBlock = Number(await web3.eth.getBlockNumber());
        
        // 从数据库获取上次检查的区块号，如果没有则从最近100个区块开始
        let lastCheckedBlock = Math.max(latestBlock - 100, 0);
        
        // 尝试从数据库获取上次检查的区块号
        try {
          const config = await strapi.entityService.findMany('api::system-config.system-config' as any, {
            filters: { key: 'last_checked_block' }
          });
          if (config && config.length > 0) {
            lastCheckedBlock = Math.max(parseInt(config[0].value) || lastCheckedBlock, 0);
          }
        } catch (error) {
          console.log('⚠️ 无法获取上次检查的区块号，使用默认值');
        }

        console.log(`📊 检查区块范围: ${lastCheckedBlock} - ${latestBlock}`);

        // 构建精确的topics过滤
        const TRANSFER_TOPIC = web3.utils.sha3('Transfer(address,address,uint256)')!;
        
        function addrTopic(address: string) {
          // 32-byte, 左填 0
          return '0x' + address.toLowerCase().slice(2).padStart(64, '0');
        }

        const toTopic = addrTopic(walletAddress); // 充值：to = 我方钱包

        console.log(`🎯 使用精确过滤 - 钱包地址: ${walletAddress}`);
        console.log(`🎯 钱包Topic: ${toTopic}`);
        console.log(`🎯 Transfer Topic: ${TRANSFER_TOPIC}`);

        // 基础查询参数
        const baseParams = {
          address: USDT_CONTRACT_ADDRESS,
          topics: [TRANSFER_TOPIC, null, toTopic], // topics[2] = to
        };

        // 指数退避扫描循环
        const isPaidNode = true; // 强制使用付费节点配置
        const INITIAL_STEP = isPaidNode ? 200 : 50;  // Ankr节点可以用更大的步长
        const MAX_STEP = isPaidNode ? 500 : 200;     // Ankr节点最大步长更大
        const LOG_LIMIT = isPaidNode ? 45000 : 9500; // Ankr节点日志限制更高
        
        console.log(`⚙️ 查询配置 - 付费节点: ${isPaidNode ? '是' : '否'}, 初始步长: ${INITIAL_STEP}, 日志限制: ${LOG_LIMIT}`);
        
        let step = INITIAL_STEP;
        let cursor = lastCheckedBlock;
        let processedCount = 0;

        while (cursor <= latestBlock) {
          const end = Math.min(cursor + step - 1, latestBlock);

          try {
            console.log(`🔍 查询区块 ${cursor} - ${end} (步长: ${step})`);
            
            const logs = await this.getLogsPaged({ 
              ...baseParams, 
              fromBlock: cursor, 
              toBlock: end 
            }, LOG_LIMIT);

            console.log(`📊 区块 ${cursor}-${end} 发现 ${logs.length} 笔到账交易`);

            // 处理每笔到账交易
            for (const tx of logs) {
              await this.processIncomingTransaction(tx);
              processedCount++;
            }

            // 成功 -> 光标前进，步长放大
            cursor = end + 1;
            step = Math.min(step * 2, MAX_STEP);
            
          } catch (err: any) {
            if (err?.code === -32005) {
              step = Math.max(Math.floor(step / 2), 1); // 步长减半，但内部仍会再二分
              console.log(`⏳ 遇到limit exceeded，缩小步长到 ${step}，等待1秒后重试...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
              console.error(`❌ 查询区块 ${cursor}-${end} 失败:`, err.message);
              cursor = end + 1; // 跳过当前区块段
              step = INITIAL_STEP; // 重置步长
            }
          }
          
          // 添加小延迟，避免请求过于频繁
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 最后把最新cursor写回DB
        await this.updateLastCheckedBlock(cursor);

        console.log(`✅ 监控完成，处理了 ${processedCount} 笔交易`);
        return processedCount;
        
      } catch (error) {
        console.error('❌ 监控钱包交易失败:', error);
        return 0;
      }
    },

    // 更新最后检查的区块号
    async updateLastCheckedBlock(blockNumber: number) {
      try {
        // 查找或创建系统配置
        const configs = await strapi.entityService.findMany('api::system-config.system-config' as any, {
          filters: { key: 'last_checked_block' }
        });
        
        if (configs && configs.length > 0) {
          await strapi.entityService.update('api::system-config.system-config' as any, configs[0].id, {
            data: { value: blockNumber.toString() }
          });
        } else {
          await strapi.entityService.create('api::system-config.system-config' as any, {
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
        await strapi.entityService.create('api::system-config.system-config' as any, {
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

    // 处理到账交易
    async processIncomingTransaction(tx: any) {
      try {
        if (!web3) {
          throw new Error('区块链服务未初始化');
        }

        // 解析交易数据
        const decodedData = web3.eth.abi.decodeLog([
          {
            type: 'address',
            name: 'from',
            indexed: true
          },
          {
            type: 'address',
            name: 'to',
            indexed: true
          },
          {
            type: 'uint256',
            name: 'value'
          }
        ], tx.data, [tx.topics[1], tx.topics[2]]);

        const fromAddress = decodedData.from;
        // 使用动态decimals而不是硬编码1e18
        const rawValue = decodedData.value as string;
        const decimals = await usdtContract.methods.decimals().call();
        const base = new Decimal(10).pow(decimals);
        const amount = new Decimal(rawValue).dividedBy(base).toString();
        const txHash = tx.transactionHash;

        console.log(`💰 收到转账: ${amount} USDT from ${fromAddress}, tx: ${txHash}`);

        // 查找匹配的充值订单 - 只查找最近24小时内的订单
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const orders = await strapi.entityService.findMany('api::recharge-order.recharge-order' as any, {
          filters: {
            status: 'pending',
            receiveAddress: walletAddress,
            createdAt: { $gte: oneDayAgo }
          },
          populate: ['user'], // 包含user关系
          sort: { createdAt: 'desc' } // 按创建时间倒序，优先匹配最新订单
        });

        for (const order of orders) {
          const orderAmount = parseFloat(order.amount);
          const txAmount = parseFloat(amount);
          
          // 检查金额是否匹配（允许0.01的误差）
          if (Math.abs(orderAmount - txAmount) <= 0.01) {
            console.log(`🎯 匹配到订单: ${order.orderNo}, 用户: ${order.user.id}, 创建时间: ${order.createdAt}`);
            await this.completeRechargeOrder(order, txHash, amount);
            break;
          }
        }
      } catch (error) {
        console.error('❌ 处理到账交易失败:', error);
      }
    },

    // 完成充值订单
    async completeRechargeOrder(order: any, txHash: string, amount: string) {
      try {
        if (!web3) {
          throw new Error('区块链服务未初始化');
        }

        console.log(`✅ 匹配充值订单: ${order.orderNo}, 金额: ${amount} USDT`);
        console.log(`🔍 订单对象:`, JSON.stringify(order, null, 2));

        // 验证订单对象
        if (!order || !order.id) {
          console.error('❌ 订单对象无效，缺少id字段');
          return;
        }

        // 更新订单状态
        await strapi.entityService.update('api::recharge-order.recharge-order' as any, order.id, {
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
        const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
          filters: { user: { id: order.user.id } }
        });

        const wallet = wallets[0];
        if (wallet) {
          const currentBalance = parseFloat(wallet.usdtYue || '0');
          const newBalance = currentBalance + parseFloat(amount);

          await strapi.entityService.update('api::qianbao-yue.qianbao-yue', wallet.id, {
            data: {
              usdtYue: newBalance.toString()
            }
          });

          console.log(`✅ 用户 ${order.user.id} 余额更新: ${currentBalance} → ${newBalance} USDT`);
          
          // 发送充值成功推送通知
          try {
            const pushNotificationService = strapi.service('api::push-notification.push-notification');
            await pushNotificationService.sendToUser(order.user.id, 
              '充值成功', 
              `您的账户已成功充值${amount}USDT，当前余额${newBalance}USDT`
            );
            console.log(`📱 充值成功推送已发送给用户 ${order.user.id}`);
          } catch (error) {
            console.error('❌ 发送充值成功推送失败:', error);
          }
        } else {
          console.warn(`⚠️ 未找到用户 ${order.user.id} 的钱包记录`);
        }
      } catch (error) {
        console.error('❌ 完成充值订单失败:', error);
      }
    },

    // 执行提现转账
    async executeWithdrawal(order: any) {
      try {
        if (!web3 || !usdtContract) {
          throw new Error('区块链服务未初始化');
        }

        if (!privateKey) {
          throw new Error('私钥未配置，无法执行转账');
        }

        console.log(`🔄 执行提现转账: ${order.orderNo}, 金额: ${order.actualAmount} USDT`);

        // 检查钱包USDT余额
        const walletBalance = await this.getTokenBalance('USDT');
        const requiredAmount = parseFloat(order.actualAmount);
        const currentBalance = parseFloat(walletBalance);

        if (currentBalance < requiredAmount) {
          const errorMsg = `钱包USDT余额不足: 需要 ${requiredAmount} USDT, 当前余额 ${currentBalance} USDT`;
          console.error(`❌ ${errorMsg}`);
          
          // 更新订单状态为失败
          await strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
            data: {
              status: 'failed',
              processTime: new Date(),
              remark: errorMsg
            }
          });
          
          throw new Error(errorMsg);
        }

        // 更新订单状态为处理中
        await strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
          data: {
            status: 'processing',
            processTime: new Date()
          }
        });

        // 准备转账数据 - 使用动态decimals
        const decimals = await usdtContract.methods.decimals().call();
        const base = new Decimal(10).pow(decimals);
        const amountInSmallestUnit = new Decimal(order.actualAmount).mul(base);
        
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
        await strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
          data: {
            status: 'completed',
            txHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            confirmations: 1,
            completedTime: new Date()
          }
        });

        console.log(`✅ 提现转账完成: ${order.orderNo}, tx: ${receipt.transactionHash}`);
        
        // 发送提现成功推送通知
        try {
          const pushNotificationService = strapi.service('api::push-notification.push-notification');
          await pushNotificationService.sendToUser(order.user.id,
            '提现成功',
            `您的${order.currency}提现已成功，金额${order.actualAmount}${order.currency}`
          );
          console.log(`📱 提现成功推送已发送给用户 ${order.user.id}`);
        } catch (error) {
          console.error('❌ 发送提现成功推送失败:', error);
        }
        
        return receipt.transactionHash;
      } catch (error) {
        console.error('❌ 执行提现转账失败:', error);
        
        // 如果订单状态还不是failed，则更新为失败
        const currentOrder = await strapi.entityService.findOne('api::withdrawal-order.withdrawal-order' as any, order.id);
        if (currentOrder && currentOrder.status !== 'failed') {
          await strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
            data: {
              status: 'failed',
              processTime: new Date(),
              remark: error.message
            }
          });
        }
        
        throw error;
      }
    },

    // 处理待处理的提现订单
    async processPendingWithdrawals() {
      try {
        console.log('🔄 处理待处理的提现订单...');

        const orders = await strapi.entityService.findMany('api::withdrawal-order.withdrawal-order' as any, {
          filters: {
            status: 'pending'
          }
        });

        console.log(`📊 发现 ${orders.length} 个待处理提现订单`);

        for (const order of orders) {
          try {
            // 根据订单的currency字段决定使用哪种转账方法
            if (order.currency === 'USDT') {
              await this.executeWithdrawal(order);
            } else if (order.currency === 'ADA') {
              await this.executeAdaWithdrawal(order);
            } else if (order.currency === 'LINK') {
              await this.executeLinkWithdrawal(order);
            } else if (order.currency === 'SHIB') {
              await this.executeShibWithdrawal(order);
            } else {
              console.warn(`⚠️ 不支持的代币类型: ${order.currency}`);
            }
            
            // 等待5秒再处理下一个，避免频率过高
            await new Promise(resolve => setTimeout(resolve, 5000));
          } catch (error) {
            console.error(`❌ 处理提现订单 ${order.orderNo} 失败:`, error);
          }
        }

        return orders.length;
      } catch (error) {
        console.error('❌ 处理提现订单失败:', error);
        return 0;
      }
    },

    // 执行ADA提现转账
    async executeAdaWithdrawal(order: any) {
      try {
        if (!web3 || !adaContract) {
          throw new Error('区块链服务未初始化');
        }

        if (!privateKey) {
          throw new Error('私钥未配置，无法执行转账');
        }

        console.log(`🔄 执行ADA提现转账: ${order.orderNo}, 金额: ${order.actualAmount} ADA`);

        // 检查钱包ADA余额
        const walletBalance = await this.getTokenBalance('ADA');
        const requiredAmount = parseFloat(order.actualAmount);
        const currentBalance = parseFloat(walletBalance);

        if (currentBalance < requiredAmount) {
          const errorMsg = `钱包ADA余额不足: 需要 ${requiredAmount} ADA, 当前余额 ${currentBalance} ADA`;
          console.error(`❌ ${errorMsg}`);
          
          // 更新订单状态为失败
          await strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
            data: {
              status: 'failed',
              processTime: new Date(),
              remark: errorMsg
            }
          });
          
          throw new Error(errorMsg);
        }

        // 更新订单状态为处理中
        await strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
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
        await strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
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
          const pushNotificationService = strapi.service('api::push-notification.push-notification');
          await pushNotificationService.sendToUser(order.user.id,
            '提现成功',
            `您的${order.currency}提现已成功，金额${order.actualAmount}${order.currency}`
          );
          console.log(`📱 提现成功推送已发送给用户 ${order.user.id}`);
        } catch (error) {
          console.error('❌ 发送提现成功推送失败:', error);
        }
        
        return receipt.transactionHash;
      } catch (error) {
        console.error('❌ 执行ADA提现转账失败:', error);
        
        // 回滚aiYue余额（提现失败时恢复用户余额）
        try {
          // 直接通过用户ID查找钱包，避免关联查询问题
          const wallets = await strapi.db.query('api::qianbao-yue.qianbao-yue').findMany({
            where: { user: order.user }
          });
          
          if (wallets && wallets.length > 0) {
            const wallet = wallets[0];
            const currentAiYue = new Decimal(wallet.aiYue || '0');
            
            // 使用订单中记录的USDT价值进行回滚
            const rollbackAmount = new Decimal(order.deductedUsdtValue || '0');
            const newAiYue = currentAiYue.plus(rollbackAmount);
            
            await strapi.db.query('api::qianbao-yue.qianbao-yue').update({
              where: { id: wallet.id },
              data: {
                aiYue: newAiYue.toString()
              }
            });
            
            console.log(`🔄 回滚ADA提现失败: 恢复 ${rollbackAmount.toString()} USDT, 新余额: ${newAiYue.toString()}`);
          }
        } catch (rollbackError) {
          console.error('❌ 回滚aiYue余额失败:', rollbackError);
        }
        
        // 如果订单状态还不是failed，则更新为失败
        const currentOrder = await strapi.entityService.findOne('api::withdrawal-order.withdrawal-order' as any, order.id);
        if (currentOrder && currentOrder.status !== 'failed') {
          await strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
            data: {
              status: 'failed',
              processTime: new Date(),
              remark: error.message
            }
          });
        }
        
        throw error;
      }
    },



    // 执行LINK提现转账
    async executeLinkWithdrawal(order: any) {
      try {
        if (!web3 || !linkContract) {
          throw new Error('区块链服务未初始化');
        }

        if (!privateKey) {
          throw new Error('私钥未配置，无法执行转账');
        }

        console.log(`🔄 执行LINK提现转账: ${order.orderNo}, 金额: ${order.actualAmount} LINK`);

        // 更新订单状态为处理中
        await strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
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
        await strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
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
          const pushNotificationService = strapi.service('api::push-notification.push-notification');
          await pushNotificationService.sendToUser(order.user.id,
            '提现成功',
            `您的${order.currency}提现已成功，金额${order.actualAmount}${order.currency}`
          );
          console.log(`📱 提现成功推送已发送给用户 ${order.user.id}`);
        } catch (error) {
          console.error('❌ 发送提现成功推送失败:', error);
        }
        
        return receipt.transactionHash;
      } catch (error) {
        console.error('❌ 执行LINK提现转账失败:', error);
        
        // 回滚aiYue余额（提现失败时恢复用户余额）
        try {
          // 直接通过用户ID查找钱包，避免关联查询问题
          const wallets = await strapi.db.query('api::qianbao-yue.qianbao-yue').findMany({
            where: { user: order.user }
          });
          
          if (wallets && wallets.length > 0) {
            const wallet = wallets[0];
            const currentAiYue = new Decimal(wallet.aiYue || '0');
            
            // 使用订单中记录的USDT价值进行回滚
            const rollbackAmount = new Decimal(order.deductedUsdtValue || '0');
            const newAiYue = currentAiYue.plus(rollbackAmount);
            
            await strapi.db.query('api::qianbao-yue.qianbao-yue').update({
              where: { id: wallet.id },
              data: {
                aiYue: newAiYue.toString()
              }
            });
            
            console.log(`🔄 回滚LINK提现失败: 恢复 ${rollbackAmount.toString()} USDT, 新余额: ${newAiYue.toString()}`);
          }
        } catch (rollbackError) {
          console.error('❌ 回滚aiYue余额失败:', rollbackError);
        }
        
        // 如果订单状态还不是failed，则更新为失败
        const currentOrder = await strapi.entityService.findOne('api::withdrawal-order.withdrawal-order' as any, order.id);
        if (currentOrder && currentOrder.status !== 'failed') {
          await strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
            data: {
              status: 'failed',
              processTime: new Date(),
              remark: error.message
            }
          });
        }
        
        throw error;
      }
    },

    // 执行SHIB提现转账
    async executeShibWithdrawal(order: any) {
      try {
        if (!web3 || !shibContract) {
          throw new Error('区块链服务未初始化');
        }

        if (!privateKey) {
          throw new Error('私钥未配置，无法执行转账');
        }

        console.log(`🔄 执行SHIB提现转账: ${order.orderNo}, 金额: ${order.actualAmount} SHIB`);

        // 更新订单状态为处理中
        await strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
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
        await strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
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
          const pushNotificationService = strapi.service('api::push-notification.push-notification');
          await pushNotificationService.sendToUser(order.user.id,
            '提现成功',
            `您的${order.currency}提现已成功，金额${order.actualAmount}${order.currency}`
          );
          console.log(`📱 提现成功推送已发送给用户 ${order.user.id}`);
        } catch (error) {
          console.error('❌ 发送提现成功推送失败:', error);
        }
        
        return receipt.transactionHash;
      } catch (error) {
        console.error('❌ 执行SHIB提现转账失败:', error);
        
        // 回滚aiYue余额（提现失败时恢复用户余额）
        try {
          // 直接通过用户ID查找钱包，避免关联查询问题
          const wallets = await strapi.db.query('api::qianbao-yue.qianbao-yue').findMany({
            where: { user: order.user }
          });
          
          if (wallets && wallets.length > 0) {
            const wallet = wallets[0];
            const currentAiYue = new Decimal(wallet.aiYue || '0');
            
            // 使用订单中记录的USDT价值进行回滚
            const rollbackAmount = new Decimal(order.deductedUsdtValue || '0');
            const newAiYue = currentAiYue.plus(rollbackAmount);
            
            await strapi.db.query('api::qianbao-yue.qianbao-yue').update({
              where: { id: wallet.id },
              data: {
                aiYue: newAiYue.toString()
              }
            });
            
            console.log(`🔄 回滚SHIB提现失败: 恢复 ${rollbackAmount.toString()} USDT, 新余额: ${newAiYue.toString()}`);
          }
        } catch (rollbackError) {
          console.error('❌ 回滚aiYue余额失败:', rollbackError);
        }
        
        // 如果订单状态还不是failed，则更新为失败
        const currentOrder = await strapi.entityService.findOne('api::withdrawal-order.withdrawal-order' as any, order.id);
        if (currentOrder && currentOrder.status !== 'failed') {
          await strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
            data: {
              status: 'failed',
              processTime: new Date(),
              remark: error.message
            }
          });
        }
        
        throw error;
      }
    }
  };
};