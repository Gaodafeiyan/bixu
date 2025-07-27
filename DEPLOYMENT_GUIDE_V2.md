# Bixu 邀请奖励制度V2 部署指南

## 📋 部署概述

本次部署实现了全新的邀请奖励制度V2，采用按上级档位封顶计算的方式，包含以下核心功能：

### 🎯 新功能特性
- **档位封顶计算**: 按上级当前最高有效档位计算邀请奖励
- **四个投资档位**: PLAN 500/1K/2K/5K，每个档位有不同的返佣系数
- **精确计算**: 使用Decimal.js确保计算精度
- **详细记录**: 记录计算过程和档位信息
- **完整API**: 提供完整的邀请奖励管理接口

## 🚀 部署步骤

### 1. 服务器环境准备

```bash
# 确保Node.js版本 >= 18.0.0
node --version

# 确保npm版本 >= 6.0.0
npm --version

# 检查Strapi版本
npm list @strapi/strapi
```

### 2. 代码部署

```bash
# 进入项目目录
cd /path/to/bixu

# 拉取最新代码
git pull origin main

# 安装依赖
npm install

# 构建项目
npm run build
```

### 3. 数据库迁移

由于新增了邀请奖励相关字段，需要执行数据库迁移：

```bash
# 启动Strapi（会自动执行迁移）
npm run develop

# 或者手动执行迁移
npm run strapi database:migrate
```

### 4. 验证部署

#### A. 检查服务状态
```bash
# 检查Strapi服务是否正常启动
curl http://localhost:1337/api/health

# 检查邀请奖励档位配置
curl http://localhost:1337/api/yaoqing-jianglis/reward-tiers
```

#### B. 运行测试脚本
```bash
# 运行邀请奖励制度V2测试
node test-invitation-reward-v2.js
```

## 📊 邀请奖励制度V2 配置

### 档位配置详情

| 档位名称 | 档位本金 | 静态收益率 | 返佣系数 | 可计佣上限 | 计算公式 |
|---------|---------|-----------|---------|-----------|---------|
| PLAN 500 | 500 USDT | 6% | 100% | ≤ 500 | min(子级本金, 500) × 6% × 100% |
| PLAN 1K | 1,000 USDT | 7% | 90% | ≤ 1,000 | min(子级本金, 1,000) × 7% × 90% |
| PLAN 2K | 2,000 USDT | 8% | 80% | ≤ 2,000 | min(子级本金, 2,000) × 8% × 80% |
| PLAN 5K | 5,000 USDT | 10% | 70% | ≤ 5,000 | min(子级本金, 5,000) × 10% × 70% |

### 计算示例

1. **邀请人持有PLAN 5K档位，被邀请人投资2,000 USDT**
   - 可计佣本金: min(2,000, 5,000) = 2,000
   - 奖励金额: 2,000 × 10% × 70% = 140 USDT

2. **邀请人持有PLAN 1K档位，被邀请人投资5,000 USDT**
   - 可计佣本金: min(5,000, 1,000) = 1,000
   - 奖励金额: 1,000 × 7% × 90% = 63 USDT

## 🔧 新增API接口

### 1. 获取邀请奖励档位配置
```
GET /api/yaoqing-jianglis/reward-tiers
```

### 2. 创建邀请奖励（V2版本）
```
POST /api/yaoqing-jianglis/create-reward-v2
```

### 3. 获取团队统计（V2版本）
```
GET /api/yaoqing-jianglis/team-stats-v2
```

### 4. 获取订单邀请奖励
```
GET /api/yaoqing-jianglis/order/:orderId/reward
```

## 📝 数据模型更新

### 邀请奖励表新增字段
- `calculation`: 计算过程说明
- `parentTier`: 推荐人档位名称
- `childPrincipal`: 下级投资本金
- `commissionablePrincipal`: 可计佣本金
- `rewardLevel`: 奖励层级
- `rewardType`: 奖励类型

## 🔍 监控和日志

### 关键日志位置
```bash
# 查看邀请奖励处理日志
tail -f logs/strapi.log | grep "邀请奖励"

# 查看投资完成处理日志
tail -f logs/strapi.log | grep "投资完成处理"
```

### 监控指标
- 邀请奖励生成成功率
- 各档位奖励分布
- 团队规模统计
- 钱包余额变化

## ⚠️ 注意事项

### 1. 数据兼容性
- 旧版本的邀请奖励记录仍然保留
- 新字段为可选字段，不会影响现有数据

### 2. 性能考虑
- 档位查询会检查用户所有活跃订单
- 建议定期清理过期的订单数据

### 3. 安全考虑
- 所有API接口都需要用户认证
- 邀请奖励计算在服务器端进行，确保安全性

## 🧪 测试验证

### 自动化测试
```bash
# 运行完整测试流程
node test-invitation-reward-v2.js
```

### 手动测试步骤
1. 创建邀请人和被邀请人账户
2. 为邀请人充值并投资到指定档位
3. 为被邀请人充值并投资
4. 模拟订单到期
5. 验证邀请奖励是否正确生成

## 📞 技术支持

如遇到部署问题，请检查：
1. Node.js和npm版本是否符合要求
2. 数据库连接是否正常
3. 依赖包是否正确安装
4. 日志文件中是否有错误信息

## 🎉 部署完成

部署完成后，新的邀请奖励制度V2将自动生效，所有新的投资订单到期时都会按照新的档位封顶计算方式生成邀请奖励。 