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

    // 用户登录 - 添加缺失的登录方法
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

    // 修改密码
    async changePassword(ctx) {
      try {
        const userId = ctx.state.user.id;
        const { currentPassword, newPassword } = ctx.request.body;

        if (!currentPassword || !newPassword) {
          return ctx.badRequest('当前密码和新密码不能为空');
        }

        // 获取用户信息
        const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
        
        if (!user) {
          return ctx.notFound('用户不存在');
        }

        // 验证当前密码
        const userService = strapi.plugin('users-permissions').service('user');
        const validPassword = await userService.validatePassword(currentPassword, user.password);
        
        if (!validPassword) {
          return ctx.badRequest('当前密码错误');
        }

        // 验证新密码长度
        if (newPassword.length < 6) {
          return ctx.badRequest('新密码长度至少6位');
        }

        // 更新密码
        await strapi.entityService.update('plugin::users-permissions.user', userId, {
          data: {
            password: newPassword
          } as any
        });

        ctx.body = {
          success: true,
          message: '密码修改成功'
        };
      } catch (error) {
        console.error('修改密码失败:', error);
        ctx.throw(500, `修改密码失败: ${error.message}`);
      }
    },

    // 获取我的邀请码
    async getMyInviteCode(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
        
        if (!user) {
          return ctx.notFound('用户不存在');
        }

        ctx.body = {
          success: true,
          data: {
            inviteCode: user.inviteCode
          }
        };
      } catch (error) {
        console.error('获取邀请码失败:', error);
        ctx.throw(500, `获取邀请码失败: ${error.message}`);
      }
    },

    // 获取我的团队
    async getMyTeam(ctx) {
      try {
        const userId = ctx.state.user.id;
        const { page = 1, pageSize = 10 } = ctx.query;

        // 获取直接推荐的用户
        const directReferrals = await strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: { invitedBy: userId },
          pagination: {
            page: parseInt(String(page)),
            pageSize: parseInt(String(pageSize))
          },
          sort: { createdAt: 'desc' }
        });

        // 获取间接推荐的用户（二级推荐）
        const indirectReferrals = await strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: { 
            invitedBy: { $in: directReferrals.map(user => user.id) }
          },
          sort: { createdAt: 'desc' }
        } as any) as any[];

        ctx.body = {
          success: true,
          data: {
            directReferrals: directReferrals.map(user => ({
              id: user.id,
              username: user.username,
              email: user.email,
              createdAt: user.createdAt
            })),
            indirectReferrals: indirectReferrals.map(user => ({
              id: user.id,
              username: user.username,
              email: user.email,
              createdAt: user.createdAt
            })),
            pagination: {
              page: parseInt(String(page)),
              pageSize: parseInt(String(pageSize)),
              total: directReferrals.length
            }
          }
        };
      } catch (error) {
        console.error('获取团队失败:', error);
        ctx.throw(500, `获取团队失败: ${error.message}`);
      }
    },

    // 验证邀请码
    async validateInviteCode(ctx) {
      try {
        const { inviteCode } = ctx.params;

        if (!inviteCode) {
          return ctx.badRequest('邀请码不能为空');
        }

        const user = await strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: { inviteCode } as any
        });

        if (user.length === 0) {
          return ctx.badRequest('邀请码无效');
        }

        ctx.body = {
          success: true,
          data: {
            valid: true,
            inviter: {
              id: user[0].id,
              username: user[0].username
            }
          }
        };
      } catch (error) {
        console.error('验证邀请码失败:', error);
        ctx.throw(500, `验证邀请码失败: ${error.message}`);
      }
    },

    // 获取完整邀请信息
    async getInviteInfo(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
        
        if (!user) {
          return ctx.notFound('用户不存在');
        }

        // 生成包含邀请码的深度链接
        const deepLink = `${process.env.FRONTEND_URL || 'https://zenithus.app'}/auth/download?invite=${user.inviteCode}`;
        
        // 生成邀请链接（用于网页分享）
        const inviteLink = `${process.env.FRONTEND_URL || 'https://zenithus.app'}/register?ref=${user.inviteCode}`;
        
        // 生成包含邀请码的二维码（指向深度链接）
        const qrCodeData = await QRCode.toDataURL(deepLink, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        // 获取分享统计（如果有的话）
        const shareStats = await this.getShareStats(userId);

        ctx.body = {
          success: true,
          data: {
            inviteCode: user.inviteCode,
            inviteLink: inviteLink,
            appDownloadLink: deepLink,
            qrCodeData: qrCodeData,
            shareStats: shareStats,
            username: user.username
          }
        };
      } catch (error) {
        console.error('获取邀请信息失败:', error);
        ctx.throw(500, `获取邀请信息失败: ${error.message}`);
      }
    },

    // 生成邀请链接
    async generateInviteLink(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
        
        if (!user) {
          return ctx.notFound('用户不存在');
        }

        const inviteLink = `${process.env.FRONTEND_URL || 'https://zenithus.app'}/register?ref=${user.inviteCode}`;

        ctx.body = {
          success: true,
          data: {
            inviteLink: inviteLink,
            inviteCode: user.inviteCode
          }
        };
      } catch (error) {
        console.error('生成邀请链接失败:', error);
        ctx.throw(500, `生成邀请链接失败: ${error.message}`);
      }
    },

    // 重定向旧路径到新路径
    async redirectToRegister(ctx) {
      const { ref } = ctx.query;
      const redirectUrl = `/api/auth/register?ref=${ref}`;
      console.log(`重定向: /register?ref=${ref} -> ${redirectUrl}`);
      return ctx.redirect(redirectUrl);
    },

    // 生成邀请二维码
    async getInviteQRCode(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
        
        if (!user) {
          return ctx.notFound('用户不存在');
        }

        // 生成包含邀请码的APP下载链接
        const appDownloadLink = `${process.env.FRONTEND_URL || 'https://zenithus.app'}/auth/download?invite=${user.inviteCode}`;
        
        // 生成邀请链接（用于网页分享）
        const inviteLink = `${process.env.FRONTEND_URL || 'https://zenithus.app'}/register?ref=${user.inviteCode}`;
        
        // 生成包含邀请码的二维码（指向APP下载链接）
        const qrCodeData = await QRCode.toDataURL(appDownloadLink, {
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
            qrCodeData: qrCodeData,
            inviteLink: inviteLink,
            appDownloadLink: appDownloadLink
          }
        };
      } catch (error) {
        console.error('生成邀请二维码失败:', error);
        ctx.throw(500, `生成邀请二维码失败: ${error.message}`);
      }
    },

    // 记录分享行为
    async trackInviteShare(ctx) {
      try {
        const userId = ctx.state.user.id;
        const { shareType, sharePlatform } = ctx.request.body;

        // 这里可以记录分享统计到数据库
        // 暂时只记录日志
        console.log(`用户 ${userId} 通过 ${sharePlatform} 分享了邀请码，分享类型: ${shareType}`);

        ctx.body = {
          success: true,
          message: '分享记录成功'
        };
      } catch (error) {
        console.error('记录分享失败:', error);
        ctx.throw(500, `记录分享失败: ${error.message}`);
      }
    },

    // 获取分享统计
    async getShareStats(userId: number) {
      try {
        // 这里可以从数据库获取分享统计
        // 暂时返回模拟数据
        return {
          totalShares: 0,
          successfulInvites: 0,
          conversionRate: 0
        };
      } catch (error) {
        console.error('获取分享统计失败:', error);
        return {
          totalShares: 0,
          successfulInvites: 0,
          conversionRate: 0
        };
      }
    },

    // 生成二维码SVG数据（保留作为备用方法）
    generateQRCodeSVG(text: string): string {
      // 简单的二维码SVG生成
      // 在实际项目中，建议使用专业的二维码库
      const size = 200;
      const cellSize = 4;
      const cells = Math.floor(size / cellSize);
      
      // 生成简单的二维码模式（这里只是示例）
      let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
      svg += `<rect width="${size}" height="${size}" fill="white"/>`;
      
      // 生成简单的二维码图案（实际应该根据文本生成）
      for (let i = 0; i < cells; i++) {
        for (let j = 0; j < cells; j++) {
          // 简单的随机模式，实际应该根据文本生成
          if ((i + j) % 2 === 0) {
            svg += `<rect x="${i * cellSize}" y="${j * cellSize}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
          }
        }
      }
      
      svg += '</svg>';
      return svg;
    },

    // APK下载处理
    async downloadApk(ctx) {
      try {
        const { invite } = ctx.query;
        
        // 返回下载信息
        ctx.body = {
          success: true,
          message: 'APK下载功能已启用',
          inviteCode: invite || null,
          downloadUrl: 'https://zenithus.app/downloads/app-release.apk',
          version: '1.0.0',
          size: '76.3MB',
          description: 'Zenithus - AI大健康草本多肽出口认购平台'
        };
        
      } catch (error) {
        console.error('APK下载信息获取失败:', error);
        ctx.throw(500, `APK下载信息获取失败: ${error.message}`);
      }
    },

    // 下载页面处理
    async downloadPage(ctx) {
      try {
        const { invite } = ctx.query;
        
        // 如果有邀请码，验证其有效性
        let inviterInfo = null;
        if (invite) {
          const inviteUser = await strapi.entityService.findMany('plugin::users-permissions.user', {
            filters: { inviteCode: invite } as any
          });
          
          if (inviteUser.length > 0) {
            inviterInfo = {
              username: inviteUser[0].username,
              inviteCode: invite
            };
          }
        }

        // 返回HTML下载页面
        const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zenithus AI大健康出海平台 - APP下载</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #0A0F1A 0%, #1C263B 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 400px;
            width: 90%;
            backdrop-filter: blur(10px);
        }
        .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(45deg, #0A0F1A, #1C263B);
            border-radius: 16px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            box-shadow: 0 8px 16px rgba(0,0,0,0.3);
        }
        .diamond {
            width: 48px;
            height: 48px;
            background: linear-gradient(45deg, #D4AF37, #8A2BE2);
            clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        }
        h1 {
            background: linear-gradient(45deg, #D4AF37, #8A2BE2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
            font-size: 24px;
            font-weight: bold;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 16px;
        }
        .invite-info {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #D4AF37;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .invite-code {
            font-size: 18px;
            font-weight: bold;
            background: linear-gradient(45deg, #D4AF37, #8A2BE2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 10px 0;
        }
        .download-btn {
            background: linear-gradient(45deg, #D4AF37, #8A2BE2);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            margin: 10px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 8px rgba(212, 175, 55, 0.3);
        }
        .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(212, 175, 55, 0.4);
        }
        .features {
            margin: 30px 0;
            text-align: left;
        }
        .feature {
            display: flex;
            align-items: center;
            margin: 15px 0;
            color: #555;
        }
        .feature-icon {
            width: 20px;
            height: 20px;
            background: linear-gradient(45deg, #D4AF37, #8A2BE2);
            border-radius: 50%;
            margin-right: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
        }
        .platform-tag {
            display: inline-block;
            background: linear-gradient(45deg, #D4AF37, #8A2BE2);
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            margin: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <div class="diamond"></div>
        </div>
        <h1>Zenithus AI大健康出海平台</h1>
        <p class="subtitle">AI驱动的健康科技，全球化的投资机遇</p>
        
        ${inviterInfo ? `
        <div class="invite-info">
            <p>🎉 您被 <strong>${inviterInfo.username}</strong> 邀请加入</p>
            <p>邀请码：<span class="invite-code">${inviterInfo.inviteCode}</span></p>
        </div>
        ` : ''}
        
        <a href="https://zenithus.app/downloads/app-release.apk" class="download-btn">
            📱 立即下载APP
        </a>
        
        <div class="features">
            <div class="feature">
                <div class="feature-icon">✓</div>
                <span>AI健康科技投资</span>
            </div>
            <div class="feature">
                <div class="feature-icon">✓</div>
                <span>全球化出海机遇</span>
            </div>
            <div class="feature">
                <div class="feature-icon">✓</div>
                <span>邀请有礼</span>
            </div>
            <div class="feature">
                <div class="feature-icon">✓</div>
                <span>抽奖豪华礼包免费赠送</span>
            </div>
            <div class="feature">
                <div class="feature-icon">✓</div>
                <span>安全可靠的投资环境</span>
            </div>
        </div>
        
        <div style="margin-top: 20px;">
            <span class="platform-tag">AI科技</span>
            <span class="platform-tag">大健康</span>
            <span class="platform-tag">出海平台</span>
        </div>
    </div>
    

</body>
</html>`;

        ctx.set('Content-Type', 'text/html');
        ctx.body = html;
        
      } catch (error) {
        console.error('下载页面生成失败:', error);
        ctx.throw(500, `下载页面生成失败: ${error.message}`);
      }
    },

    // 纯 HTTPS 邀请链接处理
    async invitePage(ctx) {
      try {
        const { inviteCode } = ctx.params;
        
        // 验证邀请码有效性
        let inviterInfo = null;
        if (inviteCode) {
          const inviteUser = await strapi.entityService.findMany('plugin::users-permissions.user', {
            filters: { inviteCode: inviteCode } as any
          });
          
          if (inviteUser.length > 0) {
            inviterInfo = {
              username: inviteUser[0].username,
              inviteCode: inviteCode
            };
          }
        }

        // 检查是否是直接 AppLink 路由（/invite 而不是 /api/invite）
        const isDirectAppLink = ctx.request.url.includes('/invite/') && !ctx.request.url.includes('/api/invite/');
        
        if (isDirectAppLink) {
          // 直接 AppLink 路由：返回简单的 200 OK
          ctx.status = 200;
          ctx.body = 'OK';
          return;
        }

        // API 路由：返回完整的 HTML 页面
        const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zenithus 邀请链接</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #0A0F1A 0%, #1C263B 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 400px;
            width: 90%;
            backdrop-filter: blur(10px);
        }
        .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(45deg, #0A0F1A, #1C263B);
            border-radius: 16px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .diamond {
            width: 48px;
            height: 48px;
            background: linear-gradient(45deg, #D4AF37, #8A2BE2);
            clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        }
        h1 {
            background: linear-gradient(45deg, #D4AF37, #8A2BE2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
            font-size: 24px;
            font-weight: bold;
        }
        .invite-info {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #D4AF37;
        }
        .invite-code {
            font-size: 18px;
            font-weight: bold;
            background: linear-gradient(45deg, #D4AF37, #8A2BE2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 10px 0;
        }
        .open-app-btn {
            background: linear-gradient(45deg, #D4AF37, #8A2BE2);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            margin: 10px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 8px rgba(212, 175, 55, 0.3);
            text-decoration: none;
            display: inline-block;
        }
        .open-app-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(212, 175, 55, 0.4);
        }
        .fallback-btn {
            background: #666;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 15px;
            font-size: 14px;
            cursor: pointer;
            margin: 10px;
            text-decoration: none;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <div class="diamond"></div>
        </div>
        <h1>Zenithus AI大健康出海平台</h1>
        
        ${inviterInfo ? `
        <div class="invite-info">
            <p>🎉 您被 <strong>${inviterInfo.username}</strong> 邀请加入</p>
            <p>邀请码：<span class="invite-code">${inviterInfo.inviteCode}</span></p>
            <p style="font-size: 14px; color: #666;">点击下方按钮直接打开APP</p>
        </div>
        ` : `
        <div class="invite-info">
            <p>🎉 欢迎加入 Zenithus</p>
            <p style="font-size: 14px; color: #666;">点击下方按钮直接打开APP</p>
        </div>
        `}
        
        <a href="intent://invite/${inviterInfo?.inviteCode || ''}#Intent;scheme=https;package=com.zenithus.app;end" class="open-app-btn">
            📱 立即打开APP
        </a>
        
        <br>
        <a href="https://zenithus.app/api/auth/register?ref=${inviterInfo?.inviteCode || ''}" class="fallback-btn">
            📝 立即注册
        </a>
    </div>
    
    <script>
        // 自动触发 AppLink
        setTimeout(function() {
            // 尝试使用intent://格式
            window.location.href = 'intent://invite/${inviterInfo?.inviteCode || ''}#Intent;scheme=https;package=com.zenithus.app;end';
        }, 1000);
    </script>
</body>
</html>`;

        ctx.set('Content-Type', 'text/html');
        ctx.body = html;
        
      } catch (error) {
        console.error('邀请页面生成失败:', error);
        ctx.throw(500, `邀请页面生成失败: ${error.message}`);
      }
    },

    // H5注册页面
    async registerPage(ctx) {
      try {
        const { ref } = ctx.query;
        
        // 验证邀请码
        let inviterInfo = null;
        if (ref) {
          const inviteUser = await strapi.entityService.findMany('plugin::users-permissions.user', {
            filters: { inviteCode: ref } as any
          });
          
          if (inviteUser.length > 0) {
            inviterInfo = {
              username: inviteUser[0].username,
              inviteCode: ref
            };
          }
        }

        // 返回H5注册页面
        const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zenithus AI大健康出海平台 - 注册</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #0A0F1A 0%, #1C263B 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 400px;
            width: 90%;
            backdrop-filter: blur(10px);
        }
        .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(45deg, #0A0F1A, #1C263B);
            border-radius: 16px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            box-shadow: 0 8px 16px rgba(0,0,0,0.3);
        }
        .diamond {
            width: 48px;
            height: 48px;
            background: linear-gradient(45deg, #D4AF37, #8A2BE2);
            clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        }
        h1 {
            background: linear-gradient(45deg, #D4AF37, #8A2BE2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
            font-size: 24px;
            font-weight: bold;
        }
        .invite-info {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #D4AF37;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .invite-code {
            font-size: 18px;
            font-weight: bold;
            background: linear-gradient(45deg, #D4AF37, #8A2BE2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 10px 0;
        }
        .form-group {
            margin: 20px 0;
            text-align: left;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
        }
        .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s ease;
            box-sizing: border-box;
        }
        .form-group input:focus {
            outline: none;
            border-color: #D4AF37;
        }
        .form-group input[readonly] {
            background-color: #f8f9fa;
            color: #666;
        }
        .register-btn {
            background: linear-gradient(45deg, #D4AF37, #8A2BE2);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            margin: 20px 0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 8px rgba(212, 175, 55, 0.3);
            width: 100%;
        }
        .register-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(212, 175, 55, 0.4);
        }
        .error {
            color: #dc3545;
            font-size: 14px;
            margin-top: 5px;
        }
        .success {
            color: #28a745;
            font-size: 14px;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <div class="diamond"></div>
        </div>
        <h1>Zenithus AI大健康出海平台</h1>
        
        ${inviterInfo ? `
        <div class="invite-info">
            <p>🎉 您被 <strong>${inviterInfo.username}</strong> 邀请加入</p>
            <p>邀请码：<span class="invite-code">${inviterInfo.inviteCode}</span></p>
        </div>
        ` : `
        <div class="invite-info">
            <p>🎉 欢迎加入 Zenithus</p>
        </div>
        `}
        
        <form id="registerForm" method="post" action="/api/auth/invite-register">
            <div class="form-group">
                <label for="username">用户名</label>
                <input type="text" id="username" name="username" required maxlength="100">
            </div>
            
            <div class="form-group">
                <label for="email">邮箱</label>
                <input type="email" id="email" name="email" required maxlength="255">
            </div>
            
            <div class="form-group">
                <label for="password">密码</label>
                <input type="password" id="password" name="password" required maxlength="100">
            </div>
            
            <div class="form-group">
                <label for="confirmPassword">确认密码</label>
                <input type="password" id="confirmPassword" name="confirmPassword" required maxlength="100">
            </div>
            
            <div class="form-group">
                <label for="inviteCode">邀请码</label>
                <input type="text" id="inviteCode" name="inviteCode" value="${inviterInfo?.inviteCode || ''}" readonly maxlength="50">
            </div>
            
            <button type="submit" class="register-btn">立即注册</button>
        </form>
        
        <div id="message"></div>
    </div>
    
    <script>
        console.log('=== 注册页面JavaScript开始加载 ===');
        
        // 等待DOM加载完成后设置表单处理
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM加载完成，设置表单处理');
            setupFormHandler();
        });
        
        // 如果DOM已经加载完成，立即执行
        if (document.readyState === 'loading') {
            console.log('DOM还在加载中');
        } else {
            console.log('DOM已经加载完成，立即设置');
            setupFormHandler();
        }
        
        function setupFormHandler() {
            console.log('设置表单事件监听器');
            
            const form = document.getElementById('registerForm');
            if (!form) {
                console.error('setupFormHandler: 找不到表单');
                return;
            }
            
            // 添加表单提交事件监听器
            form.addEventListener('submit', async (e) => {
                console.log('submit 回调进入');
                e.preventDefault(); // 必须阻止默认提交
                e.stopPropagation();
                e.stopImmediatePropagation();
                e.returnValue = false;
                
                console.log('已阻止默认提交行为');
                await handleSubmit(e);
                return false;
            });
            
            console.log('表单事件监听器设置完成');
        }
        
        async function handleSubmit(e) {
            console.log('=== handleSubmit函数开始执行 ===');
            
            try {
                // 获取表单数据
                const formData = new FormData(e.target);
                const password = formData.get('password');
                const confirmPassword = formData.get('confirmPassword');
                
                // 验证密码确认
                if (password !== confirmPassword) {
                    document.getElementById('message').innerHTML = '<div class="error">注册失败：两次输入的密码不一致</div>';
                    return;
                }
                
                const data = {
                    username: formData.get('username'),
                    email: formData.get('email'),
                    password: password,
                    inviteCode: formData.get('inviteCode')
                };
                
                console.log('准备发送数据:', data);
                
                // 禁用提交按钮
                const submitBtn = e.target.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = '注册中...';
                }
                
                console.log('准备发送');
                const response = await fetch('/api/auth/invite-register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                console.log('已发送');
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('响应数据:', result);
                    
                    document.getElementById('message').innerHTML = '<div class="success">注册成功！正在跳转到APP下载页面...</div>';
                    setTimeout(() => {
                        console.log('跳转到下载页面');
                        window.location.href = '/auth/download?invite=' + data.inviteCode;
                    }, 2000);
                } else {
                    const errorData = await response.json();
                    const errorMessage = errorData.message || '注册失败';
                    
                    console.log('后端返回的错误信息:', errorMessage);
                    console.log('完整的错误数据:', errorData);
                    
                    // 根据错误类型显示具体提示
                    let displayMessage = '注册失败';
                    
                    // 检查错误信息的各种可能格式
                    if (errorMessage.includes('用户名已存在') || errorMessage.includes('用户名重复')) {
                        displayMessage = '注册失败：用户名重复';
                    } else if (errorMessage.includes('邮箱已存在') || errorMessage.includes('邮箱重复')) {
                        displayMessage = '注册失败：邮箱重复';
                    } else if (errorMessage.includes('邀请码无效')) {
                        displayMessage = '注册失败：邀请码无效';
                    } else if (errorMessage.includes('缺少必要参数')) {
                        displayMessage = '注册失败：请填写完整信息';
                    } else if (errorMessage.includes('注册失败')) {
                        // 如果错误信息已经包含"注册失败"，直接使用
                        displayMessage = errorMessage;
                    } else {
                        displayMessage = '注册失败：' + errorMessage;
                    }
                    
                    document.getElementById('message').innerHTML = '<div class="error">' + displayMessage + '</div>';
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = '立即注册';
                    }
                }
            } catch (error) {
                console.error('注册请求失败:', error);
                document.getElementById('message').innerHTML = '<div class="error">注册失败：网络错误 - ' + error.message + '</div>';
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = '立即注册';
                }
            }
        }
    </script>
</body>
</html>`;

        ctx.set('Content-Type', 'text/html');
        ctx.body = html;
        
      } catch (error) {
        console.error('H5注册页面生成失败:', error);
        ctx.throw(500, `H5注册页面生成失败: ${error.message}`);
      }
    },


  })
);

// 生成邀请码
function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
} 