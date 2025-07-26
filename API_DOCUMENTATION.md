# Bixu 认购系统 API 文档

## 📋 系统概述

Bixu 认购系统是一个完整的投资理财平台，包含以下核心功能：
- **钱包管理**: USDT和AI代币余额管理
- **认购计划**: 投资计划管理和参与
- **邀请系统**: 邀请码注册和团队管理
- **奖励机制**: 邀请奖励和投资收益

## 🔗 API 基础信息

- **Base URL**: `http://localhost:1337`
- **认证方式**: JWT Bearer Token
- **Content-Type**: `application/json`

## 📊 数据模型

### 1. 钱包余额 (qianbao-yue)

```typescript
interface QianbaoYue {
  id: number;
  usdtYue: string;          // USDT余额
  aiYue: string;            // AI代币余额
  aiTokenBalances: string;  // AI代币余额JSON格式
  user: User;               // 关联用户
  createdAt: string;
  updatedAt: string;
}
```

### 2. 认购计划 (dinggou-jihua)

```typescript
interface DinggouJihua {
  id: number;
  name: string;             // 计划名称
  max_slots: number;        // 最大槽位
  current_slots: number;    // 当前槽位
  jingtaiBili: string;      // 静态收益比例
  aiBili: string;          // AI代币奖励比例
  zhouQiTian: number;       // 周期天数
  kaiqi: boolean;          // 是否开启
  jihuaCode: string;        // 计划代码
  createdAt: string;
  updatedAt: string;
}
```

### 3. 认购订单 (dinggou-dingdan)

```typescript
interface DinggouDingdan {
  id: number;
  user: User;               // 关联用户
  jihua: DinggouJihua;      // 关联计划
  amount: string;           // 投资金额
  principal: string;        // 本金
  yield_rate: string;       // 收益率
  cycle_days: number;       // 周期天数
  start_at: string;         // 开始时间
  end_at: string;           // 结束时间
  status: 'pending' | 'running' | 'finished' | 'cancelled' | 'redeemable';
  createdAt: string;
  updatedAt: string;
}
```

### 4. 邀请奖励 (yaoqing-jiangli)

```typescript
interface YaoqingJiangli {
  id: number;
  shouyiUSDT: string;       // 奖励USDT
  tuijianRen: User;         // 推荐人
  laiyuanRen: User;         // 来源人
  laiyuanDan: DinggouDingdan; // 来源订单
  createdAt: string;
  updatedAt: string;
}
```

## 🚀 API 接口详情

### 认证相关

#### 1. 邀请注册

**接口**: `POST /api/auth/invite-register`

**描述**: 使用邀请码注册新用户

**请求参数**:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "inviteCode": "ABC123"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "inviteCode": "XYZ789"
  },
  "message": "注册成功"
}
```

#### 2. 获取我的邀请码

**接口**: `GET /api/auth/my-invite-code`

**描述**: 获取当前用户的邀请码

**请求头**: `Authorization: Bearer <token>`

**响应**:
```json
{
  "success": true,
  "data": {
    "inviteCode": "ABC123"
  }
}
```

#### 3. 获取我的团队

**接口**: `GET /api/auth/my-team?page=1&pageSize=10`

**描述**: 获取当前用户的团队信息

**请求头**: `Authorization: Bearer <token>`

**响应**:
```json
{
  "success": true,
  "data": {
    "directReferrals": [
      {
        "id": 2,
        "username": "user2",
        "email": "user2@example.com",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "indirectReferrals": [],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 1
    }
  }
}
```

#### 4. 验证邀请码

**接口**: `GET /api/auth/validate-invite-code/:inviteCode`

**描述**: 验证邀请码是否有效

**响应**:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "inviter": {
      "id": 1,
      "username": "inviter"
    }
  }
}
```

### 钱包相关

#### 1. 获取用户钱包

**接口**: `GET /api/qianbao-yues/user-wallet`

**描述**: 获取当前用户的钱包信息

**请求头**: `Authorization: Bearer <token>`

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "usdtYue": "1000.00",
    "aiYue": "50.00",
    "aiTokenBalances": "{}",
    "user": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 2. 更新钱包余额

**接口**: `PUT /api/qianbao-yues/update-wallet`

**描述**: 更新当前用户的钱包余额

**请求头**: `Authorization: Bearer <token>`

**请求参数**:
```json
{
  "usdtYue": "1500.00",
  "aiYue": "75.00"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "usdtYue": "1500.00",
    "aiYue": "75.00",
    "aiTokenBalances": "{}",
    "user": 1
  }
}
```

#### 3. 充值钱包

**接口**: `POST /api/qianbao-yues/recharge`

**描述**: 为用户钱包充值

**请求头**: `Authorization: Bearer <token>`

**请求参数**:
```json
{
  "data": {
    "user": 1,
    "usdtYue": "500.00",
    "aiYue": "25.00"
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "usdtYue": "2000.00",
    "aiYue": "100.00",
    "aiTokenBalances": "{}",
    "user": 1
  }
}
```

### 认购计划相关

#### 1. 获取认购计划列表

**接口**: `GET /api/dinggou-jihuas`

**描述**: 获取所有可用的认购计划

**响应**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "新手计划",
      "max_slots": 100,
      "current_slots": 50,
      "jingtaiBili": "0.06",
      "aiBili": "0.03",
      "zhouQiTian": 15,
      "kaiqi": true,
      "jihuaCode": "PLAN500"
    }
  ]
}
```

#### 2. 投资认购计划

**接口**: `POST /api/dinggou-jihuas/:planId/invest`

**描述**: 投资指定的认购计划

**请求头**: `Authorization: Bearer <token>`

**请求参数**:
```json
{
  "amount": "500.00"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user": 1,
    "jihua": 1,
    "amount": "500.00",
    "principal": "500.00",
    "yield_rate": "0.06",
    "cycle_days": 15,
    "start_at": "2024-01-01T00:00:00.000Z",
    "end_at": "2024-01-16T00:00:00.000Z",
    "status": "pending"
  },
  "message": "投资成功"
}
```

#### 3. 赎回投资

**接口**: `POST /api/dinggou-jihuas/:orderId/redeem`

**描述**: 赎回已完成的投资

**请求头**: `Authorization: Bearer <token>`

**响应**:
```json
{
  "success": true,
  "data": {
    "orderId": 1,
    "investmentAmount": "500.00",
    "staticYield": "12.33",
    "aiTokenYield": "0.00",
    "totalYield": "12.33",
    "totalPayout": "512.33"
  },
  "message": "赎回成功"
}
```

#### 4. 获取计划统计

**接口**: `GET /api/dinggou-jihuas/:planId/stats`

**描述**: 获取指定计划的统计信息

**请求头**: `Authorization: Bearer <token>`

**响应**:
```json
{
  "success": true,
  "data": {
    "planId": 1,
    "planName": "PLAN500",
    "totalInvestment": 25000,
    "totalParticipants": 50,
    "activeParticipants": 45,
    "completedParticipants": 5,
    "totalYield": 1500,
    "maxSlots": 100,
    "currentSlots": 50,
    "availableSlots": 50
  }
}
```

#### 5. 获取我的投资

**接口**: `GET /api/dinggou-jihuas/my-investments?page=1&pageSize=10`

**描述**: 获取当前用户的投资记录

**请求头**: `Authorization: Bearer <token>`

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "amount": "500.00",
      "status": "running",
      "start_at": "2024-01-01T00:00:00.000Z",
      "end_at": "2024-01-16T00:00:00.000Z",
      "jihua": {
        "id": 1,
        "name": "新手计划",
        "jihuaCode": "PLAN500"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 1
  }
}
```

### 订单相关

#### 1. 获取用户订单

**接口**: `GET /api/dinggou-dingdans/user-orders?page=1&pageSize=10&status=running`

**描述**: 获取当前用户的订单列表

**请求头**: `Authorization: Bearer <token>`

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "amount": "500.00",
      "status": "running",
      "jihua": {
        "id": 1,
        "name": "新手计划"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 1
  }
}
```

#### 2. 获取订单详情

**接口**: `GET /api/dinggou-dingdans/:orderId/detail`

**描述**: 获取指定订单的详细信息

**请求头**: `Authorization: Bearer <token>`

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "amount": "500.00",
    "principal": "500.00",
    "yield_rate": "0.06",
    "cycle_days": 15,
    "start_at": "2024-01-01T00:00:00.000Z",
    "end_at": "2024-01-16T00:00:00.000Z",
    "status": "running",
    "user": {
      "id": 1,
      "username": "testuser"
    },
    "jihua": {
      "id": 1,
      "name": "新手计划"
    }
  }
}
```

### 邀请奖励相关

#### 1. 创建邀请奖励

**接口**: `POST /api/yaoqing-jianglis/create-reward`

**描述**: 创建邀请奖励记录

**请求头**: `Authorization: Bearer <token>`

**请求参数**:
```json
{
  "data": {
    "tuijianRen": 1,
    "laiyuanRen": 2,
    "shouyiUSDT": "25.00",
    "laiyuanDan": 1
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "shouyiUSDT": "25.00",
    "tuijianRen": 1,
    "laiyuanRen": 2,
    "laiyuanDan": 1
  },
  "message": "邀请奖励创建成功"
}
```

#### 2. 获取用户邀请奖励

**接口**: `GET /api/yaoqing-jianglis/user-rewards?page=1&pageSize=10`

**描述**: 获取当前用户的邀请奖励记录

**请求头**: `Authorization: Bearer <token>`

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "shouyiUSDT": "25.00",
      "laiyuanRen": {
        "id": 2,
        "username": "user2"
      },
      "laiyuanDan": {
        "id": 1,
        "amount": "500.00"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 1
  }
}
```

#### 3. 获取团队统计

**接口**: `GET /api/yaoqing-jianglis/team-stats`

**描述**: 获取当前用户的团队统计信息

**请求头**: `Authorization: Bearer <token>`

**响应**:
```json
{
  "success": true,
  "data": {
    "directReferrals": 5,
    "indirectReferrals": 12,
    "totalTeamMembers": 17,
    "totalRewards": "125.00",
    "rewards": [...]
  }
}
```

## 🔧 系统配置

### 环境变量

```env
# 数据库配置
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=bixu
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password

# JWT配置
JWT_SECRET=your-jwt-secret

# 服务器配置
HOST=0.0.0.0
PORT=1337
```

### 定时任务

系统包含以下定时任务：
- **检查到期投资**: 每6小时执行一次，自动处理到期的投资订单

## 🚀 部署说明

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：
```bash
cp .env.example .env
# 编辑 .env 文件
```

3. 启动数据库：
```bash
# 确保数据库服务运行
```

4. 启动应用：
```bash
npm run develop
```

5. 访问管理后台：
```
http://localhost:1337/admin
```

## 📝 注意事项

1. 所有金额字段都使用字符串类型，避免浮点数精度问题
2. 投资完成后会自动处理邀请奖励
3. 用户注册时会自动创建钱包
4. 邀请码是唯一的，每个用户都有独立的邀请码
5. 系统支持多级推荐关系

## 🔒 安全说明

1. 所有敏感接口都需要JWT认证
2. 用户只能操作自己的数据
3. 金额计算使用Decimal.js避免精度问题
4. 输入数据会进行验证和过滤 