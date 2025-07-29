// 自定义类型定义，用于解决 TypeScript 编译错误
declare module '@strapi/strapi' {
  export interface Strapi {
    entityService: {
      update<T = any>(
        uid: string,
        id: number | string,
        data: { data: Partial<T> }
      ): Promise<T>;
      findMany<T = any>(
        uid: string,
        params?: any
      ): Promise<T[]>;
      findOne<T = any>(
        uid: string,
        id: number | string,
        params?: any
      ): Promise<T>;
      create<T = any>(
        uid: string,
        data: { data: Partial<T> }
      ): Promise<T>;
      delete<T = any>(
        uid: string,
        id: number | string
      ): Promise<T>;
    };
  }
}

// 扩展全局类型
declare global {
  interface QianbaoYue {
    id: number;
    usdtYue: string;
    aiYue: string;
    aiTokenBalances: any;
    user: any;
    createdAt: string;
    updatedAt: string;
  }

  interface ChoujiangJiangpin {
    id: number;
    name: string;
    description?: string;
    jiangpinType: 'usdt' | 'ai_token' | 'physical' | 'virtual';
    value: number;
    zhongJiangLv: number;
    maxQuantity: number;
    currentQuantity: number;
    kaiQi: boolean;
    validUntil?: string;
  }

  interface ChoujiangJihui {
    id: number;
    user: any;
    jiangpin: any;
    count: number;
    usedCount: number;
    reason?: string;
    type: 'investment_redeem' | 'daily_login' | 'invitation' | 'admin_grant' | 'other';
    validUntil?: string;
    isActive: boolean;
    sourceOrder?: any;
  }

  interface DinggouDingdan {
    id: number;
    user: any;
    jihua: any;
    jiangli?: any;
    amount: number;
    principal: number;
    yield_rate: number;
    cycle_days: number;
    start_at: string;
    end_at: string;
    redeemed_at?: string;
    payout_amount?: number;
    status: 'pending' | 'running' | 'finished' | 'cancelled' | 'redeemable';
  }

  interface DinggouJihua {
    id: number;
    name: string;
    jihuaCode: string;
    description?: string;
    benjinUSDT: number;
    jingtaiBili: number;
    aiBili: number;
    zhouQiTian: number;
    start_date?: string;
    end_date?: string;
    max_slots: number;
    current_slots: number;
    kaiqi: boolean;
    lottery_chances: number;
    lottery_prize_id?: number;
    dingdanList?: any[];
  }
}

export {};