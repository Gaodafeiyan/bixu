const fs = require('fs');
const path = require('path');

console.log('🔧 快速修复401错误脚本');
console.log('========================');

// 创建服务器端修复命令
const serverCommands = `
# 在服务器上执行这些命令：

cd /root/strapi-v5-ts

# 1. 停止当前服务
pkill -f "strapi develop"

# 2. 修复merge conflict（如果有）
sed -i '/<<<<<<< HEAD/,/=======/d' src/api/recharge-channel/services/blockchain-service.ts
sed -i '/>>>>>>>/d' src/api/recharge-channel/services/blockchain-service.ts

# 3. 清理缓存
rm -rf .strapi dist

# 4. 重新编译
yarn build

# 5. 启动服务
yarn develop
`;

// 创建权限配置步骤
const permissionSteps = `
# 权限配置步骤（在Admin后台执行）：

1. 登录 http://118.107.4.158:1337/admin

2. 进入 Settings → Users & Permissions → Roles

3. 点击 "Authenticated" 角色

4. 勾选以下权限：
   - choujiang-jihuis: find, findOne
   - qianbao-yues: find, findOne  
   - notifications: find, findOne
   - yaoqing-jianglis: find, findOne
   - investment-service: find, findOne
   - dinggou-jihuas: find, findOne

5. 点击 "Save"

6. 刷新前端页面，重新登录获取新token
`;

// 创建API Token方案
const apiTokenSteps = `
# API Token方案：

1. 在Admin后台：Settings → API Tokens

2. 点击 "Create new API Token"

3. 设置：
   - Name: "Frontend API Token"
   - Description: "用于前端API访问"
   - Token duration: "Unlimited"
   - Token type: "Full access"

4. 点击 "Save"

5. 复制生成的Token

6. 在前端代码中使用：
   Authorization: Bearer <your-api-token>
`;

// 创建临时Public权限方案
const publicPermissionSteps = `
# 临时Public权限方案（仅测试用）：

1. Settings → Users & Permissions → Roles → Public

2. 临时勾选需要的API权限

3. 点击 "Save"

⚠️ 注意：测试完成后务必改回，不要在生产环境开放Public权限
`;

// 创建前端代码示例
const frontendCode = `
// 前端代码示例：

// 方案1：使用用户JWT Token
const userToken = localStorage.getItem("user-jwt");
fetch("http://118.107.4.158:1337/api/choujiang-jihuis/my-chances", {
  headers: {
    "Authorization": \`Bearer \${userToken}\`
  }
});

// 方案2：使用API Token
const apiToken = "your-api-token-here";
fetch("http://118.107.4.158:1337/api/choujiang-jihuis/my-chances", {
  headers: {
    "Authorization": \`Bearer \${apiToken}\`
  }
});
`;

// 输出所有修复方案
console.log('\n📋 服务器端修复命令:');
console.log(serverCommands);

console.log('\n📋 权限配置步骤:');
console.log(permissionSteps);

console.log('\n📋 API Token方案:');
console.log(apiTokenSteps);

console.log('\n📋 临时Public权限方案:');
console.log(publicPermissionSteps);

console.log('\n📋 前端代码示例:');
console.log(frontendCode);

console.log('\n🎯 推荐执行顺序:');
console.log('1. 在服务器上执行修复命令');
console.log('2. 登录Admin后台配置Authenticated角色权限');
console.log('3. 前端重新登录获取新token');
console.log('4. 测试API访问是否正常');

console.log('\n💡 如果还是401，可以临时使用Public权限方案进行测试');