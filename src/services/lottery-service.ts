import { Strapi } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default ({ strapi }: { strapi: Strapi }) => ({
  // 赠送抽奖机会
  async giveChance(params: {
    userId: number;
    jiangpinId: number;
    count: number;
    reason?: string;
    type?: string;
    sourceOrderId?: number;
    validUntil?: Date;
  }) {
    try {
      const { userId, jiangpinId, count, reason, type, sourceOrderId, validUntil } = params;

      // 验证输入
      if (!userId || !jiangpinId || !count || count <= 0) {
        throw new Error('参数不完整或无效');
      }

      // 检查奖品是否存在且可用
      const prize = await strapi.entityService.findOne('api::choujiang-jiangpin.choujiang-jiangpin' as any, jiangpinId);
      if (!prize || !(prize as any).kaiQi) {
        throw new Error('奖品不存在或已停用');
      }

      // 检查库存
      if ((prize as any).maxQuantity > 0 && ((prize as any).currentQuantity || 0) >= (prize as any).maxQuantity) {
        throw new Error('奖品库存不足');
      }

      // 创建抽奖机会记录
      const chanceData = {
        user: userId,
        jiangpin: jiangpinId,
        count: count,
        usedCount: 0,
        reason: reason || '系统赠送',
        type: type || 'other',
        isActive: true,
        validUntil: validUntil || null,
        sourceOrder: sourceOrderId || null
      };

      const chance = await strapi.entityService.create('api::choujiang-jihui.choujiang-jihui' as any, {
        data: chanceData
      });

      console.log(`用户 ${userId} 获得 ${count} 次抽奖机会，奖品: ${(prize as any).name}`);

      return {
        success: true,
        data: chance,
        message: '赠送抽奖机会成功'
      };
    } catch (error) {
      console.error('赠送抽奖机会失败:', error);
      throw error;
    }
  },

  // 执行抽奖
  async performDraw(params: {
    userId: number;
    chanceId: number;
  }) {
    try {
      const { userId, chanceId } = params;

      // 获取抽奖机会
      const chance = await strapi.entityService.findOne('api::choujiang-jihui.choujiang-jihui' as any, chanceId, {
        populate: ['jiangpin', 'user']
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

      // 检查有效期（使用北京时间）
      const beijingNow = new Date(Date.now() + 8 * 60 * 60 * 1000); // 北京时间 UTC+8
      if (chance.validUntil && beijingNow > new Date(chance.validUntil)) {
        throw new Error('抽奖机会已过期');
      }

      // 检查是否还有可用次数
      const availableCount = chance.count - (chance.usedCount || 0);
      if (availableCount <= 0) {
        throw new Error('抽奖机会已用完');
      }

      // 获取奖品信息
      const prize = chance.jiangpin;
      if (!prize || !prize.kaiQi) {
        throw new Error('奖品已停用');
      }

      // 检查库存
      if (prize.maxQuantity > 0 && (prize.currentQuantity || 0) >= prize.maxQuantity) {
        throw new Error('奖品库存不足');
      }

      // 执行抽奖逻辑
      const winRate = new Decimal(prize.zhongJiangLv || 1);
      const random = Math.random() * 100;
      const isWon = random <= winRate.toNumber();
      
      if (isWon) {
        // 中奖：发放奖品
        await this.grantPrize(userId, prize);
        
        // 更新奖品库存
        if (prize.maxQuantity > 0) {
          await strapi.entityService.update('api::choujiang-jiangpin.choujiang-jiangpin' as any, prize.id, {
            data: { currentQuantity: (prize.currentQuantity || 0) + 1 } as any as any as any
          });
        }
      }

      // 更新抽奖机会使用次数
      await strapi.entityService.update('api::choujiang-jihui.choujiang-jihui' as any, chanceId, {
        data: { usedCount: (chance.usedCount || 0) + 1 } as any as any as any
      });

      // 记录抽奖记录
      await this.recordDrawResult(userId, chance, prize, isWon);

      return {
        success: true,
        data: {
          isWon,
          prize: isWon ? prize : null,
          remainingChances: availableCount - 1
        },
        message: isWon ? '恭喜中奖！' : '很遗憾，未中奖'
      };
    } catch (error) {
      console.error('执行抽奖失败:', error);
      throw error;
    }
  },

  // 发放奖品
  async grantPrize(userId: number, prize: any) {
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
              data: { usdtYue: currentBalance.plus(prize.value).toString() } as any as any as any
            });
            console.log(`用户 ${userId} 获得 USDT 奖励: ${prize.value}`);
            break;

          case 'ai_token':
            const currentAiBalance = new Decimal(userWallet.aiYue || 0);
            await strapi.entityService.update('api::qianbao-yue.qianbao-yue', userWallet.id, {
              data: { aiYue: currentAiBalance.plus(prize.value).toString() } as any as any as any
            });
            console.log(`用户 ${userId} 获得 AI代币 奖励: ${prize.value}`);
            break;

          case 'physical':
          case 'virtual':
            // 这里可以添加实物奖品或虚拟奖品的发放逻辑
            console.log(`用户 ${userId} 获得 ${prize.jiangpinType} 奖品: ${prize.name}`);
            break;
        }
      }
    } catch (error) {
      console.error('发放奖品失败:', error);
      throw error;
    }
  },

  // 记录抽奖结果
  async recordDrawResult(userId: number, chance: any, prize: any, isWon: boolean) {
    try {
      // 创建抽奖记录
      const recordData = {
        user: userId,
        jiangpin: prize.id,
        chance: chance.id,
        isWon: isWon,
        drawTime: new Date(),
        prizeValue: isWon ? prize.value : null,
        sourceType: chance.type,
        sourceOrder: chance.sourceOrder,
        ipAddress: 'system', // 系统调用
        userAgent: 'system'
      };

      await strapi.entityService.create('api::choujiang-ji-lu.choujiang-ji-lu' as any, {
        data: recordData
      });

      console.log(`记录抽奖结果: 用户 ${userId}, 奖品 ${prize.name}, 中奖: ${isWon}`);
    } catch (error) {
      console.error('记录抽奖结果失败:', error);
      throw error;
    }
  }
}); 