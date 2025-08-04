# Firebase推送服务配置说明

## 新项目配置

**项目ID已更新为：`bixu-chat-app`**

## 获取新的服务账号密钥

1. 登录 [Firebase Console](https://console.firebase.google.com)
2. 选择项目：`bixu-chat-app`
3. 进入 **项目设置** → **服务账号**
4. 点击 **生成新的私钥**
5. 下载 JSON 文件
6. 从 JSON 文件中提取以下信息：
   - `project_id`
   - `private_key`
   - `client_email`

## 配置信息

从新的Firebase服务账号JSON文件中提取的配置信息：

### 环境变量设置

在服务器上运行以下命令设置环境变量：

```bash
# 设置Firebase项目ID
export FIREBASE_PROJECT_ID="bixu-chat-app"

# 设置Firebase私钥（从新JSON文件中获取）
export FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n从新JSON文件中获取的私钥内容\n-----END PRIVATE KEY-----\n"

# 设置Firebase客户端邮箱（从新JSON文件中获取）
export FIREBASE_CLIENT_EMAIL="从新JSON文件中获取的客户端邮箱"
```

### 永久设置环境变量

将上述命令添加到 `~/.bashrc` 文件中：

```bash
echo 'export FIREBASE_PROJECT_ID="bixu-chat-app"' >> ~/.bashrc
echo 'export FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n从新JSON文件中获取的私钥内容\n-----END PRIVATE KEY-----\n"' >> ~/.bashrc
echo 'export FIREBASE_CLIENT_EMAIL="从新JSON文件中获取的客户端邮箱"' >> ~/.bashrc

# 重新加载配置
source ~/.bashrc
```

## 重启服务

设置环境变量后，重启Strapi服务：

```bash
cd /root/strapi-v5-ts
yarn develop
```

## 验证配置

重启后，查看日志中是否显示：

```
✅ Firebase配置完整，使用真实推送服务
```

而不是：

```
⚠️ Firebase配置不完整，使用模拟推送服务
```

## 测试推送功能

配置完成后，可以测试以下推送功能：

1. **充值成功推送**：用户充值到账时
2. **提现成功推送**：用户提现完成时
3. **系统公告推送**：后台发布公告时
4. **邀请奖励推送**：用户赎回投资时

## 注意事项

- 私钥信息敏感，请妥善保管
- 不要将私钥提交到代码仓库
- 建议使用环境变量而不是硬编码
- 确保新项目已启用 Cloud Messaging 服务 