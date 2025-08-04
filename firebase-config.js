// Firebase配置信息
// 从Firebase服务账号JSON文件中提取的配置

module.exports = {
  FIREBASE_PROJECT_ID: 'bixu-chat-app',
  // TODO: 需要从新的Firebase项目下载服务账号JSON文件，然后更新以下配置
  FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDHu2asWT477j1W\ntSGGt153JrNtUDK/a2q/edvy6O6JaKkrq/xoTdgKAuTr3iQEoytZRAKD6Z/6KwPg\nKVA3u61bO0GZByZ0H4VrWmDERCXfjWiQXZ2DtbbG1PHUdSzuBlsRhQfSUmUz9XV2\nq7vk1W5FiAXZrk8dWHzy8691cQtJKYA7IfiIBnbU7pvlimH8rVdZMHO1aQaq8AUq\nOVeGUoggKzyv5X/i9+hgfIG3Bvv3mUxXU8eOm7PcdUUDdN5xuTM1qttmSK1QlbN+\n3Y5j+MQp1DTsc1KdgkesKgKzvBr87GiB3rZ4KzA5Ud7Fym2xL4GARy7S2hezy5xE\n1rPVIEYBAgMBAAECggEAC/EMwCHh0lbPJ1+oWSlI0O+TwLsPyFlqxiH0tZREVsYs\nKdFG7mbhE3rS0bYJX0Gbi43BEhP7cvX0GF3qpDposKYH/ldAGadHedYAfRuPTCC5\n72UO0DDNdHEyOD/9PLSik0Hp6CLxrBFGlvQeRXNBUY+YEfNrBYJ541Nl2oFfabNM\nyaksLJoXXr8KF4wMJ/yomBZcr8VFrewZ5R84EpImoj7hqAaYA1meUXJkNUZ1q/7f\nl/ON9JFNmTghNBZiDnzvmv3LHnF/2CBHUkCTfeMGGOdbMNdPmNZUKCZdO8GLqhKj\nq4mScDmT5UQ0kGP6Q4EQ+MAt9eCJxF8ET6zltzkNtQKBgQDqmDqhoEtNhPW/gDp8\n3S0bMjsz3Pxexxy1AUFSm+3obrF7ucfEpq/gpR7TaG4JcKh6wPEgD9WRs25nnRG0\nfwYXrw0jQChtS0t+sjVffH/w1sYVnbAB4BH37+G/kY68b8wFG3WT1NJ5iA1sQl47\nR6PY+9KOAX7XLuW50rnpv8kkCwKBgQDZ9NXA72EtOKSXO/JVoDLzV9/KhNJOyJh1\nj1yDBhR9QhdYdHoytouQRoY7czTFraXoVchBLKHiURKNw/j3D7VYNDnLeOg9ea9h\nFTpUgZrBsGM/BniLdyqDcttCn/AJcjX8rwCrANEHbv2MoTkbS9GfHwwoCJMXmrCo\nfi+DwSPZowKBgDULtP5FA6IEtZjWwuLnFEL5CcABcSNxPIGFRiMK1THgjctfR9ek\npVJTo/PDwlXqHn6bUCqiyfUHMKjHMHCy5ErIr1zQLhQAmZKNc1ojCb8IoYPTwy+5\nXfbFTDOIE1FyqhxhiCWkUu9eH0LigvI+kcMHtiWcGvVHSnTJPHapgi7fAoGAHxJv\ncrztrqO3mzPZnWlkOhrZ9aYv0Tl5urDAcJFqVF0atOqODTLG/L+BHXKUIGZcE54/\nGUOCpKAINBuvH5GmubdgUeifuzvgy8dZ9HgxltFNpMuIXeGUNv8l0P66Gq6kkaxl\nPPu10Qh6rxTA7mpFrRihBAgM6D2OV8b9gRwEv18CgYEA1NHjt5CYqVyc4kpeVzrh\nxxs6T0DkmzjLvZnPW1UhrqtOvp4O9xCRSAfuyeZSfWAg7IgNXhRMGu2P93V8i7Gt\nj+9+mxDuc9XWn6mxM3P1mdSW9bSvLlAJiz60m5dAq9+BYAdE1TvYR3MOfC3tNo6v\nzi9n1t174hD2wyR7COTudGQ=\n-----END PRIVATE KEY-----\n',
  FIREBASE_CLIENT_EMAIL: 'firebase-adminsdk-fbsvc@bixu-push-notifications.iam.gserviceaccount.com'
};

// 使用说明：
// 1. 从Firebase Console下载新的服务账号JSON文件
// 2. 更新以下环境变量：
//    export FIREBASE_PROJECT_ID="bixu-chat-app"
//    export FIREBASE_PRIVATE_KEY="从新JSON文件中获取的私钥"
//    export FIREBASE_CLIENT_EMAIL="从新JSON文件中获取的客户端邮箱"
//
// 3. 重启Strapi服务：
//    cd /root/strapi-v5-ts
//    yarn develop 