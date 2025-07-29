import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

// USDT合约ABI（简化版）
const USDT_ABI: AbiItem[] = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
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

export default ({ strapi }) => {
  let web3: Web3 | null = null;
  let usdtContract: any = null;
  let walletAddress: string = '';
  let privateKey: string = '';

  return {
    // 初始化Web3连接
    async initialize() {
      try {
        // 连接到BSC节点
        web3 = new Web3('https://bsc-dataseed.binance.org/');
        
        // 设置钱包地址和私钥（从环境变量获取）
        walletAddress = process.env.BSC_WALLET_ADDRESS || '0xe3353f75d68f9096aC4A49b4968e56b5DFbd2697';
        privateKey = process.env.BSC_PRIVATE_KEY || '';
        
        if (!privateKey) {
          console.warn('⚠️ BSC私钥未配置，转账功能将不可用');
        }

        // 初始化USDT合约
        usdtContract = new web3.eth.Contract(USDT_ABI, USDT_CONTRACT_ADDRESS);
        
        console.log('✅ 区块链服务初始化成功');
        console.log(`📧 钱包地址: ${walletAddress}`);
        
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

        const balance = await usdtContract.methods.balanceOf(walletAddress).call();
        const balanceInEth = web3.utils.fromWei(balance, 'ether');
        
        console.log(`💰 钱包USDT余额: ${balanceInEth}`);
        return balanceInEth;
      } catch (error) {
        console.error('❌ 获取钱包余额失败:', error);
        return '0';
      }
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
        const latestBlock = await web3.eth.getBlockNumber();
        
        // 从数据库获取上次检查的区块号，如果没有则从最近100个区块开始
        let lastCheckedBlock = latestBlock - 100;
        
        // 尝试从数据库获取上次检查的区块号
        try {
          const config = await strapi.entityService.findMany('api::system-config.system-config' as any, {
            filters: { key: 'last_checked_block' }
          });
          if (config && config.length > 0) {
            lastCheckedBlock = parseInt(config[0].value) || lastCheckedBlock;
          }
        } catch (error) {
          console.log('⚠️ 无法获取上次检查的区块号，使用默认值');
        }

        console.log(`📊 检查区块范围: ${lastCheckedBlock} - ${latestBlock}`);

        // 分段查询，每次查询100个区块
        const STEP = 100;
        let fromBlock = lastCheckedBlock;
        let processedCount = 0;

        while (fromBlock < latestBlock) {
          const toBlock = Math.min(fromBlock + STEP, latestBlock);
          
          try {
            console.log(`🔍 查询区块 ${fromBlock} - ${toBlock}`);
            
            const logs = await web3.eth.getPastLogs({
              address: USDT_CONTRACT_ADDRESS,
              fromBlock: fromBlock,
              toBlock: toBlock,
              topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
              ]
            });

            console.log(`📊 区块 ${fromBlock}-${toBlock} 发现 ${logs.length} 笔USDT转账`);

            // 过滤出到我们钱包的交易
            const incomingTransactions = logs.filter((tx: any) => {
              if (tx.topics && tx.topics.length >= 3) {
                const toAddress = '0x' + tx.topics[2].slice(26);
                return toAddress.toLowerCase() === walletAddress.toLowerCase();
              }
              return false;
            });

            if (incomingTransactions.length > 0) {
              console.log(`💰 区块 ${fromBlock}-${toBlock} 发现 ${incomingTransactions.length} 笔到账交易`);
              
              // 处理每笔到账交易
              for (const tx of incomingTransactions) {
                await this.processIncomingTransaction(tx);
                processedCount++;
              }
            }

            // 更新最后检查的区块号
            await this.updateLastCheckedBlock(toBlock);
            
          } catch (error) {
            console.error(`❌ 查询区块 ${fromBlock}-${toBlock} 失败:`, error.message);
            
            // 如果是limit exceeded错误，等待后重试
            if (error.message.includes('limit exceeded')) {
              console.log('⏳ 遇到limit exceeded，等待2秒后重试...');
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              // 减少查询范围重试
              const smallerStep = Math.floor(STEP / 2);
              const retryToBlock = Math.min(fromBlock + smallerStep, latestBlock);
              
              try {
                console.log(`🔄 重试查询区块 ${fromBlock} - ${retryToBlock}`);
                const retryLogs = await web3.eth.getPastLogs({
                  address: USDT_CONTRACT_ADDRESS,
                  fromBlock: fromBlock,
                  toBlock: retryToBlock,
                  topics: [
                    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
                  ]
                });
                
                const retryIncoming = retryLogs.filter((tx: any) => {
                  if (tx.topics && tx.topics.length >= 3) {
                    const toAddress = '0x' + tx.topics[2].slice(26);
                    return toAddress.toLowerCase() === walletAddress.toLowerCase();
                  }
                  return false;
                });
                
                for (const tx of retryIncoming) {
                  await this.processIncomingTransaction(tx);
                  processedCount++;
                }
                
                await this.updateLastCheckedBlock(retryToBlock);
                fromBlock = retryToBlock + 1;
                continue;
              } catch (retryError) {
                console.error(`❌ 重试失败，跳过区块 ${fromBlock}-${retryToBlock}`);
                fromBlock = retryToBlock + 1;
                continue;
              }
            }
          }
          
          fromBlock = toBlock + 1;
          
          // 添加小延迟，避免请求过于频繁
          await new Promise(resolve => setTimeout(resolve, 100));
        }

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
        const amount = web3.utils.fromWei(decodedData.value as string, 'ether'); // 类型断言为string
        const txHash = tx.transactionHash;

        console.log(`💰 收到转账: ${amount} USDT from ${fromAddress}, tx: ${txHash}`);

        // 查找匹配的充值订单
        const orders = await strapi.entityService.findMany('api::recharge-order.recharge-order' as any, {
          filters: {
            status: 'pending',
            receiveAddress: walletAddress
          }
        });

        for (const order of orders) {
          const orderAmount = parseFloat(order.amount);
          const txAmount = parseFloat(amount);
          
          // 检查金额是否匹配（允许0.01的误差）
          if (Math.abs(orderAmount - txAmount) <= 0.01) {
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

        // 更新订单状态为处理中
        await strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
          data: {
            status: 'processing',
            processTime: new Date()
          }
        });

        // 准备转账数据
        const amountInWei = web3.utils.toWei(order.actualAmount, 'ether');
        
        // 创建转账交易
        const tx = {
          from: walletAddress,
          to: USDT_CONTRACT_ADDRESS,
          data: usdtContract.methods.transfer(order.withdrawAddress, amountInWei).encodeABI(),
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
        return receipt.transactionHash;
      } catch (error) {
        console.error('❌ 执行提现转账失败:', error);
        
        // 更新订单状态为失败
        await strapi.entityService.update('api::withdrawal-order.withdrawal-order' as any, order.id, {
          data: {
            status: 'failed',
            processTime: new Date()
          }
        });
        
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
            await this.executeWithdrawal(order);
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
    }
  };
};