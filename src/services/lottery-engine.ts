import Decimal from 'decimal.js';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';

export default ({ strapi }) => ({
  // Redis客户端（用于并发控制）
  redis: new Redis(process.env.REDIS_URL || 'redis://localhost:6379'),

  // 概率引擎 - 支持AB测试灰度概率
  async calculateProbability(prize: any, userId: number): Promise<number> {
    try {
      // 检查是否启用AB测试
      if (prize.probability_test !== null && prize.probability_test !== undefined) {
        // 简单的AB测试逻辑：根据用户ID决定使用哪个概率
        const isTestGroup = userId % 2 === 0; // 简单的分组逻辑
        return isTestGroup ? prize.probability_test : prize.zhongJiangLv;
      }
      
      return prize.zhongJiangLv;
    } catch (error) {
      console.error('概率计算失败:', error);
      return prize.zhongJiangLv || 1.0;
    }
  },

  // 从奖品池中随机选择奖品（轮盘式选择）
  async selectRandomPrize(groupId?: number): Promise<any> {
    try {
      const filters: any = {
        kaiQi: true,
        $or: [
          { maxQuantity: 0 }, // 无限制数量
          { currentQuantity: { $lt: { $ref: 'maxQuantity' } } } // 当前数量小于最大数量
        ]
      };

      // 如果指定了奖池组，则只从该组选择
      if (groupId) {
        filters.group = { id: groupId };
      }

      // 检查奖品有效期
      const now = new Date();
      filters.$or.push(
        { validUntil: null },
        { validUntil: { $gt: now } }
      );

      const availablePrizes = await strapi.entityService.findMany('api::choujiang-jiangpin.choujiang-jiangpin' as any, {
        filters,
        sort: { paiXuShunXu: 'asc' }
      }) as any[];

      if (availablePrizes.length === 0) {
        throw new Error('暂无可用的抽奖奖品');
      }

      console.log(`可用奖品数量: ${availablePrizes.length}`);

      // 检查是否所有奖品都是100%中奖概率
      const all100Percent = availablePrizes.every(prize => 
        new Decimal(prize.zhongJiangLv || 0).toNumber() >= 100
      );

      if (all100Percent) {
        // 轮盘式随机选择：所有奖品都是100%概率时，随机选择一个
        const randomIndex = Math.floor(Math.random() * availablePrizes.length);
        const selectedPrize = availablePrizes[randomIndex];
        console.log(`轮盘式选择: 选中奖品 ${selectedPrize.name}, 索引: ${randomIndex}/${availablePrizes.length}`);
        return selectedPrize;
      }

      // 传统概率式选择（当不是所有奖品都是100%时）
      console.log('使用传统概率式选择');
      
      // 计算总概率
      const totalProbability = availablePrizes.reduce((sum, prize) => {
        const probability = new Decimal(prize.zhongJiangLv || 0).toNumber();
        return sum + probability;
      }, 0);

      console.log(`总概率: ${totalProbability}%`);

      // 生成随机数 (0 到总概率)
      const random = Math.random() * totalProbability;
      console.log(`随机数: ${random}`);

      // 根据概率选择奖品
      let cumulativeProbability = 0;
      for (const prize of availablePrizes) {
        const prizeProbability = new Decimal(prize.zhongJiangLv || 0).toNumber();
        cumulativeProbability += prizeProbability;
        
        if (random <= cumulativeProbability) {
          console.log(`选中奖品: ${prize.name}, 概率: ${prize.zhongJiangLv}%`);
          return prize;
        }
      }

      // 保底机制：如果没有选中任何奖品，返回概率最高的奖品
      const highestProbabilityPrize = availablePrizes.reduce((highest, current) => {
        const currentProb = new Decimal(current.zhongJiangLv || 0).toNumber();
        const highestProb = new Decimal(highest.zhongJiangLv || 0).toNumber();
        return currentProb > highestProb ? current : highest;
      });

      console.log(`保底奖品: ${highestProbabilityPrize.name}`);
      return highestProbabilityPrize;
    } catch (error) {
      console.error('选择随机奖品失败:', error);
      throw error;
    }
  },

  // 并发安全的库存扣减
  async decrementStock(prizeId: number): Promise<boolean> {
    const lockKey = `lottery:stock:${prizeId}`;
    
    try {
      // 使用Redis Lua脚本确保原子性
      const luaScript = `
        local key = KEYS[1]
        local current = redis.call('GET', key)
        if current and tonumber(current) > 0 then
          redis.call('DECR', key)
          return 1
        else
          return 0
        end
      `;

      const result = await this.redis.eval(luaScript, 1, lockKey);
      return result === 1;
    } catch (error) {
      console.error('库存扣减失败:', error);
      return false;
    }
  },

  // 事务锁保护的抽奖流程
  async drawWithTransaction(userId: number, chanceId: number, ctx: any): Promise<any> {
    const traceId = uuidv4();
    
    try {
      console.log(`🎰 开始抽奖流程 - 用户ID: ${userId}, 机会ID: ${chanceId}, 追踪ID: ${traceId}`);
      
      // 1. 获取抽奖机会
      console.log('🔍 步骤1: 获取抽奖机会');
      const chance = await strapi.entityService.findOne('api::choujiang-jihui.choujiang-jihui' as any, chanceId, {
        populate: ['user']
      }) as any;

      if (!chance) {
        throw new Error('抽奖机会不存在');
      }

      console.log(`🔍 抽奖机会信息: ID=${chance.id}, 用户=${chance.user?.id}, 类型=${chance.type}, 已用=${chance.usedCount}/${chance.count}`);

      // 验证用户权限
      if (chance.user.id !== userId) {
        throw new Error('无权使用此抽奖机会');
      }

      // 检查机会是否有效
      if (!chance.isActive) {
        throw new Error('抽奖机会已失效');
      }

      // 检查有效期
      const beijingNow = new Date(Date.now() + 8 * 60 * 60 * 1000);
      if (chance.validUntil && beijingNow > new Date(chance.validUntil)) {
        throw new Error('抽奖机会已过期');
      }

      // 检查是否还有可用次数
      const availableCount = chance.count - (chance.usedCount || 0);
      if (availableCount <= 0) {
        throw new Error('抽奖机会已用完');
      }

      console.log(`✅ 抽奖机会验证通过，可用次数: ${availableCount}`);

      // 2. 选择奖品
      console.log('🔍 步骤2: 选择奖品');
      const selectedPrize = await this.selectRandomPrize();
      console.log(`✅ 选中奖品: ${selectedPrize.name}, 类型: ${selectedPrize.jiangpinType}, 概率: ${selectedPrize.zhongJiangLv}%`);
      
      // 3. 检查库存并扣减
      console.log('🔍 步骤3: 检查库存');
      if (selectedPrize.maxQuantity > 0) {
        const stockAvailable = await this.decrementStock(selectedPrize.id);
        if (!stockAvailable) {
          throw new Error('奖品库存不足，请稍后重试');
        }
        console.log(`✅ 库存扣减成功`);
      } else {
        console.log(`✅ 无限制库存，跳过库存检查`);
      }

      // 4. 判断是否中奖
      console.log('🔍 步骤4: 判断中奖');
      const winRate = new Decimal(selectedPrize.zhongJiangLv || 0).toNumber();
      let isWon = false;
      
      if (winRate >= 100) {
        // 100%中奖概率，直接中奖
        isWon = true;
        console.log(`✅ 100%中奖概率，直接中奖: ${selectedPrize.name}`);
      } else {
        // 按概率判断是否中奖
        const random = Math.random() * 100;
        isWon = random <= winRate;
        console.log(`🎲 抽奖结果: 随机数 ${random.toFixed(2)}, 中奖概率 ${winRate}%, 是否中奖: ${isWon}`);
      }

      // 5. 发放奖品
      if (isWon) {
        console.log('🔍 步骤5: 发放奖品');
        await this.grantPrize(userId, selectedPrize);
        console.log(`✅ 奖品发放成功`);
      } else {
        console.log(`✅ 未中奖，跳过奖品发放`);
      }

      // 6. 更新抽奖机会使用次数
      console.log('🔍 步骤6: 更新抽奖机会');
      await strapi.entityService.update('api::choujiang-jihui.choujiang-jihui' as any, chanceId, {
        data: { usedCount: (chance.usedCount || 0) + 1 }
      });
      console.log(`✅ 抽奖机会使用次数更新成功`);

      // 7. 记录抽奖记录
      console.log('🔍 步骤7: 创建抽奖记录');
      const recordData = {
        user: userId,
        jiangpin: selectedPrize.id,
        chance: chanceId,
        isWon: isWon,
        drawTime: new Date(),
        prizeValue: isWon ? selectedPrize.value : null,
        sourceType: chance.type,
        sourceOrder: chance.sourceOrder,
        ipAddress: ctx.request.ip,
        userAgent: ctx.request.headers['user-agent'],
        traceId: traceId,
        prizeSnapshot: JSON.stringify(selectedPrize),
        clientIp: ctx.request.ip
      };

      const record = await strapi.entityService.create('api::choujiang-ji-lu.choujiang-ji-lu' as any, {
        data: recordData
      });
      console.log(`✅ 抽奖记录创建成功，记录ID: ${record.id}`);

      // 8. 如果中奖，创建发货订单
      if (isWon) {
        console.log('🔍 步骤8: 创建发货订单');
        await this.createShippingOrder(record.id, selectedPrize);
        console.log(`✅ 发货订单创建成功`);
      } else {
        console.log(`✅ 跳过发货订单创建（未中奖）`);
      }

      console.log(`🎉 抽奖流程完成 - 用户: ${userId}, 中奖: ${isWon}, 奖品: ${selectedPrize.name}`);

      return {
        isWon: isWon,
        prize: isWon ? selectedPrize : null,
        remainingChances: availableCount - 1,
        traceId: traceId
      };
    } catch (error) {
      console.error(`❌ 抽奖流程失败 - 用户: ${userId}, 机会: ${chanceId}, 错误: ${error.message}`);
      console.error(`❌ 错误堆栈: ${error.stack}`);
      throw error;
    }
  },

  // 发放奖品
  async grantPrize(userId: number, prize: any): Promise<void> {
    try {
      // 确保用户有钱包（但不直接修改余额）
      let wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: { id: userId } }
      }) as any[];

      let userWallet;
      
      // 如果用户没有钱包，创建一个
      if (!wallets || wallets.length === 0) {
        console.log(`用户 ${userId} 没有钱包，创建新钱包`);
        userWallet = await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
          data: {
            user: userId,
            usdtYue: '0',
            aiYue: '0',
            totalRecharge: '0',
            totalWithdraw: '0'
          }
        });
      } else {
        userWallet = wallets[0];
      }

      // 根据奖品类型处理，但不直接修改钱包余额
      switch (prize.jiangpinType) {
        case 'usdt':
          // 创建USDT奖品记录，但不直接加到钱包余额
          console.log(`用户 ${userId} 获得 USDT 奖品: ${prize.value} USDT`);
          console.log(`注意：USDT奖品价值不直接加到钱包余额，避免影响累积收益计算`);
          break;

        case 'ai_token':
          // 创建AI代币奖品记录，但不直接加到钱包余额
          console.log(`用户 ${userId} 获得 AI代币 奖品: ${prize.value} USDT等值`);
          console.log(`注意：AI代币奖品价值不直接加到钱包余额，避免影响累积收益计算`);
          break;

        case 'physical':
        case 'virtual':
          console.log(`用户 ${userId} 获得 ${prize.jiangpinType} 奖品: ${prize.name}`);
          break;
          
        default:
          console.log(`用户 ${userId} 获得未知类型奖品: ${prize.jiangpinType} - ${prize.name}`);
          break;
      }
    } catch (error) {
      console.error('发放奖品失败:', error);
      throw error;
    }
  },

  // 创建发货订单
  async createShippingOrder(recordId: number, prize: any): Promise<void> {
    try {
      console.log(`创建发货订单 - 记录ID: ${recordId}, 奖品: ${prize.name}, 类型: ${prize.jiangpinType}`);
      
      // 检查是否为需要发货的实物奖品
      const virtualTypes = ['usdt', 'ai_token', 'token', 'coin', 'points', 'credits', 'virtual', 'digital'];
      const isVirtualPrize = virtualTypes.includes(prize.jiangpinType?.toLowerCase());
      
      if (isVirtualPrize) {
        console.log(`✅ 跳过发货订单创建 - 虚拟奖品: ${prize.name}`);
        return;
      }
      
      console.log(`📦 为实物奖品创建发货订单: ${prize.name}`);
      
      // 获取抽奖记录以获取用户ID
      const record = await strapi.entityService.findOne('api::choujiang-ji-lu.choujiang-ji-lu' as any, recordId, {
        populate: ['user']
      });
      
      if (!record || !record.user) {
        console.error('❌ 无法获取抽奖记录或用户信息');
        return;
      }
      
      const shippingOrderData = {
        record: recordId,
        user: record.user.id, // 直接关联用户
        status: 'pending',
        remark: `奖品: ${prize.name}`,
        receiverName: null, // 改为null，而不是"待填写"
        mobile: null,
        province: null,
        city: null,
        district: null,
        address: null,
        zipCode: null
      };

      const shippingOrder = await strapi.entityService.create('api::shipping-order.shipping-order' as any, {
        data: shippingOrderData
      });
      
      console.log(`✅ 发货订单创建成功 - 订单ID: ${shippingOrder.id}`);
    } catch (error) {
      console.error('❌ 创建发货订单失败:', error);
      throw error;
    }
  },

  // 库存预警检查
  async checkStockWarning(): Promise<void> {
    try {
      const lowStockPrizes = await strapi.entityService.findMany('api::choujiang-jiangpin.choujiang-jiangpin' as any, {
        filters: {
          kaiQi: true,
          maxQuantity: { $gt: 0 },
          currentQuantity: { $lt: 10 }
        }
      }) as any[];

      if (lowStockPrizes.length > 0) {
        // 发送钉钉预警
        await this.sendDingTalkWarning(lowStockPrizes);
      }
    } catch (error) {
      console.error('库存预警检查失败:', error);
    }
  },

  // 发送钉钉预警
  async sendDingTalkWarning(prizes: any[]): Promise<void> {
    try {
      const webhookUrl = process.env.DINGTALK_WEBHOOK_URL;
      if (!webhookUrl) return;

      const message = {
        msgtype: 'text',
        text: {
          content: `🎰 抽奖奖品库存预警\n\n${prizes.map(prize => 
            `• ${prize.name}: 库存 ${prize.currentQuantity}/${prize.maxQuantity}`
          ).join('\n')}`
        }
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
    } catch (error) {
      console.error('发送钉钉预警失败:', error);
    }
  },

  // 风控限流检查
  async checkRateLimit(ip: string): Promise<boolean> {
    const key = `lottery:ratelimit:${ip}`;
    const limit = 200; // 每小时200次
    const window = 3600; // 1小时

    try {
      const current = await this.redis.get(key);
      const count = current ? parseInt(current) : 0;

      if (count >= limit) {
        return false;
      }

      await this.redis.multi()
        .incr(key)
        .expire(key, window)
        .exec();

      return true;
    } catch (error) {
      console.error('限流检查失败:', error);
      return true; // 出错时允许通过
    }
  }
}); 