import { Strapi } from '@strapi/strapi';
import Decimal from 'decimal.js';

// 邀请奖励档位配置
interface RewardTier {
  name: string;
  principal: number;        // 档位本金
  staticRate: number;       // 静态收益率
  referralRate: number;     // 返佣系数
  maxCommission: number;    // 可计佣本金上限
}

// 邀请奖励配置
const REWARD_TIERS: RewardTier[] = [
  {
    name: 'PLAN 500',
    principal: 500,
    staticRate: 0.06,    // 6%
    referralRate: 1.0,   // 100%
    maxCommission: 500
  },
  {
    name: 'PLAN 1K',
    principal: 1000,
    staticRate: 0.07,    // 7%
    referralRate: 0.9,   // 90%
    maxCommission: 1000
  },
  {
    name: 'PLAN 2K',
    principal: 2000,
    staticRate: 0.08,    // 8%
    referralRate: 0.8,   // 80%
    maxCommission: 2000
  },
  {
    name: 'PLAN 5K',
    principal: 5000,
    staticRate: 0.10,    // 10%
    referralRate: 0.7,   // 70%
    maxCommission: 5000
  }
];

// 调试开关
const VERBOSE = process.env.DEBUG_VERBOSE === '1';

export default ({ strapi }: { strapi: Strapi }) => ({
  // 获取用户当前最高有效档位（优化版：使用Strapi API）
  async getUserCurrentTier(userId: number): Promise<RewardTier | null> {
    try {
      if (VERBOSE) console.log(`🔍 开始获取用户 ${userId} 的当前档位...`);
      
      // 使用Strapi API获取有效订单（包含 running/redeemable/finished）
      const activeOrders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
        filters: { 
          user: { id: userId },
          status: { $in: ['running', 'redeemable', 'finished'] }
        },
        fields: ['principal', 'amount', 'status'],
        sort: { principal: 'desc' }
      }) as any[];

      if (VERBOSE) {
        console.log(`用户 ${userId} 的有效订单数量: ${activeOrders.length}`);
      }

      if (!activeOrders || activeOrders.length === 0) {
        if (VERBOSE) console.log(`用户 ${userId} 没有有效的订单`);
        return null;
      }

      // 找到最高金额的订单
      let maxPrincipal = 0;
      for (const order of activeOrders) {
        const orderPrincipal = new Decimal(order.principal || order.amount || 0);
        const principalValue = orderPrincipal.toNumber();
        if (principalValue > maxPrincipal) {
          maxPrincipal = principalValue;
        }
      }

      if (VERBOSE) {
        console.log(`用户 ${userId} 的最高有效订单金额: ${maxPrincipal}`);
      }

      if (maxPrincipal === 0) {
        if (VERBOSE) console.log(`用户 ${userId} 没有有效的订单`);
        return null;
      }

      // 根据最高金额找到对应的档位（就近向下匹配）
      const sorted = [...REWARD_TIERS].sort((a, b) => a.principal - b.principal);
      let matched: RewardTier | null = null;
      for (const t of sorted) {
        if (maxPrincipal >= t.principal) matched = t; else break;
      }
      if (matched) {
        if (VERBOSE) console.log(`用户 ${userId} 的最终档位: ${matched.name}（就近向下匹配，maxPrincipal=${maxPrincipal}）`);
        return matched;
      }
      if (VERBOSE) console.log(`⚠️ 订单金额 ${maxPrincipal} 小于最小档位 ${sorted[0].principal}`);
      return null;
    } catch (error) {
      console.error('获取用户当前档位失败:', error);
      return null;
    }
  },

  // 计算邀请奖励
  calculateReferralReward(
    parentTier: RewardTier,
    childPrincipal: number
  ): { rewardAmount: string; calculation: string } {
    try {
      const childPrincipalDecimal = new Decimal(childPrincipal);
      const maxCommissionDecimal = new Decimal(parentTier.maxCommission);
      
      // 计算可计佣本金（取较小值）
      const commissionablePrincipal = Decimal.min(childPrincipalDecimal, maxCommissionDecimal);
      
      // 计算返佣金额
      const rewardAmount = commissionablePrincipal
        .mul(parentTier.staticRate)
        .mul(parentTier.referralRate);

      // 生成计算说明
      const calculation = `min(${childPrincipal}, ${parentTier.maxCommission}) × ${(parentTier.staticRate * 100).toFixed(0)}% × ${(parentTier.referralRate * 100).toFixed(0)}% = ${rewardAmount.toString()}`;

      return {
        rewardAmount: rewardAmount.toString(),
        calculation
      };
    } catch (error) {
      console.error('计算邀请奖励失败:', error);
      return {
        rewardAmount: '0',
        calculation: '计算失败'
      };
    }
  },

  // 获取所有档位配置
  getAllTiers(): RewardTier[] {
    return REWARD_TIERS;
  },

  // 根据本金获取档位
  getTierByPrincipal(principal: number): RewardTier | null {
    return REWARD_TIERS.find(tier => tier.principal === principal) || null;
  },

  // 验证档位配置
  validateTierConfig(): boolean {
    try {
      // 检查档位是否按本金递增
      for (let i = 1; i < REWARD_TIERS.length; i++) {
        if (REWARD_TIERS[i].principal <= REWARD_TIERS[i-1].principal) {
          console.error('档位配置错误：档位本金未递增');
          return false;
        }
      }

      // 检查返佣系数是否递减
      for (let i = 1; i < REWARD_TIERS.length; i++) {
        if (REWARD_TIERS[i].referralRate >= REWARD_TIERS[i-1].referralRate) {
          console.error('档位配置错误：返佣系数未递减');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('验证档位配置失败:', error);
      return false;
    }
  }
}); 