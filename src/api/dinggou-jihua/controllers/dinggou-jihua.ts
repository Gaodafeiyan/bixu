import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreController('api::dinggou-jihua.dinggou-jihua', ({ strapi }) => ({
  // 继承默认的find方法
  async find(ctx) {
    try {
      // 直接使用strapi.entityService
      const result = await strapi.entityService.findPage('api::dinggou-jihua.dinggou-jihua', {
        ...ctx.query,
        populate: []
      });
      return result;
    } catch (error) {
      console.error('获取认购计划列表失败:', error);
      ctx.throw(500, `获取认购计划列表失败: ${error.message}`);
    }
  },

  // 添加默认的findOne方法
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.entityService.findOne('api::dinggou-jihua.dinggou-jihua', id, {
        populate: []
      });
      return result;
    } catch (error) {
      console.error('获取认购计划详情失败:', error);
      ctx.throw(500, `获取认购计划详情失败: ${error.message}`);
    }
  },

  // 添加默认的create方法
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      const result = await strapi.entityService.create('api::dinggou-jihua.dinggou-jihua', {
        data
      });
      return result;
    } catch (error) {
      console.error('创建认购计划失败:', error);
      ctx.throw(500, `创建认购计划失败: ${error.message}`);
    }
  },

  // 添加默认的update方法
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;
      const result = await strapi.entityService.update('api::dinggou-jihua.dinggou-jihua', id, {
        data
      });
      return result;
    } catch (error) {
      console.error('更新认购计划失败:', error);
      ctx.throw(500, `更新认购计划失败: ${error.message}`);
    }
  },

  // 添加默认的delete方法
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.entityService.delete('api::dinggou-jihua.dinggou-jihua', id);
      return result;
    } catch (error) {
      console.error('删除认购计划失败:', error);
      ctx.throw(500, `删除认购计划失败: ${error.message}`);
    }
  },

  // 测试连接方法
  async testConnection(ctx) {
    ctx.body = {
      success: true,
      message: '认购计划API连接正常',
      timestamp: new Date().toISOString()
    };
  },

  // 投资认购计划
  async invest(ctx) {
    try {
      // 检查用户是否已认证
      if (!ctx.state.user || !ctx.state.user.id) {
        return ctx.unauthorized('用户未认证');
      }
      
      const { planId } = ctx.params;
      const userId = ctx.state.user.id;

      // 输入验证
      if (!planId || isNaN(Number(planId))) {
        return ctx.badRequest('无效的计划ID');
      }

      // 获取计划信息
      const plan = await strapi.entityService.findOne('api::dinggou-jihua.dinggou-jihua', planId);
      if (!plan) {
        return ctx.notFound('认购计划不存在');
      }

      // 检查计划状态
      if (!plan.kaiqi) {
        return ctx.badRequest('认购计划已暂停');
      }

      // 检查槽位是否已满
      if (plan.current_slots >= plan.max_slots) {
        return ctx.badRequest('认购计划槽位已满');
      }

      // 使用计划中预设的投资金额 - 使用类型断言
      const planData = plan as any;
      const investmentAmount = new Decimal(planData.benjinUSDT || 0);
      if (investmentAmount.isZero()) {
        return ctx.badRequest('认购计划金额未设置');
      }

      console.log(`用户 ${userId} 投资计划 ${planId}，计划金额: ${investmentAmount.toString()} USDT`);

      // 检查用户钱包余额
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: { id: userId } }
      }) as any[];

      if (!wallets || wallets.length === 0) {
        return ctx.badRequest('用户钱包不存在');
      }

      const userWallet = wallets[0];
      const walletBalance = new Decimal(userWallet.usdtYue || 0);

      console.log(`用户钱包余额: ${walletBalance.toString()} USDT`);

      if (walletBalance.lessThan(investmentAmount)) {
        return ctx.badRequest('钱包余额不足');
      }

      // 创建投资订单 - 状态设置为running
      const beijingTime = new Date(Date.now() + 8 * 60 * 60 * 1000); // 北京时间 UTC+8
      const endTime = new Date(beijingTime.getTime() + planData.zhouQiTian * 24 * 60 * 60 * 1000);
      
      const order = await strapi.entityService.create('api::dinggou-dingdan.dinggou-dingdan', {
        data: {
          user: userId,
          jihua: planId,
          amount: investmentAmount.toString(),
          principal: investmentAmount.toString(),
          yield_rate: planData.jingtaiBili,
          cycle_days: planData.zhouQiTian,
          start_at: beijingTime,
          end_at: endTime,
          status: 'running' // 直接设置为running状态
        }
      });

      // 扣除钱包余额
      await strapi.entityService.update('api::qianbao-yue.qianbao-yue', userWallet.id, {
        data: { usdtYue: walletBalance.minus(investmentAmount).toString() }
      });

      // 更新计划当前槽位
      await strapi.entityService.update('api::dinggou-jihua.dinggou-jihua', planId, {
        data: { current_slots: (plan.current_slots || 0) + 1 }
      });

      // 记录操作日志
      console.log(`用户 ${userId} 投资计划 ${planId}，金额: ${investmentAmount.toString()} USDT，订单ID: ${order.id}`);

      ctx.body = {
        success: true,
        data: {
          orderId: order.id,
          investmentAmount: investmentAmount.toString(),
          planName: plan.name,
          planCode: planData.jihuaCode,
          newBalance: walletBalance.minus(investmentAmount).toString(),
          status: 'running'
        },
        message: '投资成功'
      };
    } catch (error) {
      console.error('投资失败:', error);
      
      // 统一错误处理
      if (error.message.includes('钱包余额不足')) {
        return ctx.badRequest('钱包余额不足');
      } else if (error.message.includes('认购计划不存在')) {
        return ctx.notFound('认购计划不存在');
      } else if (error.message.includes('用户钱包不存在')) {
        return ctx.badRequest('用户钱包不存在');
      }
      
      ctx.throw(500, `投资失败: ${error.message}`);
    }
  },

  // 赎回投资
  async redeem(ctx) {
    try {
      const { orderId } = ctx.params;
      const userId = ctx.state.user.id;

      // 输入验证
      if (!orderId || isNaN(Number(orderId))) {
        return ctx.badRequest('无效的订单ID');
      }

      // 获取订单信息
      const order = await strapi.entityService.findOne('api::dinggou-dingdan.dinggou-dingdan', orderId, {
        populate: ['user', 'jihua']
      });

      if (!order) {
        return ctx.notFound('订单不存在');
      }

      // 验证订单所有者
      if (order.user.id !== userId) {
        return ctx.forbidden('无权操作此订单');
      }

      // 检查订单状态 - 允许redeemable状态或已到期的running状态
      const now = new Date();
      const isExpired = order.end_at && new Date(order.end_at) <= now;
      
      if (order.status !== 'redeemable' && !(order.status === 'running' && isExpired)) {
        return ctx.badRequest('订单尚未到期，无法赎回');
      }

      // 获取计划信息
      const planData = order.jihua as any;
      
      // 计算收益 - 修复：收益率是百分比，需要除以100
      const investmentAmount = new Decimal(order.amount);
      const yieldRate = new Decimal(order.yield_rate).div(100); // 转换为小数
      
      // 计算静态收益 - 固定收益：本金 × 收益率
      const staticYield = investmentAmount.mul(yieldRate);
      const totalPayout = investmentAmount.plus(staticYield);

      console.log(`赎回计算: 本金 ${investmentAmount.toString()}, 收益率 ${yieldRate.toString()}, 静态收益 ${staticYield.toString()}, 总收益 ${totalPayout.toString()}`);

      // 更新钱包余额 - 本金+收益
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: { id: userId } }
      }) as any[];

      if (wallets && wallets.length > 0) {
        const userWallet = wallets[0];
        const currentBalance = new Decimal(userWallet.usdtYue || 0);
        
        await strapi.entityService.update('api::qianbao-yue.qianbao-yue', userWallet.id, {
          data: { usdtYue: currentBalance.plus(totalPayout).toString() }
        });

        console.log(`钱包余额更新: ${currentBalance.toString()} -> ${currentBalance.plus(totalPayout).toString()}`);
      }

      // 处理AI代币奖励
      if (planData.aiBili) {
        const aiTokenReward = investmentAmount.mul(new Decimal(planData.aiBili).div(100)); // 转换为小数
        
        // 更新用户AI代币余额
        if (wallets && wallets.length > 0) {
          const userWallet = wallets[0];
          const currentAiBalance = new Decimal(userWallet.aiYue || 0);
          
          // 随机选择代币类型 (1-6: LINK, SHIB, CAKE, TWT, DOGE, BNB)
          const tokenTypes = [1, 2, 3, 4, 5, 6];
          const randomTokenId = tokenTypes[Math.floor(Math.random() * tokenTypes.length)];
          
          // 解析现有的代币余额
          let tokenBalances = {};
          try {
            if (userWallet.aiTokenBalances && userWallet.aiTokenBalances !== '{}') {
              tokenBalances = JSON.parse(userWallet.aiTokenBalances);
            }
          } catch (e) {
            console.error('解析代币余额失败:', e);
            tokenBalances = {};
          }
          
          // 更新随机选择的代币余额
          const currentTokenBalance = new Decimal(tokenBalances[randomTokenId] || 0);
          const tokenRewardAmount = aiTokenReward.div(100); // 假设代币价值约为USDT的1%
          tokenBalances[randomTokenId] = currentTokenBalance.plus(tokenRewardAmount).toString();
          
          await strapi.entityService.update('api::qianbao-yue.qianbao-yue', userWallet.id, {
            data: { 
              aiYue: currentAiBalance.plus(aiTokenReward).toString(),
              aiTokenBalances: JSON.stringify(tokenBalances)
            }
          });

          const tokenNames = ['', 'LINK', 'SHIB', 'CAKE', 'TWT', 'DOGE', 'BNB'];
          console.log(`🎁 AI代币奖励: ${aiTokenReward.toString()} USDT, 随机赠送 ${tokenRewardAmount.toString()} ${tokenNames[randomTokenId]}, 余额更新: ${currentAiBalance.toString()} -> ${currentAiBalance.plus(aiTokenReward).toString()}`);
        }
      }

      // 处理抽奖机会 - 实际赠送抽奖次数
      const lotteryChances = planData.lottery_chances || 0; // 改为默认0，只有明确配置了才赠送
      console.log(`🔍 检查抽奖机会配置: 计划 ${planData.jihuaCode || planData.name}, lottery_chances: ${planData.lottery_chances}, 计算后: ${lotteryChances}`);
      
      if (lotteryChances > 0) {
        try {
          // 获取一个可用的奖品作为默认绑定（用于满足数据库约束）
          console.log('🔍 查找可用的抽奖奖品...');
          const availablePrizes = await strapi.entityService.findMany('api::choujiang-jiangpin.choujiang-jiangpin', {
            filters: { kaiQi: true },
            limit: 1
          }) as any[];
          
          console.log(`🔍 找到 ${availablePrizes ? availablePrizes.length : 0} 个可用奖品`);
          
          let defaultPrizeId = null;
          if (availablePrizes && availablePrizes.length > 0) {
            defaultPrizeId = availablePrizes[0].id;
            console.log(`✅ 使用奖品ID: ${defaultPrizeId} (${availablePrizes[0].name})`);
          } else {
            console.error('❌ 没有可用的奖品，尝试创建默认奖品...');
            
            // 尝试创建一个默认的USDT奖品
            try {
              const defaultPrize = await strapi.entityService.create('api::choujiang-jiangpin.choujiang-jiangpin', {
                data: {
                  name: '默认USDT奖励',
                  description: '投资赎回默认奖励',
                  jiangpinType: 'usdt',
                  value: 1.0,
                  zhongJiangLv: 100.0,
                  maxQuantity: 0, // 无限制
                  currentQuantity: 0,
                  kaiQi: true,
                  paiXuShunXu: 1,
                  category: 'default',
                  rarity: 'common'
                }
              });
              
              defaultPrizeId = defaultPrize.id;
              console.log(`✅ 创建默认奖品成功，ID: ${defaultPrizeId}`);
            } catch (createPrizeError) {
              console.error('❌ 创建默认奖品失败:', createPrizeError);
              // 继续执行，不因为抽奖机会创建失败而影响赎回流程
            }
          }
          
          if (defaultPrizeId) {
            // 创建抽奖机会记录
            console.log(`🎯 创建抽奖机会记录: 用户 ${userId}, 奖品 ${defaultPrizeId}, 次数 ${lotteryChances}`);
            const chanceData = {
              data: {
                user: userId,
                jiangpin: defaultPrizeId, // 绑定一个可用的奖品ID
                count: lotteryChances,
                usedCount: 0,
                reason: `投资赎回奖励 - 计划: ${planData.jihuaCode || planData.name}`,
                type: 'investment_redeem' as const,
                isActive: true,
                validUntil: null,
                // 暂时移除sourceOrder字段，避免SQLite错误
                // sourceOrder: orderId
              }
            };

            const chance = await strapi.entityService.create('api::choujiang-jihui.choujiang-jihui', chanceData);
            
            console.log(`✅ 用户 ${userId} 获得 ${lotteryChances} 次抽奖机会，记录ID: ${chance.id}`);
          } else {
            console.error('❌ 无法创建抽奖机会：没有可用的奖品ID');
          }
        } catch (error) {
          console.error('❌ 赠送抽奖机会失败:', error);
          // 抽奖机会赠送失败不影响主流程，但记录详细错误信息
          console.error('抽奖机会创建失败详情:', {
            userId,
            lotteryChances,
            planData: planData.jihuaCode || planData.name,
            error: error.message,
            stack: error.stack
          });
        }
      } else {
        console.log(`ℹ️ 计划 ${planData.jihuaCode || planData.name} 未配置抽奖机会 (lottery_chances: ${planData.lottery_chances})`);
      }

      // 更新订单状态
      await strapi.entityService.update('api::dinggou-dingdan.dinggou-dingdan', orderId, {
        data: {
          status: 'finished', // 改为finished状态
          redeemed_at: new Date(),
          payout_amount: totalPayout.toString()
        }
      });

      // 检查并触发邀请奖励生成
      let invitationReward = '0';
      let inviterInfo = null;
      let rewardCalculation = null;
      let parentTier = null;
      
      try {
        // 首先检查是否已有邀请奖励记录
        const existingRewards = await strapi.entityService.findMany('api::yaoqing-jiangli.yaoqing-jiangli', {
          filters: { laiyuanDan: orderId },
          populate: ['tuijianRen']
        }) as any[];
        
        if (existingRewards && existingRewards.length > 0) {
          // 已有奖励记录，直接使用
          const reward = existingRewards[0];
          invitationReward = reward.shouyiUSDT;
          rewardCalculation = reward.calculation;
          parentTier = reward.parentTier;
          inviterInfo = {
            id: reward.tuijianRen.id,
            username: reward.tuijianRen.username
          };
          console.log(`订单 ${orderId} 已有邀请奖励记录: ${invitationReward} USDT`);
        } else {
          // 没有奖励记录，尝试触发邀请奖励生成
          console.log(`订单 ${orderId} 没有邀请奖励记录，尝试触发生成...`);
          
          // 修复：对于已完成的订单，也应该触发邀请奖励处理
          // 因为订单可能直接跳过了redeemable状态
          // 注意：此时订单状态已经是finished，所以直接触发邀请奖励处理
          console.log(`订单 ${orderId} 状态为${order.status}，触发邀请奖励处理`);
          
          // 调用投资服务处理邀请奖励 - 使用正确的 api:: 前缀格式
          const investmentService = strapi.service('api::investment-service.investment-service');
          const rewardResult = await investmentService.processInvitationRewardV2(order);
          
          if (rewardResult.success) {
            console.log(`✅ 邀请奖励生成成功: ${rewardResult.rewardAmount} USDT`);
            invitationReward = rewardResult.rewardAmount;
            rewardCalculation = rewardResult.calculation;
            parentTier = rewardResult.parentTier;
            inviterInfo = {
              id: rewardResult.inviterId,
              username: rewardResult.inviterUsername
            };
          } else {
            console.log(`❌ 邀请奖励生成失败: ${rewardResult.message}`);
          }
        }
      } catch (rewardError) {
        console.error('处理邀请奖励失败:', rewardError);
      }

      // 记录操作日志
      console.log(`用户 ${userId} 赎回订单 ${orderId}，总收益: ${totalPayout.toString()} USDT，邀请奖励: ${invitationReward} USDT`);

      ctx.body = {
        success: true,
        data: {
          orderId: order.id,
          investmentAmount: investmentAmount.toString(),
          staticYield: staticYield.toString(),
          totalPayout: totalPayout.toString(),
          aiTokenReward: planData.aiBili ? investmentAmount.mul(planData.aiBili).toString() : '0',
          lotteryChances: lotteryChances,
          invitationReward: invitationReward,
          inviterInfo: inviterInfo,
          rewardCalculation: rewardCalculation,
          parentTier: parentTier
        },
        message: '赎回成功'
      };
    } catch (error) {
      console.error('赎回失败:', error);
      
      // 统一错误处理
      if (error.message.includes('订单不存在')) {
        return ctx.notFound('订单不存在');
      } else if (error.message.includes('订单尚未到期')) {
        return ctx.badRequest('订单尚未到期，无法赎回');
      } else if (error.message.includes('无权操作')) {
        return ctx.forbidden('无权操作此订单');
      }
      
      ctx.throw(500, `赎回失败: ${error.message}`);
    }
  },

  // 获取计划统计信息
  async getPlanStats(ctx) {
    try {
      const { planId } = ctx.params;

      // 输入验证
      if (!planId || isNaN(Number(planId))) {
        return ctx.badRequest('无效的计划ID');
      }

      // 获取计划信息
      const plan = await strapi.entityService.findOne('api::dinggou-jihua.dinggou-jihua', planId);
      if (!plan) {
        return ctx.notFound('认购计划不存在');
      }

      // 获取该计划的所有订单
      const orders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
        filters: { jihua: planId },
        populate: ['user']
      });

      // 计算统计数据
      const totalInvestment = (orders as any[]).reduce((sum, order) => {
        return sum + parseFloat(order.amount || 0);
      }, 0);

      const activeOrders = (orders as any[]).filter(order => order.status === 'running');
      const completedOrders = (orders as any[]).filter(order => order.status === 'finished');

      const totalYield = completedOrders.reduce((sum, order) => {
        return sum + parseFloat(order.payout_amount || 0);
      }, 0);

      ctx.body = {
        success: true,
        data: {
          planId: plan.id,
          planName: plan.jihuaCode,
          totalInvestment,
          totalParticipants: (orders as any[]).length,
          activeParticipants: activeOrders.length,
          completedParticipants: completedOrders.length,
          totalYield,
          maxSlots: plan.max_slots || 100,
          currentSlots: (orders as any[]).length,
          availableSlots: (plan.max_slots || 100) - (orders as any[]).length
        }
      };
    } catch (error) {
      console.error('获取计划统计失败:', error);
      ctx.throw(500, `获取计划统计失败: ${error.message}`);
    }
  },

  // 获取我的投资
  async getMyInvestments(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { page = 1, pageSize = 10 } = ctx.query;

      // 输入验证
      const pageNum = parseInt(String(page));
      const pageSizeNum = parseInt(String(pageSize));
      
      if (isNaN(pageNum) || isNaN(pageSizeNum) || pageNum < 1 || pageSizeNum < 1) {
        return ctx.badRequest('无效的分页参数');
      }

      const result = await strapi.entityService.findPage('api::dinggou-dingdan.dinggou-dingdan', {
        filters: { user: { id: userId } },
        populate: ['jihua'],
        pagination: {
          page: pageNum,
          pageSize: pageSizeNum
        },
        sort: { createdAt: 'desc' }
      });

      ctx.body = {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('获取我的投资失败:', error);
      ctx.throw(500, `获取我的投资失败: ${error.message}`);
    }
  },

  // 获取计划参与者列表
  async getPlanParticipants(ctx) {
    try {
      const { planId } = ctx.params;
      const { page = 1, pageSize = 20 } = ctx.query;

      // 输入验证
      if (!planId || isNaN(Number(planId))) {
        return ctx.badRequest('无效的计划ID');
      }

      const pageNum = parseInt(String(page));
      const pageSizeNum = parseInt(String(pageSize));
      
      if (isNaN(pageNum) || isNaN(pageSizeNum) || pageNum < 1 || pageSizeNum < 1) {
        return ctx.badRequest('无效的分页参数');
      }

      // 获取计划信息
      const plan = await strapi.entityService.findOne('api::dinggou-jihua.dinggou-jihua', planId);
      if (!plan) {
        return ctx.notFound('认购计划不存在');
      }

      // 获取该计划的参与者
      const participants = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
        filters: { jihua: planId },
        populate: ['user'],
        pagination: {
          page: pageNum,
          pageSize: pageSizeNum
        },
        sort: { createdAt: 'desc' }
      });

      // 格式化参与者信息
      const formattedParticipants = (participants as any[]).map(order => ({
        userId: order.user.id,
        username: order.user.username,
        email: order.user.email,
        amount: order.amount,
        status: order.status,
        createdAt: order.createdAt
      }));

      ctx.body = {
        success: true,
        data: {
          participants: formattedParticipants,
          pagination: {
            page: pageNum,
            pageSize: pageSizeNum,
            total: (participants as any[]).length
          }
        }
      };
    } catch (error) {
      console.error('获取参与者列表失败:', error);
      ctx.throw(500, `获取参与者列表失败: ${error.message}`);
    }
  }
})); 