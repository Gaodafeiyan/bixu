# 🔧 区块链充值提现配置指南

## 📋 配置概述

本文档详细说明如何配置区块链充值提现功能，解决以下问题：
1. 充值通道配置缺失
2. 私钥未配置
3. 钱包余额为0

---

## 🚀 配置步骤

### 1. 环境变量配置

#### 1.1 创建环境变量文件
在项目根目录创建 `.env` 文件：

```bash
# 区块链配置
BSC_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
BSC_PRIVATE_KEY=your_private_key_here
BSC_RPC_URL=https://bsc-dataseed.binance.org/

# 数据库配置
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=bixu
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi

# JWT配置
JWT_SECRET=your_jwt_secret_here
ADMIN_JWT_SECRET=your_admin_jwt_secret_here

# 应用配置
HOST=0.0.0.0
PORT=1337
APP_KEYS=your_app_keys_here
API_TOKEN_SALT=your_api_token_salt_here
TRANSFER_TOKEN_SALT=your_transfer_token_salt_here
```

#### 1.2 获取BSC私钥
⚠️ **安全警告**: 私钥非常重要，请妥善保管！

```bash
# 方法1: 从现有钱包导出私钥
# 在MetaMask或其他钱包中导出私钥

# 方法2: 生成新钱包
# 使用Web3.js生成新钱包
node -e "
const Web3 = require('web3');
const account = new Web3().eth.accounts.create();
console.log('地址:', account.address);
console.log('私钥:', account.privateKey);
"
```

### 2. 充值通道配置

#### 2.1 通过API创建充值通道

```bash
# 创建BSC USDT充值通道
curl -X POST "http://118.107.4.158:1337/api/recharge-channels" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "name": "BSC USDT 充值通道",
      "channelType": "both",
      "status": "active",
      "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      "walletPrivateKey": "your_private_key_here",
      "network": "BSC",
      "asset": "USDT",
      "minAmount": "10.00",
      "maxAmount": "10000.00",
      "dailyLimit": "50000.00",
      "feeRate": "0.001",
      "fixedFee": "1.00",
      "confirmations": 12,
      "scanInterval": 30
    }
  }'
```

#### 2.2 通过Strapi管理后台配置

1. 访问管理后台: `http://118.107.4.158:1337/admin`
2. 登录管理员账户
3. 进入 "Content Manager" → "充值通道"
4. 点击 "Create new entry"
5. 填写配置信息：

```json
{
  "name": "BSC USDT 充值通道",
  "channelType": "both",
  "status": "active",
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "walletPrivateKey": "your_private_key_here",
  "network": "BSC",
  "asset": "USDT",
  "minAmount": "10.00",
  "maxAmount": "10000.00",
  "dailyLimit": "50000.00",
  "feeRate": "0.001",
  "fixedFee": "1.00",
  "confirmations": 12,
  "scanInterval": 30
}
```

### 3. 系统钱包充值

#### 3.1 向系统钱包充值USDT

```bash
# 使用钱包向系统地址转账USDT
# 地址: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
# 网络: BSC (Binance Smart Chain)
# 代币: USDT
```

#### 3.2 验证钱包余额

```bash
# 测试区块链服务
curl -X GET "http://118.107.4.158:1337/api/recharge-channels/test-blockchain" \
  -H "Content-Type: application/json"
```

### 4. 验证配置

#### 4.1 测试充值通道

```bash
# 获取可用通道
curl -X GET "http://118.107.4.158:1337/api/recharge-channels/available" \
  -H "Content-Type: application/json"

# 创建充值订单
curl -X POST "http://118.107.4.158:1337/api/recharge-channels/recharge" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": "100.00",
    "channelId": 1
  }'
```

#### 4.2 测试提现功能

```bash
# 创建提现订单
curl -X POST "http://118.107.4.158:1337/api/recharge-channels/withdrawal" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": "50.00",
    "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "network": "BSC"
  }'
```

---

## 🔧 配置参数说明

### 充值通道参数

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| name | string | 通道名称 | - |
| channelType | enum | 通道类型: recharge/withdrawal/both | both |
| status | enum | 状态: active/inactive/maintenance | active |
| walletAddress | string | 钱包地址 | - |
| walletPrivateKey | text | 钱包私钥(加密存储) | - |
| network | enum | 网络: BSC/ETH/TRON/POLYGON | BSC |
| asset | enum | 资产: USDT/USDC/BTC/ETH | USDT |
| minAmount | decimal | 最小金额 | 10.00 |
| maxAmount | decimal | 最大金额 | 10000.00 |
| dailyLimit | decimal | 日限额 | 50000.00 |
| feeRate | decimal | 手续费率 | 0.001 |
| fixedFee | decimal | 固定手续费 | 1.00 |
| confirmations | integer | 确认数 | 12 |
| scanInterval | integer | 扫描间隔(秒) | 30 |

### 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| BSC_WALLET_ADDRESS | BSC钱包地址 | 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 |
| BSC_PRIVATE_KEY | BSC钱包私钥 | 0x1234567890abcdef... |
| BSC_RPC_URL | BSC RPC节点 | https://bsc-dataseed.binance.org/ |

---

## 🛠️ 故障排除

### 1. 充值通道创建失败

**问题**: `Cannot read properties of undefined (reading 'id')`

**解决方案**:
1. 检查数据库连接
2. 确保Strapi服务正常运行
3. 验证API权限

```bash
# 检查服务状态
curl -X GET "http://118.107.4.158:1337/api/qianbao-yues/health"
```

### 2. 私钥配置问题

**问题**: `hasPrivateKey: false`

**解决方案**:
1. 检查环境变量是否正确设置
2. 重启Strapi服务
3. 验证私钥格式

```bash
# 重启服务
npm run develop

# 测试区块链服务
curl -X GET "http://118.107.4.158:1337/api/recharge-channels/test-blockchain"
```

### 3. 钱包余额为0

**问题**: `usdtBalance: "0"`

**解决方案**:
1. 向系统钱包地址转账USDT
2. 等待区块链确认
3. 检查USDT合约地址是否正确

```bash
# 检查钱包余额
curl -X GET "http://118.107.4.158:1337/api/recharge-channels/test-blockchain"
```

---

## 🔒 安全注意事项

### 1. 私钥安全
- ⚠️ 永远不要在代码中硬编码私钥
- 🔐 使用环境变量存储私钥
- 🛡️ 定期更换私钥
- 📁 备份私钥到安全位置

### 2. 网络安全
- 🔒 使用HTTPS
- 🚫 限制API访问权限
- 📊 监控异常交易
- 🔍 定期审计日志

### 3. 资金安全
- 💰 设置合理的日限额
- 🔄 定期检查钱包余额
- 📈 监控交易状态
- 🚨 设置异常告警

---

## 📞 技术支持

如果在配置过程中遇到问题，请：

1. 检查错误日志
2. 验证配置参数
3. 测试网络连接
4. 联系技术支持

**日志位置**: `logs/` 目录
**配置文件**: `.env` 文件
**管理后台**: `http://118.107.4.158:1337/admin`