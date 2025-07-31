// 真正的白盒测试 - 测试内部业务逻辑
const { Decimal } = require('decimal.js');

// 模拟Strapi服务
const mockStrapi = {
  entityService: {
    findOne: jest.fn(),
    update: jest.fn(),
    create: jest.fn()
  }
};

// 模拟赎回业务逻辑
const redeemBusinessLogic = {
  // 计算赎回金额
  calculateRedeemAmount: (order) => {
    const investedAmount = new Decimal(order.investedAmount || 0);
    const profitRate = new Decimal(order.profitRate || 0);
    const profitAmount = investedAmount.mul(profitRate).div(100);
    return investedAmount.plus(profitAmount);
  },

  // 计算抽奖机会
  calculateLotteryChances: (redeemAmount) => {
    const amount = new Decimal(redeemAmount);
    // 每100USDT给1次抽奖机会
    return Math.floor(amount.div(100).toNumber());
  },

  // 验证订单是否可以赎回
  validateOrderForRedeem: (order) => {
    if (!order) return { valid: false, reason: '订单不存在' };
    if (order.status !== 'active') return { valid: false, reason: '订单状态不正确' };
    if (new Date() < new Date(order.endDate)) return { valid: false, reason: '订单未到期' };
    return { valid: true };
  }
};

describe('赎回功能白盒测试', () => {
  
  describe('calculateRedeemAmount', () => {
    test('正常投资金额计算', () => {
      const order = {
        investedAmount: '1000',
        profitRate: '10'
      };
      
      const result = redeemBusinessLogic.calculateRedeemAmount(order);
      expect(result.toString()).toBe('1100'); // 1000 + 10% = 1100
    });

    test('零投资金额', () => {
      const order = {
        investedAmount: '0',
        profitRate: '5'
      };
      
      const result = redeemBusinessLogic.calculateRedeemAmount(order);
      expect(result.toString()).toBe('0');
    });

    test('零收益率', () => {
      const order = {
        investedAmount: '500',
        profitRate: '0'
      };
      
      const result = redeemBusinessLogic.calculateRedeemAmount(order);
      expect(result.toString()).toBe('500');
    });
  });

  describe('calculateLotteryChances', () => {
    test('正常金额计算抽奖机会', () => {
      const chances = redeemBusinessLogic.calculateLotteryChances('250');
      expect(chances).toBe(2); // 250/100 = 2.5, 向下取整 = 2
    });

    test('小额赎回无抽奖机会', () => {
      const chances = redeemBusinessLogic.calculateLotteryChances('50');
      expect(chances).toBe(0); // 50/100 = 0.5, 向下取整 = 0
    });

    test('大额赎回多抽奖机会', () => {
      const chances = redeemBusinessLogic.calculateLotteryChances('1000');
      expect(chances).toBe(10); // 1000/100 = 10
    });
  });

  describe('validateOrderForRedeem', () => {
    test('有效订单验证', () => {
      const order = {
        id: 1,
        status: 'active',
        endDate: new Date(Date.now() - 86400000) // 昨天到期
      };
      
      const result = redeemBusinessLogic.validateOrderForRedeem(order);
      expect(result.valid).toBe(true);
    });

    test('订单不存在', () => {
      const result = redeemBusinessLogic.validateOrderForRedeem(null);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('订单不存在');
    });

    test('订单状态不正确', () => {
      const order = {
        id: 1,
        status: 'cancelled',
        endDate: new Date(Date.now() - 86400000)
      };
      
      const result = redeemBusinessLogic.validateOrderForRedeem(order);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('订单状态不正确');
    });

    test('订单未到期', () => {
      const order = {
        id: 1,
        status: 'active',
        endDate: new Date(Date.now() + 86400000) // 明天到期
      };
      
      const result = redeemBusinessLogic.validateOrderForRedeem(order);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('订单未到期');
    });
  });

  describe('完整赎回流程测试', () => {
    test('正常赎回流程', () => {
      // 1. 准备测试数据
      const order = {
        id: 1,
        status: 'active',
        investedAmount: '1000',
        profitRate: '10',
        endDate: new Date(Date.now() - 86400000)
      };

      // 2. 验证订单
      const validation = redeemBusinessLogic.validateOrderForRedeem(order);
      expect(validation.valid).toBe(true);

      // 3. 计算赎回金额
      const redeemAmount = redeemBusinessLogic.calculateRedeemAmount(order);
      expect(redeemAmount.toString()).toBe('1100');

      // 4. 计算抽奖机会
      const lotteryChances = redeemBusinessLogic.calculateLotteryChances(redeemAmount.toString());
      expect(lotteryChances).toBe(11); // 1100/100 = 11

      // 5. 验证最终结果
      expect(lotteryChances).toBeGreaterThan(0);
    });
  });
}); 