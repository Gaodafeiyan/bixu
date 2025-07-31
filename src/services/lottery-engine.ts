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

  // 从奖品池中随机选择奖品（增强版）
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

      // 计算总概率
      const totalProbability = availablePrizes.reduce((sum, prize) => {
        return sum + new Decimal(prize.zhongJiangLv || 0).toNumber();
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
      // 1. 获取抽奖机会
      const chance = await strapi.entityService.findOne('api::choujiang-jihui.choujiang-jihui' as any, chanceId, {
        populate: ['user']
      }) as any;

      if (!chance) {
        throw new Error('抽奖机会不存在');
      }

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

      // 2. 选择奖品
      const selectedPrize = await this.selectRandomPrize();
      
      // 3. 检查库存并扣减
      if (selectedPrize.maxQuantity > 0) {
        const stockAvailable = await this.decrementStock(selectedPrize.id);
        if (!stockAvailable) {
          throw new Error('奖品库存不足，请稍后重试');
        }
      }

      // 4. 计算中奖概率
      const winRate = await this.calculateProbability(selectedPrize, userId);
      const random = Math.random() * 100;
      const isWon = random <= winRate;

      console.log(`抽奖结果: 随机数 ${random}, 中奖概率 ${winRate}%, 是否中奖: ${isWon}`);

      // 5. 发放奖品
      if (isWon) {
        await this.grantPrize(userId, selectedPrize);
      }

      // 6. 更新抽奖机会使用次数
      await strapi.entityService.update('api::choujiang-jihui.choujiang-jihui' as any, chanceId, {
        data: { usedCount: (chance.usedCount || 0) + 1 }
      });

      // 7. 记录抽奖记录
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

      // 8. 如果是实物奖品且中奖，创建发货订单
      if (isWon && selectedPrize.jiangpinType === 'physical') {
        await this.createShippingOrder(record.id, selectedPrize);
      }

      return {
        success: true,
        traceId: traceId,
        isWon: isWon,
        prize: isWon ? selectedPrize : null,
        remainingChances: availableCount - 1,
        recordId: record.id
      };

    } catch (error) {
      console.error('抽奖事务失败:', error);
      throw error;
    }
  },

  // 发放奖品
  async grantPrize(userId: number, prize: any): Promise<void> {
    try {
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: { id: userId } }
      }) as any[];

      if (wallets && wallets.length > 0) {
        const userWallet = wallets[0];

        switch (prize.jiangpinType) {
          case 'usdt':
            const currentBalance = new Decimal(userWallet.usdtYue || 0);
            await strapi.entityService.update('api::qianbao-yue.qianbao-yue', userWallet.id, {
              data: { usdtYue: currentBalance.plus(prize.value).toString() }
            });
            console.log(`用户 ${userId} 获得 USDT 奖励: ${prize.value}`);
            break;

          case 'ai_token':
            const currentAiBalance = new Decimal(userWallet.aiYue || 0);
            await strapi.entityService.update('api::qianbao-yue.qianbao-yue', userWallet.id, {
              data: { aiYue: currentAiBalance.plus(prize.value).toString() }
            });
            console.log(`用户 ${userId} 获得 AI代币 奖励: ${prize.value}`);
            break;

          case 'physical':
          case 'virtual':
            console.log(`用户 ${userId} 获得 ${prize.jiangpinType} 奖品: ${prize.name}`);
            break;
        }
      }
    } catch (error) {
      console.error('发放奖品失败:', error);
      throw error;
    }
  },

  // 创建发货订单
  async createShippingOrder(recordId: number, prize: any): Promise<void> {
    try {
      await strapi.entityService.create('api::shipping-order.shipping-order' as any, {
        data: {
          record: recordId,
          status: 'pending',
          remark: `奖品: ${prize.name}`
        }
      });
      console.log(`创建发货订单: 记录ID ${recordId}, 奖品 ${prize.name}`);
    } catch (error) {
      console.error('创建发货订单失败:', error);
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