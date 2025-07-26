# 服务器端修复指南

## 🚨 当前问题
在服务器上运行 `yarn develop` 时遇到以下错误：
- 缺少 `decimal.js` 依赖
- TypeScript类型错误
- 字段名不匹配问题

## 🔧 修复步骤

### 方法1：使用修复脚本（推荐）
```bash
# 给脚本执行权限
chmod +x fix-errors.sh

# 运行修复脚本
./fix-errors.sh
```

### 方法2：手动修复

#### 1. 安装缺失的依赖
```bash
cd /root/strapi-v5-ts
yarn add decimal.js
```

#### 2. 清理构建缓存
```bash
yarn build --clean
```

#### 3. 重新生成类型定义
```bash
yarn strapi ts:generate-types
```

#### 4. 重新启动开发服务器
```bash
yarn develop
```

## 📝 修复内容说明

### 1. 依赖问题
- ✅ 添加了 `decimal.js` 到 `package.json`
- ✅ 用于精确的金融计算

### 2. TypeScript类型错误
- ✅ 修复了 `entityService.update` 的 `data` 包装问题
- ✅ 修复了字段名不匹配问题
- ✅ 修复了数组类型错误

### 3. 具体修复的文件
- `src/api/dinggou-dingdan/controllers/dinggou-dingdan.ts`
- `src/api/dinggou-jihua/controllers/dinggou-jihua.ts`
- `src/api/qianbao-yue/controllers/qianbao-yue.ts`
- `src/api/yaoqing-jiangli/controllers/yaoqing-jiangli.ts`
- `src/services/investment-service.ts`

## 🚀 验证修复

修复完成后，运行以下命令验证：
```bash
yarn develop
```

应该看到：
```
✔ Cleaning dist dir
✔ Building build context
✔ Creating admin
✔ Starting server
```

## 📋 常见问题

### Q: 如果还有类型错误怎么办？
A: 运行 `yarn strapi ts:generate-types` 重新生成类型定义

### Q: 如果依赖安装失败怎么办？
A: 删除 `node_modules` 和 `yarn.lock`，然后重新安装：
```bash
rm -rf node_modules yarn.lock
yarn install
```

### Q: 如果构建失败怎么办？
A: 清理缓存后重新构建：
```bash
yarn build --clean
```

## 🎯 预期结果

修复成功后，您应该能够：
- ✅ 正常启动Strapi开发服务器
- ✅ 访问管理后台 (http://localhost:1337/admin)
- ✅ 使用所有API接口
- ✅ 运行测试脚本

## 📞 如果问题仍然存在

如果修复后仍有问题，请检查：
1. Node.js版本是否符合要求 (>=18.0.0 <=20.x.x)
2. 网络连接是否正常
3. 磁盘空间是否充足
4. 查看详细错误日志：`yarn develop --debug` 