import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreController('api::choujiang-jihui.choujiang-jihui' as any, ({ strapi }) => {
  // 执行抽奖算法
  const performDraw = async (prize: any) => {
    const winRate = new Decimal(prize.zhongJiangLv || 1);
    const random = Math.random() * 100;
    return random <= winRate.toNumber();
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

    // 赠送抽奖机会
    async giveChance(ctx) {
      try {
        const { userId, jiangpinId, count, reason, type, sourceOrderId, validUntil } = ctx.request.body;

        // 验证输入
        if (!userId || !jiangpinId || !count || count <= 0) {
          return ctx.badRequest('参数不完整或无效');
        }

        // 检查奖品是否存在且可用
        const prize = await strapi.entityService.findOne('api::choujiang-jiangpin.choujiang-jiangpin' as any, jiangpinId);
        if (!prize || !(prize as any).kaiQi) {
          return ctx.badRequest('奖品不存在或已停用');
        }

        // 检查库存
        if ((prize as any).maxQuantity > 0 && ((prize as any).currentQuantity || 0) >= (prize as any).maxQuantity) {
          return ctx.badRequest('奖品库存不足');
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

    // 获取用户的抽奖机会
    async getUserChances(ctx) {
      try {
        const userId = ctx.state.user.id;
        const { active = true } = ctx.query;

        console.log(`=== 调试: 获取用户抽奖机会 ===`);
        console.log(`用户ID: ${userId}`);
        console.log(`查询参数:`, ctx.query);

        const filters: any = {
          user: { id: userId },
          isActive: active === 'true'
        };

        console.log(`查询过滤器:`, JSON.stringify(filters, null, 2));

        // 如果只查询有效机会，添加有效期过滤
        if (active === 'true') {
          filters.$or = [
            { validUntil: null },
            { validUntil: { $gt: new Date() } }
          ];
        }

        const chances = await strapi.entityService.findMany('api::choujiang-jihui.choujiang-jihui' as any, {
          filters,
          populate: ['jiangpin'],
          sort: { createdAt: 'desc' }
        }) as any[];

        console.log(`查询结果: 找到 ${chances.length} 个抽奖机会`);
        console.log(`抽奖机会详情:`, JSON.stringify(chances, null, 2));

        // 计算总可用次数
        const totalAvailable = chances.reduce((sum, chance) => {
          return sum + (chance.count - (chance.usedCount || 0));
        }, 0);

        console.log(`总可用次数: ${totalAvailable}`);

        ctx.body = {
          success: true,
          data: {
            chances,
            totalAvailable,
            totalChances: chances.length
          },
          message: '获取抽奖机会成功'
        };
      } catch (error) {
        console.error('获取用户抽奖机会失败:', error);
        ctx.throw(500, `获取用户抽奖机会失败: ${error.message}`);
      }
    },

    // 执行抽奖
    async draw(ctx) {
      try {
        const userId = ctx.state.user.id;
        const { chanceId } = ctx.request.body;

        if (!chanceId) {
          return ctx.badRequest('请选择抽奖机会');
        }

        // 获取抽奖机会
        const chance = await strapi.entityService.findOne('api::choujiang-jihui.choujiang-jihui' as any, chanceId, {
          populate: ['jiangpin', 'user']
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

        // 获取奖品信息
        const prize = chance.jiangpin;
        if (!prize || !prize.kaiQi) {
          return ctx.badRequest('奖品已停用');
        }

        // 检查库存
        if (prize.maxQuantity > 0 && (prize.currentQuantity || 0) >= prize.maxQuantity) {
          return ctx.badRequest('奖品库存不足');
        }

        // 执行抽奖逻辑
        const isWon = await performDraw(prize);
        
        if (isWon) {
          // 中奖：发放奖品
          await grantPrize(userId, prize);
          
          // 更新奖品库存
          if (prize.maxQuantity > 0) {
            await strapi.entityService.update('api::choujiang-jiangpin.choujiang-jiangpin' as any, prize.id, {
              data: { currentQuantity: (prize.currentQuantity || 0) + 1 }
            });
          }
        }

        // 更新抽奖机会使用次数
        await strapi.entityService.update('api::choujiang-jihui.choujiang-jihui' as any, chanceId, {
          data: { usedCount: (chance.usedCount || 0) + 1 }
        });

        // 记录抽奖记录
        await recordDrawResult(ctx, userId, chance, prize, isWon);

        ctx.body = {
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
        ctx.throw(500, `执行抽奖失败: ${error.message}`);
      }
    }
  };
}); 