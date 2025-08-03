# Firebase推送服务配置说明

## 配置信息

从Firebase服务账号JSON文件中提取的配置信息：

### 环境变量设置

在服务器上运行以下命令设置环境变量：

```bash
# 设置Firebase项目ID
export FIREBASE_PROJECT_ID="bixu-push-notifications"

# 设置Firebase私钥
export FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDHu2asWT477j1W\ntSGGt153JrNtUDK/a2q/edvy6O6JaKkrq/xoTdgKAuTr3iQEoytZRAKD6Z/6KwPg\nKVA3u61bO0GZByZ0H4VrWmDERCXfjWiQXZ2DtbbG1PHUdSzuBlsRhQfSUmUz9XV2\nq7vk1W5FiAXZrk8dWHzy8691cQtJKYA7IfiIBnbU7pvlimH8rVdZMHO1aQaq8AUq\nOVeGUoggKzyv5X/i9+hgfIG3Bvv3mUxXU8eOm7PcdUUDdN5xuTM1qttmSK1QlbN+\n3Y5j+MQp1DTsc1KdgkesKgKzvBr87GiB3rZ4KzA5Ud7Fym2xL4GARy7S2hezy5xE\n1rPVIEYBAgMBAAECggEAC/EMwCHh0lbPJ1+oWSlI0O+TwLsPyFlqxiH0tZREVsYs\nKdFG7mbhE3rS0bYJX0Gbi43BEhP7cvX0GF3qpDposKYH/ldAGadHedYAfRuPTCC5\n72UO0DDNdHEyOD/9PLSik0Hp6CLxrBFGlvQeRXNBUY+YEfNrBYJ541Nl2oFfabNM\nyaksLJoXXr8KF4wMJ/yomBZcr8VFrewZ5R84EpImoj7hqAaYA1meUXJkNUZ1q/7f\nl/ON9JFNmTghNBZiDnzvmv3LHnF/2CBHUkCTfeMGGOdbMNdPmNZUKCZdO8GLqhKj\nq4mScDmT5UQ0kGP6Q4EQ+MAt9eCJxF8ET6zltzkNtQKBgQDqmDqhoEtNhPW/gDp8\n3S0bMjsz3Pxexxy1AUFSm+3obrF7ucfEpq/gpR7TaG4JcKh6wPEgD9WRs25nnRG0\nfwYXrw0jQChtS0t+sjVffH/w1sYVnbAB4BH37+G/kY68b8wFG3WT1NJ5iA1sQl47\nR6PY+9KOAX7XLuW50rnpv8kkCwKBgQDZ9NXA72EtOKSXO/JVoDLzV9/KhNJOyJh1\nj1yDBhR9QhdYdHoytouQRoY7czTFraXoVchBLKHiURKNw/j3D7VYNDnLeOg9ea9h\nFTpUgZrBsGM/BniLdyqDcttCn/AJcjX8rwCrANEHbv2MoTkbS9GfHwwoCJMXmrCo\nfi+DwSPZowKBgDULtP5FA6IEtZjWwuLnFEL5CcABcSNxPIGFRiMK1THgjctfR9ek\npVJTo/PDwlXqHn6bUCqiyfUHMKjHMHCy5ErIr1zQLhQAmZKNc1ojCb8IoYPTwy+5\nXfbFTDOIE1FyqhxhiCWkUu9eH0LigvI+kcMHtiWcGvVHSnTJPHapgi7fAoGAHxJv\ncrztrqO3mzPZnWlkOhrZ9aYv0Tl5urDAcJFqVF0atOqODTLG/L+BHXKUIGZcE54/\nGUOCpKAINBuvH5GmubdgUeifuzvgy8dZ9HgxltFNpMuIXeGUNv8l0P66Gq6kkaxl\nPPu10Qh6rxTA7mpFrRihBAgM6D2OV8b9gRwEv18CgYEA1NHjt5CYqVyc4kpeVzrh\nxxs6T0DkmzjLvZnPW1UhrqtOvp4O9xCRSAfuyeZSfWAg7IgNXhRMGu2P93V8i7Gt\nj+9+mxDuc9XWn6mxM3P1mdSW9bSvLlAJiz60m5dAq9+BYAdE1TvYR3MOfC3tNo6v\nzi9n1t174hD2wyR7COTudGQ=\n-----END PRIVATE KEY-----\n"

# 设置Firebase客户端邮箱
export FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@bixu-push-notifications.iam.gserviceaccount.com"
```

### 永久设置环境变量

将上述命令添加到 `~/.bashrc` 文件中：

```bash
echo 'export FIREBASE_PROJECT_ID="bixu-push-notifications"' >> ~/.bashrc
echo 'export FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDHu2asWT477j1W\ntSGGt153JrNtUDK/a2q/edvy6O6JaKkrq/xoTdgKAuTr3iQEoytZRAKD6Z/6KwPg\nKVA3u61bO0GZByZ0H4VrWmDERCXfjWiQXZ2DtbbG1PHUdSzuBlsRhQfSUmUz9XV2\nq7vk1W5FiAXZrk8dWHzy8691cQtJKYA7IfiIBnbU7pvlimH8rVdZMHO1aQaq8AUq\nOVeGUoggKzyv5X/i9+hgfIG3Bvv3mUxXU8eOm7PcdUUDdN5xuTM1qttmSK1QlbN+\n3Y5j+MQp1DTsc1KdgkesKgKzvBr87GiB3rZ4KzA5Ud7Fym2xL4GARy7S2hezy5xE\n1rPVIEYBAgMBAAECggEAC/EMwCHh0lbPJ1+oWSlI0O+TwLsPyFlqxiH0tZREVsYs\nKdFG7mbhE3rS0bYJX0Gbi43BEhP7cvX0GF3qpDposKYH/ldAGadHedYAfRuPTCC5\n72UO0DDNdHEyOD/9PLSik0Hp6CLxrBFGlvQeRXNBUY+YEfNrBYJ541Nl2oFfabNM\nyaksLJoXXr8KF4wMJ/yomBZcr8VFrewZ5R84EpImoj7hqAaYA1meUXJkNUZ1q/7f\nl/ON9JFNmTghNBZiDnzvmv3LHnF/2CBHUkCTfeMGGOdbMNdPmNZUKCZdO8GLqhKj\nq4mScDmT5UQ0kGP6Q4EQ+MAt9eCJxF8ET6zltzkNtQKBgQDqmDqhoEtNhPW/gDp8\n3S0bMjsz3Pxexxy1AUFSm+3obrF7ucfEpq/gpR7TaG4JcKh6wPEgD9WRs25nnRG0\nfwYXrw0jQChtS0t+sjVffH/w1sYVnbAB4BH37+G/kY68b8wFG3WT1NJ5iA1sQl47\nR6PY+9KOAX7XLuW50rnpv8kkCwKBgQDZ9NXA72EtOKSXO/JVoDLzV9/KhNJOyJh1\nj1yDBhR9QhdYdHoytouQRoY7czTFraXoVchBLKHiURKNw/j3D7VYNDnLeOg9ea9h\nFTpUgZrBsGM/BniLdyqDcttCn/AJcjX8rwCrANEHbv2MoTkbS9GfHwwoCJMXmrCo\nfi+DwSPZowKBgDULtP5FA6IEtZjWwuLnFEL5CcABcSNxPIGFRiMK1THgjctfR9ek\npVJTo/PDwlXqHn6bUCqiyfUHMKjHMHCy5ErIr1zQLhQAmZKNc1ojCb8IoYPTwy+5\nXfbFTDOIE1FyqhxhiCWkUu9eH0LigvI+kcMHtiWcGvVHSnTJPHapgi7fAoGAHxJv\ncrztrqO3mzPZnWlkOhrZ9aYv0Tl5urDAcJFqVF0atOqODTLG/L+BHXKUIGZcE54/\nGUOCpKAINBuvH5GmubdgUeifuzvgy8dZ9HgxltFNpMuIXeGUNv8l0P66Gq6kkaxl\nPPu10Qh6rxTA7mpFrRihBAgM6D2OV8b9gRwEv18CgYEA1NHjt5CYqVyc4kpeVzrh\nxxs6T0DkmzjLvZnPW1UhrqtOvp4O9xCRSAfuyeZSfWAg7IgNXhRMGu2P93V8i7Gt\nj+9+mxDuc9XWn6mxM3P1mdSW9bSvLlAJiz60m5dAq9+BYAdE1TvYR3MOfC3tNo6v\nzi9n1t174hD2wyR7COTudGQ=\n-----END PRIVATE KEY-----\n"' >> ~/.bashrc
echo 'export FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@bixu-push-notifications.iam.gserviceaccount.com"' >> ~/.bashrc

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