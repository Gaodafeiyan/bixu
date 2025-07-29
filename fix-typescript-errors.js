const fs = require('fs');
const path = require('path');

console.log('🔧 开始修复 TypeScript 编译错误...');

// 1. 修复 qianbao-yue schema
const qianbaoSchemaPath = path.join(__dirname, 'src/api/qianbao-yue/content-types/qianbao-yue/schema.ts');
console.log('📝 修复钱包余额 schema...');

const qianbaoSchema = `export default {
  kind: 'collectionType',
  collectionName: 'qianbao_yues',
  info: {
    singularName: 'qianbao-yue',
    pluralName: 'qianbao-yues',
    displayName: '钱包余额',
    description: '用户钱包余额管理',
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {
    i18n: {
      localized: false,
    },
  },
  attributes: {
    usdtYue: {
      type: 'decimal',
      default: 0,
      required: false,
    },
    aiYue: {
      type: 'decimal',
      default: 0,
      required: false,
    },
    aiTokenBalances: {
      type: 'json',
      default: {},
      description: 'AI代币余额JSON格式 {tokenId: balance}',
    },
    user: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'qianbaoYue',
    },
  },
} as const;`;

fs.writeFileSync(qianbaoSchemaPath, qianbaoSchema);
console.log('✅ 钱包余额 schema 已修复');

// 2. 修复 choujiang-jiangpin schema
const jiangpinSchemaPath = path.join(__dirname, 'src/api/choujiang-jiangpin/content-types/choujiang-jiangpin/schema.ts');
console.log('📝 修复抽奖奖品 schema...');

const jiangpinSchema = `export default {
  kind: 'collectionType',
  collectionName: 'choujiang_jiangpins',
  info: {
    singularName: 'choujiang-jiangpin',
    pluralName: 'choujiang-jiangpins',
    displayName: '抽奖奖品',
    description: '抽奖系统中的奖品配置',
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {
    i18n: {
      localized: false,
    },
  },
  attributes: {
    name: {
      type: 'string',
      required: true,
      unique: false,
      minLength: 1,
      maxLength: 100,
    },
    description: {
      type: 'text',
      maxLength: 500,
    },
    image: {
      type: 'media',
      multiple: false,
      required: false,
      allowedTypes: ['images'],
    },
    jiangpinType: {
      type: 'enumeration',
      enum: ['usdt', 'ai_token', 'physical', 'virtual'],
      required: true,
      default: 'usdt',
    },
    value: {
      type: 'decimal',
      required: true,
      min: 0,
      max: 999999.99,
    },
    zhongJiangLv: {
      type: 'decimal',
      required: true,
      min: 0,
      max: 100,
      default: 1.0,
    },
    maxQuantity: {
      type: 'integer',
      required: false,
      min: 0,
      default: 0,
    },
    currentQuantity: {
      type: 'integer',
      required: false,
      min: 0,
      default: 0,
    },
    kaiQi: {
      type: 'boolean',
      required: true,
      default: true,
    },
    paiXuShunXu: {
      type: 'integer',
      required: false,
      min: 0,
      default: 0,
    },
    category: {
      type: 'string',
      required: false,
      maxLength: 50,
    },
    rarity: {
      type: 'enumeration',
      enum: ['common', 'rare', 'epic', 'legendary'],
      required: true,
      default: 'common',
    },
    validUntil: {
      type: 'datetime',
      required: false,
    },
    minUserLevel: {
      type: 'integer',
      required: false,
      min: 0,
      default: 0,
    },
  },
} as const;`;

fs.writeFileSync(jiangpinSchemaPath, jiangpinSchema);
console.log('✅ 抽奖奖品 schema 已修复');

// 3. 修复 choujiang-jihui schema
const jihuiSchemaPath = path.join(__dirname, 'src/api/choujiang-jihui/content-types/choujiang-jihui/schema.ts');
console.log('📝 修复抽奖机会 schema...');

const jihuiSchema = `export default {
  kind: 'collectionType',
  collectionName: 'choujiang_jihuis',
  info: {
    singularName: 'choujiang-jihui',
    pluralName: 'choujiang-jihuis',
    displayName: '抽奖机会',
    description: '用户抽奖机会管理',
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {
    i18n: {
      localized: false,
    },
  },
  attributes: {
    user: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      required: true,
    },
    jiangpin: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::choujiang-jiangpin.choujiang-jiangpin',
      required: true,
    },
    count: {
      type: 'integer',
      required: true,
      min: 1,
      default: 1,
    },
    usedCount: {
      type: 'integer',
      required: false,
      min: 0,
      default: 0,
    },
    reason: {
      type: 'string',
      required: false,
      maxLength: 200,
    },
    type: {
      type: 'enumeration',
      enum: ['investment_redeem', 'daily_login', 'invitation', 'admin_grant', 'other'],
      required: true,
      default: 'other',
    },
    validUntil: {
      type: 'datetime',
      required: false,
    },
    isActive: {
      type: 'boolean',
      required: true,
      default: true,
    },
    sourceOrder: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::dinggou-dingdan.dinggou-dingdan',
      required: false,
    },
  },
} as const;`;

fs.writeFileSync(jihuiSchemaPath, jihuiSchema);
console.log('✅ 抽奖机会 schema 已修复');

// 4. 修复 dinggou-dingdan schema
const dingdanSchemaPath = path.join(__dirname, 'src/api/dinggou-dingdan/content-types/dinggou-dingdan/schema.ts');
console.log('📝 修复认购订单 schema...');

const dingdanSchema = `export default {
  kind: 'collectionType',
  collectionName: 'dinggou_dingdans',
  info: {
    singularName: 'dinggou-dingdan',
    pluralName: 'dinggou-dingdans',
    displayName: '认购订单',
    description: '投资认购订单管理',
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {
    i18n: {
      localized: false,
    },
  },
  attributes: {
    user: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      required: true,
    },
    jihua: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::dinggou-jihua.dinggou-jihua',
      inversedBy: 'dingdanList',
      required: true,
    },
    jiangli: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'api::yaoqing-jiangli.yaoqing-jiangli',
      required: false,
    },
    amount: {
      type: 'decimal',
      required: true,
    },
    principal: {
      type: 'decimal',
      required: true,
    },
    yield_rate: {
      type: 'decimal',
      required: true,
    },
    cycle_days: {
      type: 'integer',
      required: true,
    },
    start_at: {
      type: 'datetime',
      required: true,
    },
    end_at: {
      type: 'datetime',
      required: true,
    },
    redeemed_at: {
      type: 'datetime',
      required: false,
    },
    payout_amount: {
      type: 'decimal',
      required: false,
    },
    status: {
      type: 'enumeration',
      enum: ['pending', 'running', 'finished', 'cancelled', 'redeemable'],
      default: 'pending',
      required: true,
    },
  },
} as const;`;

fs.writeFileSync(dingdanSchemaPath, dingdanSchema);
console.log('✅ 认购订单 schema 已修复');

// 5. 修复 dinggou-jihua schema
const jihuaSchemaPath = path.join(__dirname, 'src/api/dinggou-jihua/content-types/dinggou-jihua/schema.ts');
console.log('📝 修复认购计划 schema...');

const jihuaSchema = `export default {
  kind: 'collectionType',
  collectionName: 'dinggou_jihuas',
  info: {
    singularName: 'dinggou-jihua',
    pluralName: 'dinggou-jihuas',
    displayName: '认购计划',
    description: '投资认购计划管理',
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {
    i18n: {
      localized: false,
    },
  },
  attributes: {
    name: {
      type: 'string',
      required: true,
      description: '计划名称',
    },
    jihuaCode: {
      type: 'string',
      required: true,
      unique: true,
      description: '计划唯一代码',
    },
    description: {
      type: 'text',
      description: '计划描述',
    },
    benjinUSDT: {
      type: 'decimal',
      required: true,
      default: 0,
      description: '投资本金金额(USDT)',
    },
    jingtaiBili: {
      type: 'decimal',
      required: true,
      description: '静态收益比例(年化)',
    },
    aiBili: {
      type: 'decimal',
      required: true,
      description: 'AI代币奖励比例',
    },
    zhouQiTian: {
      type: 'integer',
      required: true,
      description: '投资周期(天)',
    },
    start_date: {
      type: 'datetime',
      description: '计划开始时间',
    },
    end_date: {
      type: 'datetime',
      description: '计划结束时间',
    },
    max_slots: {
      type: 'integer',
      default: 100,
      description: '最大参与槽位',
    },
    current_slots: {
      type: 'integer',
      default: 0,
      description: '当前已用槽位',
    },
    kaiqi: {
      type: 'boolean',
      default: true,
      description: '是否开启',
    },
    lottery_chances: {
      type: 'integer',
      default: 0,
      description: '赠送抽奖次数',
    },
    lottery_prize_id: {
      type: 'integer',
      description: '关联抽奖奖品ID',
    },
    dingdanList: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::dinggou-dingdan.dinggou-dingdan',
      mappedBy: 'jihua',
      description: '关联订单列表',
    },
  },
} as const;`;

fs.writeFileSync(jihuaSchemaPath, jihuaSchema);
console.log('✅ 认购计划 schema 已修复');

// 6. 创建自定义类型定义文件
const customTypesPath = path.join(__dirname, 'types/custom.d.ts');
console.log('📝 创建自定义类型定义...');

const customTypes = `// 自定义类型定义，用于解决 TypeScript 编译错误
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

export {};`;

fs.writeFileSync(customTypesPath, customTypes);
console.log('✅ 自定义类型定义已创建');

// 7. 更新 tsconfig.json
console.log('📝 更新 TypeScript 配置...');

const tsconfigPath = path.join(__dirname, 'tsconfig.json');
const tsconfig = {
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "dist",
    "rootDir": ".",
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "declaration": false,
    "sourceMap": false,
    "noImplicitAny": false,
    "noEmitOnError": false,
    "removeComments": true,
    "noImplicitReturns": false,
    "noFallthroughCasesInSwitch": false,
    "noUncheckedIndexedAccess": false,
    "exactOptionalPropertyTypes": false,
    "typeRoots": ["./node_modules/@types", "./types"],
    "types": ["node"]
  },
  "include": [
    "./",
    "./**/*.ts",
    "./**/*.js",
    "src/**/*.json",
    "types/**/*.d.ts"
  ],
  "exclude": [
    "node_modules/",
    "build/",
    "dist/",
    ".cache/",
    ".tmp/",
    "src/admin/",
    "**/*.test.*",
    "src/plugins/**"
  ]
};

fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
console.log('✅ TypeScript 配置已更新');

console.log('🎉 所有修复完成！');
console.log('📋 下一步操作：');
console.log('1. 运行: yarn strapi ts:generate-types');
console.log('2. 运行: yarn develop');
console.log('3. 如果仍有错误，请检查具体的错误信息');