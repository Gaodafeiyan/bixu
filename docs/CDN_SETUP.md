# CDN + 对象存储设置指南

## 概述

为了优化APK下载性能并降低服务器流量成本，我们使用CDN + 对象存储的方案。

## 方案对比

### 之前：直接服务器下载
```
用户 → 服务器 → 60MB APK文件
- 每次下载消耗60MB出网流量
- 服务器带宽压力大
- 成本高：流量包计费
```

### 现在：CDN + 对象存储
```
用户 → CDN边缘节点 → 对象存储
- 首次回源，后续缓存
- 全球加速，就近访问
- 成本低：按量计费，价格便宜
```

## 推荐方案：阿里云OSS + CDN

### 1. 创建OSS存储桶

```bash
# 在阿里云控制台创建存储桶
Bucket名称: zenithus-cdn
地域: 华东1（杭州）
存储类型: 标准存储
读写权限: 公共读
```

### 2. 上传APK文件

```bash
# 上传APK到OSS
ossutil cp app-release.apk oss://zenithus-cdn/app-release.apk

# 设置文件头
ossutil set-meta oss://zenithus-cdn/app-release.apk \
  "Content-Type=application/vnd.android.package-archive" \
  "Content-Disposition=attachment; filename=\"zenithus-v1.10.apk\""
```

### 3. 配置CDN加速

```bash
# 在阿里云CDN控制台添加加速域名
加速域名: zenithus-cdn.oss-cn-hangzhou.aliyuncs.com
源站类型: OSS域名
源站地址: zenithus-cdn.oss-cn-hangzhou.aliyuncs.com
```

### 4. 环境变量配置

```bash
# 在服务器上设置环境变量
export APK_CDN_URL="https://zenithus-cdn.oss-cn-hangzhou.aliyuncs.com/app-release.apk"
export APK_FALLBACK_URL="https://zenithus.app/downloads/app-release.apk"
```

## 备用方案：腾讯云COS + CDN

### 1. 创建COS存储桶

```bash
# 在腾讯云控制台创建存储桶
存储桶名称: zenithus-cdn-1250000000
地域: 北京
访问权限: 公有读私有写
```

### 2. 上传APK文件

```bash
# 使用COSBrowser或API上传
coscmd upload app-release.apk zenithus-cdn-1250000000/app-release.apk
```

### 3. 配置CDN

```bash
# 在腾讯云CDN控制台添加域名
加速域名: zenithus-cdn-1250000000.cos.ap-beijing.myqcloud.com
源站类型: COS域名
```

## 成本对比

### 直接服务器下载
- **流量成本**: 60MB × 下载次数 × 0.8元/GB
- **示例**: 1000次下载 = 60GB × 0.8元 = 48元

### CDN + 对象存储
- **OSS存储**: 60MB × 0.12元/GB/月 = 0.0072元/月
- **CDN流量**: 60MB × 1000次 × 0.2元/GB = 12元
- **总成本**: 约12元（节省75%）

## 性能优化

### 1. 缓存策略
```javascript
// 设置缓存头
ctx.set('Cache-Control', 'public, max-age=3600'); // 1小时缓存
ctx.set('ETag', '"zenithus-v1.10"'); // 实体标签
```

### 2. 压缩优化
```bash
# 启用Gzip压缩
ossutil set-meta oss://zenithus-cdn/app-release.apk \
  "Content-Encoding=gzip"
```

### 3. 多区域部署
```javascript
// 支持多区域CDN
const cdnUrls = {
  'cn-hangzhou': 'https://zenithus-cdn.oss-cn-hangzhou.aliyuncs.com/app-release.apk',
  'cn-beijing': 'https://zenithus-cdn-1250000000.cos.ap-beijing.myqcloud.com/app-release.apk',
  'us-west-1': 'https://zenithus-cdn.s3-us-west-1.amazonaws.com/app-release.apk'
};
```

## 监控和统计

### 1. 下载统计
```javascript
// 记录下载行为
console.log('下载记录:', {
  userId: userId || 'anonymous',
  downloadType: 'apk',
  userAgent: ctx.request.headers['user-agent'],
  ip: ctx.request.ip,
  timestamp: new Date().toISOString(),
  cdnUrl: cdnUrl
});
```

### 2. CDN监控
- 访问量统计
- 带宽使用情况
- 缓存命中率
- 错误率监控

## 故障处理

### 1. CDN不可用时的备用方案
```javascript
// 检查CDN可用性
const isCdnAvailable = await checkCdnAvailability();
const downloadUrl = isCdnAvailable ? cdnUrl : fallbackUrl;
```

### 2. 自动切换机制
```javascript
// 如果CDN响应慢，自动切换到备用
if (responseTime > 5000) {
  ctx.set('Location', fallbackUrl);
}
```

## 部署步骤

### 1. 准备APK文件
```bash
# 确保APK文件存在
ls -la app-release.apk
# 检查文件大小
du -h app-release.apk
```

### 2. 上传到对象存储
```bash
# 阿里云OSS
ossutil cp app-release.apk oss://zenithus-cdn/app-release.apk

# 或腾讯云COS
coscmd upload app-release.apk zenithus-cdn-1250000000/app-release.apk
```

### 3. 配置CDN
- 在云服务商控制台配置CDN
- 设置缓存规则
- 配置HTTPS证书

### 4. 更新代码
```bash
# 提交代码更改
git add .
git commit -m "优化APK下载：使用CDN + 对象存储"
git push
```

### 5. 测试验证
```bash
# 测试下载链接
curl -I https://zenithus-cdn.oss-cn-hangzhou.aliyuncs.com/app-release.apk

# 测试重定向
curl -L https://zenithus.app/api/auth/download-apk
```

## 总结

通过使用CDN + 对象存储的方案，我们可以：

✅ **降低成本**: 节省75%的流量成本  
✅ **提升性能**: 全球加速，就近访问  
✅ **增强可靠性**: 多区域部署，自动故障切换  
✅ **简化维护**: 自动缓存，减少服务器压力  

这是一个非常值得实施的优化方案！
