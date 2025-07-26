# Bixu 系统测试指南

本文档说明如何测试 Bixu 系统的各项功能。

## 前置条件

1. **启动 Strapi 服务器**
   ```bash
   cd bixu
   npm run develop
   # 或者
   yarn develop
   ```

2. **安装依赖**
   ```bash
   npm install axios decimal.js
   # 或者
   yarn add axios decimal.js
   ```

3. **获取管理员令牌**
   - 访问 `http://localhost:1337/admin`
   - 登录管理员账户
   - 在设置中生成 API 令牌
   - 设置环境变量：`export STRAPI_ADMIN_TOKEN=your-token-here`

## 测试步骤

### 1. 初始化测试数据

```bash
# 设置管理员令牌
export STRAPI_ADMIN_TOKEN=your-admin-token-here

# 初始化测试数据
node init-test-data.js init
```

这将创建：
- 3个测试认购计划（新手、进阶、高级）
- 3个测试用户账户
- 相应的邀请码

### 2. 运行系统功能测试

```bash
# 运行完整测试套件
node test-system.js
```

测试将按以下顺序执行：
1. 邀请码验证
2. 用户注册
3. 钱包操作
4. 认购计划查询
5. 投资功能
6. 订单查询
7. 邀请奖励
8. 计划统计
9. 赎回功能

### 3. 清理测试数据

```bash
# 清理所有测试数据
node init-test-data.js clean
```

## 测试用例详解

### 邀请码验证测试
- 测试无效邀请码的拒绝
- 测试有效邀请码的接受

### 用户注册测试
- 使用邀请码注册新用户
- 验证用户信息创建
- 验证钱包自动创建

### 钱包功能测试
- 获取用户钱包信息
- 钱包充值操作
- 余额计算验证

### 认购计划测试
- 获取可用计划列表
- 验证计划详细信息
- 检查计划状态

### 投资功能测试
- 创建投资订单
- 验证钱包扣款
- 检查订单状态更新

### 订单查询测试
- 获取用户订单列表
- 查询投资历史
- 验证订单详情

### 邀请奖励测试
- 获取用户邀请码
- 查询团队信息
- 检查邀请奖励记录

### 计划统计测试
- 获取计划参与统计
- 验证数据准确性

### 赎回功能测试
- 测试订单赎回
- 验证收益计算
- 检查钱包更新

## 预期测试结果

### 成功情况
- ✅ 所有API调用返回200状态码
- ✅ 数据创建和查询正常
- ✅ 业务逻辑计算正确
- ✅ 关联关系建立成功

### 可能的问题
- ❌ 数据库连接失败
- ❌ API路由未正确配置
- ❌ 权限验证失败
- ❌ 业务逻辑错误

## 故障排除

### 常见问题

1. **连接被拒绝**
   ```
   确保 Strapi 服务器正在运行在 http://localhost:1337
   ```

2. **认证失败**
   ```
   检查 STRAPI_ADMIN_TOKEN 是否正确设置
   确保令牌具有足够权限
   ```

3. **路由不存在**
   ```
   检查 API 路由是否正确配置
   确保所有控制器都已创建
   ```

4. **数据库错误**
   ```
   检查数据库连接配置
   确保所有内容类型都已创建
   ```

### 调试技巧

1. **查看详细日志**
   ```bash
   # 在 Strapi 开发模式下查看详细日志
   npm run develop
   ```

2. **检查数据库**
   ```bash
   # 使用 Strapi 管理面板查看数据
   http://localhost:1337/admin
   ```

3. **API 文档**
   ```bash
   # 查看自动生成的 API 文档
   http://localhost:1337/documentation
   ```

## 性能测试

### 并发测试
```bash
# 可以修改测试脚本进行并发测试
# 在 test-system.js 中添加并发用户测试
```

### 压力测试
```bash
# 使用工具如 Apache Bench 进行压力测试
ab -n 1000 -c 10 http://localhost:1337/api/qianbao-yues
```

## 安全测试

### 权限验证
- 测试未认证用户的访问限制
- 验证用户只能访问自己的数据
- 检查管理员权限的正确性

### 输入验证
- 测试恶意输入的处理
- 验证数据类型的正确性
- 检查SQL注入防护

## 持续集成

可以将测试脚本集成到 CI/CD 流程中：

```yaml
# .github/workflows/test.yml
name: Test Bixu System
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Start Strapi
        run: npm run develop &
      - name: Wait for server
        run: sleep 30
      - name: Run tests
        run: node test-system.js
```

## 测试报告

测试完成后，系统会输出详细的测试报告，包括：
- 测试用例执行状态
- 成功/失败统计
- 错误详情
- 性能指标

## 维护

定期更新测试脚本以反映系统变化：
- 添加新的API端点测试
- 更新测试数据
- 优化测试性能
- 增加边界条件测试 