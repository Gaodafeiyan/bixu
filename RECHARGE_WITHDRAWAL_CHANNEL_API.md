# 充值提现通道系统 API 文档

## 📋 系统概述

充值提现通道系统是一个完整的资金通道解决方案，实现真实钱包与虚拟钱包之间的资金流转：

- **充值流程**: 用户转账到真实钱包 → 系统监控 → 更新虚拟余额
- **提现流程**: 用户申请提现 → 扣除虚拟余额 → 系统转账到用户地址

## 🔄 核心流程

### 充值流程
```
1. 用户发起充值 → 2. 创建充值订单 → 3. 获取收款地址
4. 用户转账 → 5. 系统监控钱包 → 6. 匹配订单
7. 更新虚拟余额 → 8. 完成充值
```

### 提现流程
```
1. 用户申请提现 → 2. 验证虚拟余额 → 3. 创建提现订单
4. 扣除虚拟余额 → 5. 系统执行转账 → 6. 更新订单状态
7. 完成提现
```

## 🚀 API 接口详情

### 充值通道管理

#### 1. 获取可用通道

**接口**: `GET /api/recharge-channels/available`

**描述**: 获取可用的充值/提现通道

**请求参数**:
```
type: 通道类型 (recharge/withdrawal/both) - 可选
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "BSC USDT通道",
      "network": "BSC",
      "asset": "USDT",
      "minAmount": "10.00",
      "maxAmount": "10000.00",
      "feeRate": "0.001",
      "fixedFee": "1.00"
    }
  ],
  "message": "获取通道列表成功"
}
```

#### 2. 创建充值订单

**接口**: `POST /api/recharge-channels/recharge`

**描述**: 创建充值订单，获取收款地址

**请求参数**:
```json
{
  "amount": "100.00",
  "channelId": 1
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "orderNo": "RC1703123456789123",
    "amount": "100.00",
    "receiveAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "expectedTime": "2024-01-01T12:30:00.000Z",
    "status": "pending"
  },
  "message": "充值订单创建成功"
}
```

#### 3. 创建提现订单

**接口**: `POST /api/recharge-channels/withdrawal`

**描述**: 创建提现订单

**请求参数**:
```json
{
  "amount": "50.00",
  "address": "0x1234567890123456789012345678901234567890",
  "network": "BSC"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "orderNo": "WD1703123456789123",
    "amount": "50.00",
    "actualAmount": "49.95",
    "fee": "0.05",
    "status": "pending",
    "requestTime": "2024-01-01T12:00:00.000Z"
  },
  "message": "提现订单创建成功"
}
```

### 订单管理

#### 4. 获取充值订单列表

**接口**: `GET /api/recharge-channels/recharge-orders`

**描述**: 获取用户的充值订单列表

**请求参数**:
```
page: 页码 (默认1)
pageSize: 每页数量 (默认10)
status: 订单状态 (可选)
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "orderNo": "RC1703123456789123",
        "amount": "100.00",
        "status": "completed",
        "receiveAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
        "txHash": "0x1234567890abcdef...",
        "createdAt": "2024-01-01T12:00:00.000Z",
        "completedTime": "2024-01-01T12:05:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "pageCount": 1,
      "total": 1
    }
  },
  "message": "获取充值订单成功"
}
```

#### 5. 获取提现订单列表

**接口**: `GET /api/recharge-channels/withdrawal-orders`

**描述**: 获取用户的提现订单列表

**请求参数**:
```
page: 页码 (默认1)
pageSize: 每页数量 (默认10)
status: 订单状态 (可选)
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "orderNo": "WD1703123456789123",
        "amount": "50.00",
        "actualAmount": "49.95",
        "status": "completed",
        "withdrawAddress": "0x1234567890123456789012345678901234567890",
        "txHash": "0xabcdef1234567890...",
        "createdAt": "2024-01-01T12:00:00.000Z",
        "completedTime": "2024-01-01T12:10:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "pageCount": 1,
      "total": 1
    }
  },
  "message": "获取提现订单成功"
}
```

#### 6. 获取充值订单详情

**接口**: `GET /api/recharge-channels/recharge-orders/:id`

**描述**: 获取充值订单详细信息

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNo": "RC1703123456789123",
    "amount": "100.00",
    "currency": "USDT",
    "status": "completed",
    "receiveAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "txHash": "0x1234567890abcdef...",
    "blockNumber": 12345678,
    "confirmations": 12,
    "expectedTime": "2024-01-01T12:30:00.000Z",
    "receivedTime": "2024-01-01T12:05:00.000Z",
    "completedTime": "2024-01-01T12:05:00.000Z",
    "actualAmount": "100.00",
    "channel": {
      "id": 1,
      "name": "BSC USDT通道",
      "network": "BSC"
    }
  },
  "message": "获取订单详情成功"
}
```

#### 7. 获取提现订单详情

**接口**: `GET /api/recharge-channels/withdrawal-orders/:id`

**描述**: 获取提现订单详细信息

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNo": "WD1703123456789123",
    "amount": "50.00",
    "currency": "USDT",
    "status": "completed",
    "withdrawAddress": "0x1234567890123456789012345678901234567890",
    "withdrawNetwork": "BSC",
    "txHash": "0xabcdef1234567890...",
    "blockNumber": 12345679,
    "confirmations": 12,
    "requestTime": "2024-01-01T12:00:00.000Z",
    "processTime": "2024-01-01T12:05:00.000Z",
    "completedTime": "2024-01-01T12:10:00.000Z",
    "fee": "0.05",
    "actualAmount": "49.95",
    "channel": {
      "id": 1,
      "name": "BSC USDT通道",
      "network": "BSC"
    }
  },
  "message": "获取订单详情成功"
}
```

#### 8. 取消充值订单

**接口**: `PUT /api/recharge-channels/recharge-orders/:id/cancel`

**描述**: 取消待处理的充值订单

**响应示例**:
```json
{
  "success": true,
  "message": "订单取消成功"
}
```

### 统计分析

#### 9. 获取充值统计

**接口**: `GET /api/recharge-channels/recharge-stats`

**描述**: 获取用户充值统计数据

**请求参数**:
```
days: 统计天数 (默认30)
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "totalAmount": "1000.00",
    "totalCount": 10,
    "averageAmount": "100.00"
  },
  "message": "获取充值统计成功"
}
```

#### 10. 获取提现统计

**接口**: `GET /api/recharge-channels/withdrawal-stats`

**描述**: 获取用户提现统计数据

**请求参数**:
```
days: 统计天数 (默认30)
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "totalAmount": "500.00",
    "totalFee": "5.00",
    "totalCount": 5,
    "averageAmount": "100.00"
  },
  "message": "获取提现统计成功"
}
```

## 📊 数据模型

### 充值通道 (recharge-channel)
```typescript
interface RechargeChannel {
  id: number;
  name: string;                    // 通道名称
  channelType: 'recharge' | 'withdrawal' | 'both';  // 通道类型
  status: 'active' | 'inactive' | 'maintenance';    // 状态
  walletAddress: string;           // 钱包地址
  network: 'BSC' | 'ETH' | 'TRON' | 'POLYGON';     // 网络
  asset: 'USDT' | 'USDC' | 'BTC' | 'ETH';          // 资产
  minAmount: string;               // 最小金额
  maxAmount: string;               // 最大金额
  dailyLimit: string;              // 日限额
  feeRate: string;                 // 费率
  fixedFee: string;                // 固定手续费
  confirmations: number;           // 确认数
  scanInterval: number;            // 扫描间隔
}
```

### 充值订单 (recharge-order)
```typescript
interface RechargeOrder {
  id: number;
  orderNo: string;                 // 订单号
  amount: string;                  // 充值金额
  currency: string;                // 货币类型
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  user: User;                      // 用户
  channel: RechargeChannel;        // 通道
  receiveAddress: string;          // 收款地址
  txHash?: string;                 // 交易哈希
  blockNumber?: number;            // 区块号
  confirmations?: number;          // 确认数
  expectedTime: Date;              // 预期时间
  receivedTime?: Date;             // 收到时间
  completedTime?: Date;            // 完成时间
  actualAmount: string;            // 实际金额
}
```

### 提现订单 (withdrawal-order)
```typescript
interface WithdrawalOrder {
  id: number;
  orderNo: string;                 // 订单号
  amount: string;                  // 提现金额
  currency: string;                // 货币类型
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'rejected';
  user: User;                      // 用户
  channel: RechargeChannel;        // 通道
  withdrawAddress: string;         // 提现地址
  withdrawNetwork: string;         // 提现网络
  txHash?: string;                 // 交易哈希
  blockNumber?: number;            // 区块号
  confirmations?: number;          // 确认数
  requestTime: Date;               // 申请时间
  processTime?: Date;              // 处理时间
  completedTime?: Date;            // 完成时间
  fee: string;                     // 手续费
  actualAmount: string;            // 实际金额
}
```

## ⚙️ 系统配置

### 定时任务配置
- **钱包监控**: 每30秒执行一次
- **提现处理**: 每60秒执行一次
- **投资到期检查**: 每5分钟执行一次

### 安全配置
- 所有API接口需要JWT认证
- 私钥信息使用private字段保护
- 地址格式验证
- 金额范围验证
- 日限额控制

### 费率配置
- 充值: 0手续费
- 提现: 固定手续费 + 比例手续费
- 可配置不同通道的费率

## 🔧 集成说明

### 前端集成
1. 调用充值接口获取收款地址
2. 显示二维码或地址给用户
3. 轮询订单状态
4. 充值完成后更新用户余额

### 区块链集成
1. 集成Web3.js或ethers.js
2. 配置RPC节点
3. 实现交易监控
4. 实现交易发送

### 监控告警
1. 钱包余额监控
2. 交易失败告警
3. 异常订单告警
4. 系统性能监控

## 🚨 注意事项

1. **安全性**: 私钥必须安全存储，不能暴露给前端
2. **并发处理**: 使用数据库事务确保数据一致性
3. **错误处理**: 完善的错误处理和回滚机制
4. **监控告警**: 实时监控系统状态和异常情况
5. **备份恢复**: 定期备份数据，制定恢复方案 