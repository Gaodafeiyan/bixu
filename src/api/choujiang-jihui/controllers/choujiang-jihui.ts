import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreController('api::choujiang-jihui.choujiang-jihui' as any, ({ strapi }) => {
  // 从奖品池中随机选择奖品
  const selectRandomPrize = async () => {
    try {
      // 获取所有可用的奖品
      const availablePrizes = await strapi.entityService.findMany('api::choujiang-jiangpin.choujiang-jiangpin' as any, {
        filters: {
          kaiQi: true,
          $or: [
            { maxQuantity: 0 }, // 无限制数量
            { currentQuantity: { $lt: { $ref: 'maxQuantity' } } } // 当前数量小于最大数量
          ]
        },
        sort: { paiXuShunXu: 'asc' }
      }) as any[];

      if (availablePrizes.length === 0) {
        throw new Error('暂无可用的抽奖奖品');
      }

      console.log(`可用奖品数量: ${availablePrizes.length}`);
      availablePrizes.forEach(prize => {
        console.log(`奖品: ${prize.name}, 概率: ${prize.zhongJiangLv}%, 库存: ${prize.currentQuantity || 0}/${prize.maxQuantity || '无限制'}`);
      });

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
  };

  // 发放奖品
  const grantPrize = async (userId: any, prize: any) => {
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
            // 这里可以添加实物奖品或虚拟奖品的发放逻辑
            console.log(`用户 ${userId} 获得 ${prize.jiangpinType} 奖品: ${prize.name}`);
            break;
        }
      }
    } catch (error) {
      console.error('发放奖品失败:', error);
      throw error;
    }
  };

  // 记录抽奖结果
  const recordDrawResult = async (ctx: any, userId: any, chance: any, prize: any, isWon: boolean) => {
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
        ipAddress: ctx.request.ip,
        userAgent: ctx.request.headers['user-agent']
      };

      await strapi.entityService.create('api::choujiang-ji-lu.choujiang-ji-lu' as any, {
        data: recordData
      });

      console.log(`记录抽奖结果: 用户 ${userId}, 奖品 ${prize.name}, 中奖: ${isWon}`);
    } catch (error) {
      console.error('记录抽奖结果失败:', error);
      throw error;
    }
  };

  return {
    // 继承默认的find方法
    async find(ctx) {
      try {
        // 处理查询参数，将"me"替换为当前用户ID
        const query = { ...ctx.query };
        
        // 检查是否有filters[user][id]=me的情况
        if (query.filters && query.filters.user && query.filters.user.id === 'me') {
          if (ctx.state.user && ctx.state.user.id) {
            query.filters.user.id = ctx.state.user.id;
          } else {
            return ctx.unauthorized('用户未登录');
          }
        }
        
        const result = await strapi.entityService.findPage('api::choujiang-jihui.choujiang-jihui' as any, {
          ...query,
          populate: ['user', 'jiangpin']
        });
        return result;
      } catch (error) {
        console.error('获取抽奖机会列表失败:', error);
        ctx.throw(500, `获取抽奖机会列表失败: ${error.message}`);
      }
    },

    // 添加默认的findOne方法
    async findOne(ctx) {
      try {
        const { id } = ctx.params;
        const result = await strapi.entityService.findOne('api::choujiang-jihui.choujiang-jihui' as any, id, {
          populate: ['user', 'jiangpin']
        });
        return result;
      } catch (error) {
        console.error('获取抽奖机会详情失败:', error);
        ctx.throw(500, `获取抽奖机会详情失败: ${error.message}`);
      }
    },

    // 添加默认的create方法
    async create(ctx) {
      try {
        const { data } = ctx.request.body;
        const result = await strapi.entityService.create('api::choujiang-jihui.choujiang-jihui' as any, {
          data
        });
        return result;
      } catch (error) {
        console.error('创建抽奖机会失败:', error);
        ctx.throw(500, `创建抽奖机会失败: ${error.message}`);
      }
    },

    // 添加默认的update方法
    async update(ctx) {
      try {
        const { id } = ctx.params;
        const { data } = ctx.request.body;
        const result = await strapi.entityService.update('api::choujiang-jihui.choujiang-jihui' as any, id, {
          data
        });
        return result;
      } catch (error) {
        console.error('更新抽奖机会失败:', error);
        ctx.throw(500, `更新抽奖机会失败: ${error.message}`);
      }
    },

    // 添加默认的delete方法
    async delete(ctx) {
      try {
        const { id } = ctx.params;
        const result = await strapi.entityService.delete('api::choujiang-jihui.choujiang-jihui' as any, id);
        return result;
      } catch (error) {
        console.error('删除抽奖机会失败:', error);
        ctx.throw(500, `删除抽奖机会失败: ${error.message}`);
      }
    },

    // 赠送抽奖机会（不绑定特定奖品）
    async giveChance(ctx) {
      try {
        const { userId, count, reason, type, sourceOrderId, validUntil } = ctx.request.body;

        // 验证输入
        if (!userId || !count || count <= 0) {
          return ctx.badRequest('参数不完整或无效');
        }

        // 创建抽奖机会记录（不绑定特定奖品）
        const chanceData = {
          user: userId,
          jiangpin: null, // 不绑定特定奖品，抽奖时随机选择
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

        console.log(`用户 ${userId} 获得 ${count} 次抽奖机会`);

        ctx.body = {
          success: true,
          data: chance,
          message: '赠送抽奖机会成功'
        };
      } catch (error) {
        console.error('赠送抽奖机会失败:', error);
        ctx.throw(500, `赠送抽奖机会失败: ${error.message}`);
      }
    },

    // 获取用户抽奖机会
    async getUserChances(ctx) {
      try {
        const userId = ctx.state.user.id;
        console.log('获取用户抽奖机会，用户ID:', userId);

        const chances = await strapi.entityService.findMany('api::choujiang-jihui.choujiang-jihui' as any, {
          filters: {
            user: { id: userId },
            isActive: true,
            $or: [
              { validUntil: null },
              { validUntil: { $gt: new Date() } }
            ]
          },
          populate: ['user', 'jiangpin'],
          sort: { createdAt: 'desc' }
        }) as any[];

        console.log('查询到的抽奖机会:', chances.length, '个');

        // 计算总可用次数
        let totalAvailableCount = 0;
        const processedChances = chances.map(chance => {
          const availableCount = chance.count - (chance.usedCount || 0);
          totalAvailableCount += availableCount;
          
          console.log(`抽奖机会ID: ${chance.id}, 总次数: ${chance.count}, 已用: ${chance.usedCount || 0}, 剩余: ${availableCount}`);
          
          return {
            ...chance,
            availableCount,
            isUsable: availableCount > 0
          };
        });

        ctx.body = {
          success: true,
          data: {
            chances: processedChances,
            totalAvailableCount,
            totalChances: chances.length
          },
          message: '获取抽奖机会成功'
        };
      } catch (error) {
        console.error('获取用户抽奖机会失败:', error);
        ctx.throw(500, `获取用户抽奖机会失败: ${error.message}`);
      }
    },

    // 执行抽奖（修复后的随机抽奖逻辑）
    async draw(ctx) {
      try {
        const userId = ctx.state.user.id;
        const { chanceId } = ctx.request.body;

        if (!chanceId) {
          return ctx.badRequest('请选择抽奖机会');
        }

        console.log(`用户 ${userId} 开始抽奖，机会ID: ${chanceId}`);

        // 获取抽奖机会
        const chance = await strapi.entityService.findOne('api::choujiang-jihui.choujiang-jihui' as any, chanceId, {
          populate: ['user']
        }) as any;

        if (!chance) {
          return ctx.notFound('抽奖机会不存在');
        }

        // 验证用户权限
        if (chance.user.id !== userId) {
          return ctx.forbidden('无权使用此抽奖机会');
        }

        // 检查机会是否有效
        if (!chance.isActive) {
          return ctx.badRequest('抽奖机会已失效');
        }

        // 检查有效期
        if (chance.validUntil && new Date() > new Date(chance.validUntil)) {
          return ctx.badRequest('抽奖机会已过期');
        }

        // 检查是否还有可用次数
        const availableCount = chance.count - (chance.usedCount || 0);
        if (availableCount <= 0) {
          return ctx.badRequest('抽奖机会已用完');
        }

        console.log(`抽奖机会验证通过，剩余次数: ${availableCount}`);

        // 从奖品池中随机选择奖品
        const selectedPrize = await selectRandomPrize();
        console.log(`随机选中奖品: ${selectedPrize.name}, 类型: ${selectedPrize.jiangpinType}, 价值: ${selectedPrize.value}`);

        // 检查选中奖品的库存
        if (selectedPrize.maxQuantity > 0 && (selectedPrize.currentQuantity || 0) >= selectedPrize.maxQuantity) {
          return ctx.badRequest('奖品库存不足，请稍后重试');
        }

        // 根据奖品概率决定是否中奖
        const winRate = new Decimal(selectedPrize.zhongJiangLv || 1);
        const random = Math.random() * 100;
        const isWon = random <= winRate.toNumber();

        console.log(`抽奖结果: 随机数 ${random}, 中奖概率 ${winRate.toNumber()}%, 是否中奖: ${isWon}`);
        
        if (isWon) {
          // 中奖：发放奖品
          await grantPrize(userId, selectedPrize);
          
          // 更新奖品库存
          if (selectedPrize.maxQuantity > 0) {
            await strapi.entityService.update('api::choujiang-jiangpin.choujiang-jiangpin' as any, selectedPrize.id, {
              data: { currentQuantity: (selectedPrize.currentQuantity || 0) + 1 }
            });
          }
        }

        // 更新抽奖机会使用次数
        await strapi.entityService.update('api::choujiang-jihui.choujiang-jihui' as any, chanceId, {
          data: { usedCount: (chance.usedCount || 0) + 1 }
        });

        // 记录抽奖记录
        await recordDrawResult(ctx, userId, chance, selectedPrize, isWon);

        ctx.body = {
          success: true,
          data: {
            isWon,
            prize: isWon ? selectedPrize : null,
            remainingChances: availableCount - 1
          },
          message: isWon ? '恭喜中奖！' : '很遗憾，未中奖'
        };
      } catch (error) {
        console.error('执行抽奖失败:', error);
        ctx.throw(500, `执行抽奖失败: ${error.message}`);
      }
    }
  };
}); 