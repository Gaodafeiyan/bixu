import { factories } from '@strapi/strapi';
import QRCode from 'qrcode';

export default factories.createCoreController(
  'plugin::users-permissions.user',
  ({ strapi }) => ({
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
        ctx.throw(500, `注册失败: ${error.message}`);
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

        // 生成包含邀请码的APP下载链接
        const appDownloadLink = `${process.env.FRONTEND_URL || 'http://118.107.4.158:1337'}/downloads/app-release.apk?invite=${user.inviteCode}`;
        
        // 生成邀请链接（用于网页分享）
        const inviteLink = `${process.env.FRONTEND_URL || 'https://your-domain.com'}/register?invite=${user.inviteCode}`;
        
        // 生成包含邀请码的二维码（指向APP下载链接）
        const qrCodeData = await QRCode.toDataURL(appDownloadLink, {
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
            appDownloadLink: appDownloadLink,
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

        const inviteLink = `${process.env.FRONTEND_URL || 'https://your-domain.com'}/register?invite=${user.inviteCode}`;

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

    // 生成邀请二维码
    async getInviteQRCode(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
        
        if (!user) {
          return ctx.notFound('用户不存在');
        }

        // 生成包含邀请码的APP下载链接
        const appDownloadLink = `${process.env.FRONTEND_URL || 'http://118.107.4.158:1337'}/downloads/app-release.apk?invite=${user.inviteCode}`;
        
        // 生成邀请链接（用于网页分享）
        const inviteLink = `${process.env.FRONTEND_URL || 'https://your-domain.com'}/register?invite=${user.inviteCode}`;
        
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
        
        // 如果有邀请码，验证其有效性
        if (invite) {
          const inviteUser = await strapi.entityService.findMany('plugin::users-permissions.user', {
            filters: { inviteCode: invite } as any
          });
          
          if (inviteUser.length === 0) {
            return ctx.badRequest('邀请码无效');
          }
        }

        // 设置响应头，告诉浏览器这是一个文件下载
        ctx.set('Content-Type', 'application/vnd.android.package-archive');
        ctx.set('Content-Disposition', 'attachment; filename="app-release.apk"');
        
        // 这里应该返回实际的APK文件
        // 在开发阶段，我们可以返回一个简单的响应，说明文件下载功能
        ctx.body = {
          success: true,
          message: 'APK下载功能已启用',
          inviteCode: invite || null,
          downloadUrl: `${process.env.FRONTEND_URL || 'http://118.107.4.158:1337'}/downloads/app-release.apk`
        };
        
        // 在实际部署时，这里应该返回真实的APK文件
        // ctx.body = fs.createReadStream('/path/to/your/app-release.apk');
        
      } catch (error) {
        console.error('APK下载失败:', error);
        ctx.throw(500, `APK下载失败: ${error.message}`);
      }
    },
  })
);

// 生成邀请码
function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
} 