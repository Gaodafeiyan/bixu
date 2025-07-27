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

export default ({ strapi }: { strapi: Strapi }) => ({
  // 获取用户当前最高有效档位
  async getUserCurrentTier(userId: number): Promise<RewardTier | null> {
    try {
      // 获取用户所有正在运行的订单
      const activeOrders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
        filters: { 
          user: { $eq: userId },
          status: 'running'
        },
        populate: ['jihua']
      }) as any[];

      if (!activeOrders || activeOrders.length === 0) {
        return null;
      }

      // 找到最高档位的订单
      let maxTier: RewardTier | null = null;
      let maxPrincipal = 0;

      for (const order of activeOrders) {
        const orderPrincipal = new Decimal(order.principal || order.amount);
        const principalValue = orderPrincipal.toNumber();

        // 根据本金找到对应的档位
        const tier = REWARD_TIERS.find(t => t.principal === principalValue);
        if (tier && principalValue > maxPrincipal) {
          maxTier = tier;
          maxPrincipal = principalValue;
        }
      }

      return maxTier;
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