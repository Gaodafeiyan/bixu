import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';
import lotteryEngineService from '../../../services/lottery-engine';

export default factories.createCoreController('api::choujiang-jihui.choujiang-jihui' as any, ({ strapi }) => {
  return {
    // 继承默认的find方法
    async find(ctx) {
      try {
        // 处理查询参数，将"me"替换为当前用户ID
        const query = { ...ctx.query };
        
        console.log('抽奖机会查询参数:', JSON.stringify(query, null, 2));
        console.log('当前用户状态:', ctx.state.user ? `ID: ${ctx.state.user.id}, 用户名: ${ctx.state.user.username}` : '未登录');
        
        // 检查是否有filters[user][id]=me的情况
        if (query.filters && query.filters.user && query.filters.user.id === 'me') {
          if (ctx.state.user && ctx.state.user.id) {
            query.filters.user.id = ctx.state.user.id;
            console.log('将"me"替换为用户ID:', ctx.state.user.id);
          } else {
            console.log('用户未登录，返回401');
            return ctx.unauthorized('用户未登录');
          }
        }
        
        const result = await strapi.entityService.findPage('api::choujiang-jihui.choujiang-jihui' as any, {
          ...query,
          populate: ['user', 'jiangpin']
        });
        
        console.log('查询结果:', JSON.stringify(result, null, 2));
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
        const { userId, count, reason, type, sourceOrderId, sourceInviteRecordId, validUntil } = ctx.request.body;

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
          sourceOrder: sourceOrderId || null,
          sourceInviteRecord: sourceInviteRecordId || null
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

        const beijingNow = new Date(Date.now() + 8 * 60 * 60 * 1000); // 北京时间 UTC+8
        const chances = await strapi.entityService.findMany('api::choujiang-jihui.choujiang-jihui' as any, {
          filters: {
            user: { id: userId },
            isActive: true,
            $or: [
              { validUntil: null },
              { validUntil: { $gt: beijingNow } }
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

    // 执行抽奖（使用新的抽奖引擎）
    async draw(ctx) {
      try {
        const userId = ctx.state.user.id;
        const { chanceId, groupId } = ctx.request.body;

        if (!chanceId) {
          return ctx.badRequest('请选择抽奖机会');
        }

        console.log(`用户 ${userId} 开始抽奖，机会ID: ${chanceId}, 奖池组ID: ${groupId}`);

        // 风控限流检查
        const lotteryEngine = lotteryEngineService({ strapi });
        const clientIp = ctx.request.ip;
        const rateLimitPassed = await lotteryEngine.checkRateLimit(clientIp);
        
        if (!rateLimitPassed) {
          return ctx.tooManyRequests('抽奖频率过高，请稍后再试');
        }

        // 使用新的抽奖引擎执行抽奖
        const result = await lotteryEngine.drawWithTransaction(userId, chanceId, ctx);

        // 数据埋点
        console.log(`📊 事件埋点: lottery_draw`, {
          userId,
          chanceId,
          groupId,
          traceId: result.traceId,
          isWon: result.isWon,
          prizeId: result.prize?.id
        });

        ctx.body = {
          success: true,
          data: {
            isWon: result.isWon,
            prize: result.isWon ? result.prize : null,
            remainingChances: result.remainingChances,
            traceId: result.traceId
          },
          message: result.isWon ? '恭喜中奖！' : '很遗憾，未中奖'
        };
      } catch (error) {
        console.error('执行抽奖失败:', error);
        ctx.throw(500, `执行抽奖失败: ${error.message}`);
      }
    },

    // 获取奖池组列表
    async getLotteryGroups(ctx) {
      try {
        const groups = await strapi.entityService.findMany('api::lottery-group.lottery-group' as any, {
          filters: { visible: true },
          sort: { sort: 'asc' },
          populate: ['coverImage']
        });

        ctx.body = {
          success: true,
          data: groups,
          message: '获取奖池组成功'
        };
      } catch (error) {
        console.error('获取奖池组失败:', error);
        ctx.throw(500, `获取奖池组失败: ${error.message}`);
      }
    },

    // 从指定奖池组抽奖
    async drawFromGroup(ctx) {
      try {
        const userId = ctx.state.user.id;
        const { chanceId, groupId } = ctx.request.body;

        if (!chanceId || !groupId) {
          return ctx.badRequest('请选择抽奖机会和奖池组');
        }

        console.log(`用户 ${userId} 从奖池组 ${groupId} 开始抽奖，机会ID: ${chanceId}`);

        // 风控限流检查
        const lotteryEngine = lotteryEngineService({ strapi });
        const clientIp = ctx.request.ip;
        const rateLimitPassed = await lotteryEngine.checkRateLimit(clientIp);
        
        if (!rateLimitPassed) {
          return ctx.tooManyRequests('抽奖频率过高，请稍后再试');
        }

        // 验证奖池组是否存在且可见
        const group = await strapi.entityService.findOne('api::lottery-group.lottery-group' as any, groupId);
        if (!group || !group.visible) {
          return ctx.badRequest('奖池组不存在或已关闭');
        }

        // 使用新的抽奖引擎执行抽奖（指定奖池组）
        const result = await lotteryEngine.drawWithTransaction(userId, chanceId, ctx);

        // 数据埋点
        console.log(`📊 事件埋点: lottery_draw_group`, {
          userId,
          chanceId,
          groupId,
          traceId: result.traceId,
          isWon: result.isWon,
          prizeId: result.prize?.id
        });

        ctx.body = {
          success: true,
          data: {
            isWon: result.isWon,
            prize: result.isWon ? result.prize : null,
            remainingChances: result.remainingChances,
            traceId: result.traceId,
            groupName: group.name
          },
          message: result.isWon ? '恭喜中奖！' : '很遗憾，未中奖'
        };
      } catch (error) {
        console.error('从奖池组抽奖失败:', error);
        ctx.throw(500, `从奖池组抽奖失败: ${error.message}`);
      }
    }
  };
}); 