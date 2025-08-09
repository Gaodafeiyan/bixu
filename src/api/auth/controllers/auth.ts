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
