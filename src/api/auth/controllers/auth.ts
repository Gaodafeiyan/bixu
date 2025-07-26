import { factories } from '@strapi/strapi';

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
          filters: { username }
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
    }
  })
);

// 生成邀请码
function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
} 