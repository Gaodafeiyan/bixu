import { factories } from '@strapi/strapi';
import QRCode from 'qrcode';

export default factories.createCoreController(
  'plugin::users-permissions.user',
  ({ strapi }) => ({
    // 健康检查端点
    async health(ctx) {
      try {
        ctx.body = {
          status: 'ok',
          timestamp: new Date().toISOString(),
          message: 'Zenithus API is running'
        };
      } catch (error) {
        ctx.throw(500, 'Health check failed');
      }
    },

    // H5注册页面
    async showRegisterPage(ctx) {
      try {
        const inviteCode = ctx.params.inviteCode || ctx.query.ref;
        
        // 生成H5注册页面HTML
        const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zenithus - 邀请注册</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0D1117 0%, #161B22 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            max-width: 400px;
            width: 100%;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .logo h1 {
            font-size: 28px;
            font-weight: bold;
            background: linear-gradient(45deg, #00E7FF, #FF3CF4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 8px;
        }
        
        .logo p {
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 500;
        }
        
        .form-group input {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            color: white;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #00E7FF;
            box-shadow: 0 0 0 3px rgba(0, 231, 255, 0.1);
        }
        
        .form-group input::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }
        
        .invite-code {
            background: linear-gradient(45deg, #00E7FF, #FF3CF4);
            padding: 15px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 20px;
        }
        
        .invite-code span {
            font-size: 18px;
            font-weight: bold;
            color: white;
            letter-spacing: 2px;
        }
        
        .btn {
            width: 100%;
            padding: 16px;
            background: linear-gradient(45deg, #00E7FF, #FF3CF4);
            border: none;
            border-radius: 12px;
            color: white;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 15px;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 231, 255, 0.3);
        }
        
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .download-btn {
            background: linear-gradient(45deg, #D4AF37, #FFD700);
            color: #000;
        }
        
        .download-btn:hover {
            box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
        }
        
        .features {
            margin-top: 30px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
        }
        
        .features h3 {
            color: #00E7FF;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .features ul {
            list-style: none;
            color: rgba(255, 255, 255, 0.8);
        }
        
        .features li {
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
        }
        
        .features li:before {
            content: "🌟";
            position: absolute;
            left: 0;
        }
        
        .error {
            color: #ff6b6b;
            font-size: 14px;
            margin-top: 8px;
        }
        
        .success {
            color: #51cf66;
            font-size: 14px;
            margin-top: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>Zenithus</h1>
            <p>AI大健康出海平台</p>
        </div>
        
        <div class="invite-code">
            <span>邀请码: ${inviteCode || '请输入邀请码'}</span>
        </div>
        
        <form id="registerForm">
            <div class="form-group">
                <label for="username">用户名</label>
                <input type="text" id="username" name="username" placeholder="请输入用户名" required>
            </div>
            
            <div class="form-group">
                <label for="email">邮箱</label>
                <input type="email" id="email" name="email" placeholder="请输入邮箱" required>
            </div>
            
            <div class="form-group">
                <label for="password">密码</label>
                <input type="password" id="password" name="password" placeholder="请输入密码" required>
            </div>
            
            <div class="form-group">
                <label for="inviteCode">邀请码</label>
                <input type="text" id="inviteCode" name="inviteCode" value="${inviteCode || ''}" placeholder="请输入邀请码" required>
            </div>
            
            <button type="submit" class="btn">注册</button>
        </form>
        
        <button onclick="downloadApp()" class="btn download-btn">下载APP</button>
        
        <div class="features">
            <h3>平台特色</h3>
            <ul>
                <li>AI健康科技投资</li>
                <li>邀请有礼奖励</li>
                <li>抽奖豪华礼包</li>
                <li>安全可靠保障</li>
            </ul>
        </div>
    </div>
    
    <script>
        document.getElementById('registerForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {
                username: formData.get('username'),
                email: formData.get('email'),
                password: formData.get('password'),
                inviteCode: formData.get('inviteCode')
            };
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '注册中...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('/api/auth/invite-register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showMessage('注册成功！正在跳转到APP...', 'success');
                    
                    // 显示下载提示
                    const downloadTip = document.createElement('div');
                    downloadTip.className = 'download-tip';
                    downloadTip.innerHTML = '<div style="background: rgba(0, 231, 255, 0.1); padding: 15px; border-radius: 10px; margin-top: 15px; text-align: center;"><p style="color: #00E7FF; margin-bottom: 10px;">🎉 注册成功！</p><p style="color: rgba(255, 255, 255, 0.8); font-size: 14px; margin-bottom: 15px;">正在为您跳转到APP下载页面...</p><button onclick="downloadApp()" style="background: linear-gradient(45deg, #00E7FF, #FF3CF4); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer;">立即下载APP</button></div>';
                    
                    const form = document.getElementById('registerForm');
                    form.appendChild(downloadTip);
                    
                    // 3秒后自动跳转
                    setTimeout(() => {
                        downloadApp();
                    }, 3000);
                } else {
                    showMessage(result.message || '注册失败，请重试', 'error');
                }
            } catch (error) {
                showMessage('网络错误，请检查网络连接', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
        
        function showMessage(message, type) {
            const existingMessage = document.querySelector('.message');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${type}\`;
            messageDiv.textContent = message;
            
            const form = document.getElementById('registerForm');
            form.appendChild(messageDiv);
        }
        
        function downloadApp() {
            // 检测设备类型
            const userAgent = navigator.userAgent.toLowerCase();
            
            if (/android/.test(userAgent)) {
                // Android设备 - 尝试打开应用或跳转到应用商店
                try {
                    // 首先尝试打开应用
                    window.location.href = 'zenithus://register?ref=${inviteCode}';
                    
                    // 如果应用未安装，3秒后跳转到下载页面
                    setTimeout(() => {
                        window.location.href = 'https://play.google.com/store/apps/details?id=com.zenithus.app';
                    }, 3000);
                } catch (e) {
                    // 如果出错，直接跳转到下载页面
                    window.location.href = 'https://play.google.com/store/apps/details?id=com.zenithus.app';
                }
            } else if (/iphone|ipad|ipod/.test(userAgent)) {
                // iOS设备 - 尝试打开应用，如果失败则跳转到App Store
                try {
                    window.location.href = 'zenithus://register?ref=${inviteCode}';
                    
                    // 如果应用未安装，3秒后跳转到App Store
                    setTimeout(() => {
                        window.location.href = 'https://apps.apple.com/app/zenithus/id123456789';
                    }, 3000);
                } catch (e) {
                    window.location.href = 'https://apps.apple.com/app/zenithus/id123456789';
                }
            } else {
                // 其他设备 - 显示下载页面
                const downloadUrl = 'https://zenithus.app/download';
                window.open(downloadUrl, '_blank');
            }
        }
    </script>
</body>
</html>`;

        ctx.type = 'text/html';
        ctx.body = html;
      } catch (error) {
        console.error('生成注册页面失败:', error);
        ctx.throw(500, '生成注册页面失败');
      }
    },

    // 邀请注册
    async inviteRegister(ctx) {
      try {
        const { username, email, password, inviteCode } = ctx.request.body;
        
        if (!username || !email || !password || !inviteCode) {
          return ctx.badRequest('缺少必要参数');
        }

        // 验证邀请码
        const inviteUser = await strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: { inviteCode } as any
        });

        if (inviteUser.length === 0) {
          return ctx.badRequest('邀请码无效');
        }

        // 检查用户名是否已存在
        const existingUser = await strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: { username } as any
        });

        if (existingUser.length > 0) {
          return ctx.badRequest('用户名已存在');
        }

        // 检查邮箱是否已存在
        const existingEmail = await strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: { email }
        });

        if (existingEmail.length > 0) {
          return ctx.badRequest('邮箱已存在');
        }

        // 获取authenticated角色
        const [authenticatedRole] = await strapi.entityService.findMany('plugin::users-permissions.role', {
          filters: { type: 'authenticated' },
          limit: 1
        }) as any[];

        if (!authenticatedRole) {
          return ctx.badRequest('系统错误：未找到默认角色');
        }

        // 使用Strapi实体服务创建用户，确保密码正确加密
        const newUser = await strapi.entityService.create('plugin::users-permissions.user', {
          data: {
            username,
            email,
            password,
            provider: 'local',
            confirmed: true,  // 自动确认用户
            blocked: false,
            inviteCode: generateInviteCode(),
            invitedBy: inviteUser[0].id,
            role: authenticatedRole.id  // 使用正确的角色ID
          }
        });

        // 确保用户有正确的角色
        const userWithRole = newUser as any;
        if (!userWithRole.role) {
          // 如果没有角色，手动设置默认角色
          await strapi.plugin('users-permissions').service('user').edit(newUser.id, {
            role: authenticatedRole.id
          });
        }

        // 创建用户钱包
        await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
          data: {
            usdtYue: '0',
            aiYue: '0',
            aiTokenBalances: '{}',
            user: newUser.id
          } as any
        });

        ctx.body = {
          success: true,
          data: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            inviteCode: newUser.inviteCode
          },
          message: '注册成功'
        };
      } catch (error) {
        console.error('邀请注册失败:', error);
        ctx.throw(500, `注册失败：${error.message}`);
      }
    },

    // 用户登录
    async local(ctx) {
      try {
        const { identifier, password } = ctx.request.body;
        
        if (!identifier || !password) {
          return ctx.badRequest('用户名/邮箱和密码不能为空');
        }

        // 使用Strapi的users-permissions插件进行认证
        const userService = strapi.plugin('users-permissions').service('user');
        const jwtService = strapi.plugin('users-permissions').service('jwt');
        
        // 查找用户 - 使用正确的查询方式
        let targetUser = null;
        
        // 先尝试用用户名查找，包含角色信息
        const usersByUsername = await strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: { username: identifier },
          populate: ['role']
        }) as any[];
        
        if (usersByUsername.length > 0) {
          targetUser = usersByUsername[0];
        } else {
          // 如果用户名没找到，尝试用邮箱查找，包含角色信息
          const usersByEmail = await strapi.entityService.findMany('plugin::users-permissions.user', {
            filters: { email: identifier },
            populate: ['role']
          }) as any[];
          
          if (usersByEmail.length > 0) {
            targetUser = usersByEmail[0];
          }
        }
        
        if (!targetUser) {
          return ctx.badRequest('用户名或密码错误');
        }
        
        // 验证密码
        const validPassword = await userService.validatePassword(password, targetUser.password);
        if (!validPassword) {
          return ctx.badRequest('用户名或密码错误');
        }

        // 检查用户状态
        if (targetUser.blocked) {
          return ctx.badRequest('账户已被禁用');
        }

        if (!targetUser.confirmed) {
          return ctx.badRequest('账户未确认');
        }

        // 生成JWT token
        const token = jwtService.issue({ id: targetUser.id });

        // 安全地获取用户角色信息
        let role = targetUser.role;
        if (!role) {
          // 如果没有角色信息，使用默认角色
          role = {
            id: 1,
            name: 'Authenticated',
            description: 'Default role given to authenticated user.',
            type: 'authenticated'
          };
        }

        // 安全地获取用户钱包信息
        let wallet = null;
        try {
          const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
            filters: { user: { id: targetUser.id } }
          }) as any[];

          wallet = wallets && wallets.length > 0 ? wallets[0] : null;
        } catch (walletError) {
          console.warn('获取钱包信息失败:', walletError);
          // 如果获取钱包失败，创建默认钱包信息
          wallet = {
            id: null,
            usdtYue: '0',
            aiYue: '0',
            aiTokenBalances: '{}'
          };
        }

        ctx.body = {
          jwt: token,
          user: {
            id: targetUser.id,
            username: targetUser.username,
            email: targetUser.email,
            confirmed: targetUser.confirmed,
            blocked: targetUser.blocked,
            role: role,
            inviteCode: targetUser.inviteCode,
            invitedBy: targetUser.invitedBy,
            qianbao: wallet,
            createdAt: targetUser.createdAt,
            updatedAt: targetUser.updatedAt
          }
        };
      } catch (error) {
        console.error('登录失败:', error);
        ctx.throw(500, `登录失败: ${error.message}`);
      }
    },

    // 获取邀请信息
    async getInviteInfo(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
        
        if (!user) {
          return ctx.notFound('用户不存在');
        }

        // 生成包含邀请码的注册页面链接
        const registerLink = `${process.env.FRONTEND_URL || 'https://zenithus.app'}/register?ref=${user.inviteCode}`;
        
        // 生成邀请链接（用于网页分享）
        const inviteLink = `${process.env.FRONTEND_URL || 'https://zenithus.app'}/register?ref=${user.inviteCode}`;
        
        // 生成包含邀请码的二维码（指向注册页面）
        const qrCodeData = await QRCode.toDataURL(registerLink, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        ctx.body = {
          success: true,
          data: {
            inviteCode: user.inviteCode,
            inviteLink: inviteLink,
            appDownloadLink: registerLink,
            qrCodeData: qrCodeData,
            username: user.username
          }
        };
      } catch (error) {
        console.error('获取邀请信息失败:', error);
        ctx.throw(500, `获取邀请信息失败: ${error.message}`);
      }
    },

    // 获取团队信息
    async getTeamInfo(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        // 获取直接推荐的用户
        const directReferrals = await strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: { invitedBy: userId },
          fields: ['id', 'username', 'createdAt'],
          sort: { createdAt: 'desc' },
        }) as any[];

        // 计算总收益（这里可以根据实际业务逻辑计算）
        const totalEarnings = await this.calculateTotalEarnings(userId);

        // 格式化团队成员数据
        const members = directReferrals.map((user: any) => ({
          username: user.username,
          registrationDate: user.createdAt.toISOString().split('T')[0],
        }));

        ctx.body = {
          success: true,
          data: {
            directReferrals: directReferrals.length,
            totalEarnings: totalEarnings.toFixed(2),
            members: members,
          }
        };
      } catch (error) {
        console.error('获取团队信息失败:', error);
        ctx.throw(500, `获取团队信息失败: ${error.message}`);
      }
    },

    // 获取收益信息
    async getRewardInfo(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        // 获取邀请奖励记录
        const rewards = await strapi.entityService.findMany('api::yaoqing-jiangli.yaoqing-jiangli', {
          filters: { tuijianRen: userId },
          fields: ['id', 'shouyiUSDT', 'createdAt'],
          sort: { createdAt: 'desc' },
          limit: 10,
        }) as any[];

        // 计算总收益
        const totalRewards = rewards.reduce((sum: number, reward: any) => {
          return sum + (parseFloat(reward.shouyiUSDT) || 0);
        }, 0);

        // 计算本月收益
        const currentMonth = new Date();
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const monthlyRewards = rewards
          .filter((reward: any) => new Date(reward.createdAt) >= monthStart)
          .reduce((sum: number, reward: any) => {
            return sum + (parseFloat(reward.shouyiUSDT) || 0);
          }, 0);

        // 格式化收益记录
        const formattedRewards = rewards.map((reward: any) => ({
          amount: reward.shouyiUSDT,
          timestamp: reward.createdAt.toISOString().replace('T', ' ').substring(0, 19),
        }));

        ctx.body = {
          success: true,
          data: {
            totalRewards: totalRewards.toFixed(2),
            monthlyRewards: monthlyRewards.toFixed(2),
            rewards: formattedRewards,
          }
        };
      } catch (error) {
        console.error('获取收益信息失败:', error);
        ctx.throw(500, `获取收益信息失败: ${error.message}`);
      }
    },

    // 获取当前档位信息
    async getCurrentTierInfo(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        console.log(`🔍 开始获取用户 ${userId} 的当前档位信息...`);
        
        // 获取用户所有有效的认购订单（running、redeemable、finished状态）
        const activeOrders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
          filters: { 
            user: { id: userId },
            status: { $in: ['running', 'redeemable', 'finished'] }  // 包含所有有效状态
          },
          populate: ['jihua']
        }) as any[];

        console.log(`用户 ${userId} 的有效订单数量: ${activeOrders.length}`);

        if (!activeOrders || activeOrders.length === 0) {
          console.log(`用户 ${userId} 没有有效的订单`);
          return ctx.body = {
          success: true,
            data: null,
            message: '用户没有有效的投资订单'
          };
        }

        // 找到最高档位的订单
        let maxTierOrder = null;
        let maxPrincipal = 0;

        for (const order of activeOrders) {
          const orderPrincipal = parseFloat(order.principal || order.amount || 0);
          console.log(`订单 ${order.id}: 状态=${order.status}, 金额=${orderPrincipal}, 计划=${order.jihua?.name}`);

          if (orderPrincipal > maxPrincipal) {
            maxTierOrder = order;
            maxPrincipal = orderPrincipal;
          }
        }

        if (!maxTierOrder) {
          return ctx.body = {
          success: true,
            data: null,
            message: '未找到有效的投资订单'
          };
        }

        const plan = maxTierOrder.jihua;
        console.log(`用户最高档位订单: 计划=${plan?.name}, 金额=${maxPrincipal} USDT`);

        // 计算静态收益（年化）
        const staticRate = parseFloat(plan?.jingtaiBili || 0) / 100; // 转换为小数
        const aiRate = parseFloat(plan?.aiBili || 0) / 100; // AI代币奖励比例
        const cycleDays = parseInt(plan?.zhouQiTian || 30);
        
        // 计算周期收益
        const cycleStaticRate = (staticRate * cycleDays / 365) * 100; // 转换为百分比
        const cycleAiRate = (aiRate * cycleDays / 365) * 100; // 转换为百分比

        ctx.body = {
          success: true,
          data: {
            tierName: plan?.name || '未知档位',
            principal: maxPrincipal,
            staticRate: staticRate,
            aiRate: aiRate,
            cycleDays: cycleDays,
            cycleStaticRate: cycleStaticRate,
            cycleAiRate: cycleAiRate,
            planCode: plan?.jihuaCode,
            description: `当前档位: ${plan?.name}，投资金额: ${maxPrincipal} USDT，年化静态收益率: ${(staticRate * 100).toFixed(2)}%，周期静态收益: ${cycleStaticRate.toFixed(2)}%，AI代币奖励: ${(aiRate * 100).toFixed(2)}%，投资周期: ${cycleDays}天`
          }
        };
      } catch (error) {
        console.error('获取当前档位信息失败:', error);
        ctx.throw(500, `获取当前档位信息失败: ${error.message}`);
      }
    },

    // 计算总收益的辅助方法
    async calculateTotalEarnings(userId) {
      try {
        const rewards = await strapi.entityService.findMany('api::yaoqing-jiangli.yaoqing-jiangli', {
          filters: { tuijianRen: userId },
          fields: ['shouyiUSDT'],
        }) as any[];

        return rewards.reduce((sum: number, reward: any) => {
          return sum + (parseFloat(reward.shouyiUSDT) || 0);
        }, 0);
      } catch (error) {
        console.error('计算总收益失败:', error);
        return 0;
      }
    },

    // 记录分享行为
    async trackInviteShare(ctx) {
      try {
        const userId = ctx.state.user.id;
        const { shareType, sharePlatform } = ctx.request.body;
        
        if (!shareType || !sharePlatform) {
          return ctx.badRequest('缺少必要参数');
        }

        // 记录分享行为到数据库（可选）
        // 这里可以创建一个分享记录表来存储分享行为
        console.log(`用户 ${userId} 进行了分享行为: ${shareType} - ${sharePlatform}`);

        ctx.body = {
          success: true,
          message: '分享行为记录成功',
          data: {
            shareType,
            sharePlatform,
            timestamp: new Date().toISOString(),
          }
        };
      } catch (error) {
        console.error('记录分享行为失败:', error);
        ctx.throw(500, `记录分享行为失败: ${error.message}`);
      }
    },

    // 更新用户资料
    async updateProfile(ctx) {
      try {
        const userId = ctx.state.user.id;
        const { username, email, phone, avatar } = ctx.request.body;
        
        // 这里可以实现用户资料更新逻辑
        ctx.body = {
          success: true,
          message: '用户资料更新成功'
        };
      } catch (error) {
        console.error('更新用户资料失败:', error);
        ctx.throw(500, `更新用户资料失败: ${error.message}`);
      }
    },

    // 获取安全设置
    async getSecuritySettings(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        ctx.body = {
          success: true,
          data: {
            twoFactorEnabled: false,
            emailNotifications: true,
            smsNotifications: false,
          }
        };
      } catch (error) {
        console.error('获取安全设置失败:', error);
        ctx.throw(500, `获取安全设置失败: ${error.message}`);
      }
    },

    // 更新安全设置
    async updateSecuritySettings(ctx) {
      try {
        const userId = ctx.state.user.id;
        const { twoFactorEnabled, emailNotifications, smsNotifications } = ctx.request.body;
        
        ctx.body = {
          success: true,
          message: '安全设置更新成功'
        };
      } catch (error) {
        console.error('更新安全设置失败:', error);
        ctx.throw(500, `更新安全设置失败: ${error.message}`);
      }
    },

    // 获取应用设置
    async getAppSettings(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        ctx.body = {
          success: true,
          data: {
            language: 'zh-CN',
            theme: 'dark',
            autoLogin: true,
          }
        };
      } catch (error) {
        console.error('获取应用设置失败:', error);
        ctx.throw(500, `获取应用设置失败: ${error.message}`);
      }
    },

    // 更新应用设置
    async updateAppSettings(ctx) {
      try {
        const userId = ctx.state.user.id;
        const { language, theme, autoLogin } = ctx.request.body;
        
        ctx.body = {
          success: true,
          message: '应用设置更新成功'
        };
      } catch (error) {
        console.error('更新应用设置失败:', error);
        ctx.throw(500, `更新应用设置失败: ${error.message}`);
      }
    },

    // 获取团队订单信息
    async getTeamOrders(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        console.log(`🔍 获取用户 ${userId} 的团队订单信息`);

        // 获取用户直接邀请的下级用户
        const directReferrals = await strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: { invitedBy: { id: userId } }
        }) as any[];

        console.log(`用户 ${userId} 的直接邀请人数: ${directReferrals.length}`);

        const teamOrders = [];
        let totalOrders = 0;
        let runningOrders = 0;
        let finishedOrders = 0;
        let totalRewards = 0;
        let pendingRewards = 0;

        for (const referral of directReferrals) {
          // 获取该用户的订单
          const orders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
            filters: { user: { id: referral.id } },
            populate: ['jihua']
          }) as any[];
          
          for (const order of orders) {
            totalOrders++;
            
            if (order.status === 'running') {
              runningOrders++;
            } else if (order.status === 'finished') {
              finishedOrders++;
            }

            // 计算到期时间
            let expiryDate = null;
            let daysRemaining = null;
            
            if (order.createdAt && order.jihua) {
              const createdDate = new Date(order.createdAt);
              const durationDays = order.jihua.duration || 90; // 默认90天
              expiryDate = new Date(createdDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
              
              const now = new Date();
              const remainingMs = expiryDate.getTime() - now.getTime();
              daysRemaining = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
            }

            // 获取邀请奖励信息
            const rewardRecord = await strapi.entityService.findMany('api::yaoqing-jiangli.yaoqing-jiangli', {
              filters: { 
                tuijianRen: { id: userId },
                laiyuanRen: { id: referral.id },
                laiyuanDan: { id: order.id }
              }
            }) as any[];

            let rewardAmount = '0';
            let rewardStatus = 'none';
            
            if (rewardRecord.length > 0) {
              rewardAmount = rewardRecord[0].shouyiUSDT || '0';
              totalRewards += parseFloat(rewardAmount);
              
              if (order.status === 'finished') {
                rewardStatus = 'paid';
              } else {
                rewardStatus = 'pending';
                pendingRewards += parseFloat(rewardAmount);
              }
            }

            teamOrders.push({
              orderId: order.id,
              username: referral.username,
              registrationDate: referral.createdAt ? new Date(referral.createdAt).toLocaleDateString() : '',
              status: order.status,
              planName: order.jihua?.name || '未知计划',
              amount: order.principal || order.amount || '0',
              investmentDate: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '',
              expiryDate: expiryDate ? expiryDate.toLocaleDateString() : null,
              daysRemaining: daysRemaining,
              rewardAmount: rewardAmount,
              rewardStatus: rewardStatus
            });
          }
        }

        // 按投资时间排序，最新的在前面
        teamOrders.sort((a, b) => {
          const dateA = new Date(a.investmentDate);
          const dateB = new Date(b.investmentDate);
          return dateB.getTime() - dateA.getTime();
        });

        ctx.body = {
          success: true,
          data: {
            totalOrders,
            runningOrders,
            finishedOrders,
            totalRewards: totalRewards.toFixed(2),
            pendingRewards: pendingRewards.toFixed(2),
            orders: teamOrders
          },
          message: '团队订单信息获取成功'
        };
      } catch (error) {
        console.error('获取团队订单信息失败:', error);
        ctx.throw(500, `获取团队订单信息失败: ${error.message}`);
      }
    },
  })
);

// 生成邀请码的辅助函数
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
} 
  return result;
}
