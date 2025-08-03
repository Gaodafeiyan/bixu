import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::notice.notice' as any, ({ strapi }) => ({
  // 重写create方法，在创建公告时发送推送
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      
      // 创建公告
      const notice = await strapi.entityService.create('api::notice.notice' as any, {
        data
      });

      // 如果公告是活跃的且已发布，发送推送通知
      if (notice.isActive && notice.publishedAt) {
        try {
          const pushNotificationService = strapi.service('api::push-notification.push-notification');
          await pushNotificationService.sendSystemAnnouncement(
            notice.title,
            notice.content
          );
          console.log(`📱 系统公告推送已发送: ${notice.title}`);
        } catch (error) {
          console.error('❌ 发送系统公告推送失败:', error);
        }
      }

      return notice;
    } catch (error) {
      console.error('创建公告失败:', error);
      ctx.throw(500, `创建公告失败: ${error.message}`);
    }
  },

  // 重写update方法，在更新公告时发送推送
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;
      
      // 更新公告
      const notice = await strapi.entityService.update('api::notice.notice' as any, id, {
        data
      });

      // 如果公告是活跃的且已发布，发送推送通知
      if (notice.isActive && notice.publishedAt) {
        try {
          const pushNotificationService = strapi.service('api::push-notification.push-notification');
          await pushNotificationService.sendSystemAnnouncement(
            notice.title,
            notice.content
          );
          console.log(`📱 系统公告推送已发送: ${notice.title}`);
        } catch (error) {
          console.error('❌ 发送系统公告推送失败:', error);
        }
      }

      return notice;
    } catch (error) {
      console.error('更新公告失败:', error);
      ctx.throw(500, `更新公告失败: ${error.message}`);
    }
  },
  // 获取活跃的公告列表
  async findActive(ctx) {
    try {
      const notices = await strapi.entityService.findMany('api::notice.notice' as any, {
        filters: {
          isActive: true,
          publishedAt: { $notNull: true }
        },
        sort: { priority: 'desc', createdAt: 'desc' },
        populate: '*'
      }) as any[];

      ctx.body = {
        success: true,
        data: notices
      };
    } catch (error) {
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  // 获取公告详情
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const entity = await strapi.entityService.findOne('api::notice.notice' as any, id, {
        populate: '*'
      });

      if (!entity) {
        return ctx.notFound('Notice not found');
      }

      ctx.body = {
        success: true,
        data: entity
      };
    } catch (error) {
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  // 获取用户通知列表
  async getUserNotifications(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { page = 1, pageSize = 20 } = ctx.query;

      const notifications = await strapi.entityService.findMany('api::notice.notice' as any, {
        filters: {
          isActive: true
          // 移除 publishedAt 条件，允许显示草稿通知
        },
        pagination: {
          page: parseInt(String(page)),
          pageSize: parseInt(String(pageSize))
        },
        sort: { createdAt: 'desc' },
        populate: '*'
      }) as any[];

      // 获取用户已读通知记录
      const readNotifications = await strapi.entityService.findMany('api::user-notification-read.user-notification-read' as any, {
        filters: { user: userId }
      }) as any[];

      const readIds = new Set(readNotifications.map(r => r.noticeId));

      // 为每个通知添加已读状态
      const notificationsWithReadStatus = notifications.map(notice => ({
        ...notice,
        isRead: readIds.has(notice.id)
      }));

      ctx.body = {
        success: true,
        data: {
          notifications: notificationsWithReadStatus,
          pagination: {
            page: parseInt(String(page)),
            pageSize: parseInt(String(pageSize)),
            total: notifications.length
          }
        }
      };
    } catch (error) {
      console.error('获取用户通知失败:', error);
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  // 标记通知为已读
  async markAsRead(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { noticeId } = ctx.request.body;

      if (!noticeId) {
        return ctx.badRequest('通知ID不能为空');
      }

      // 检查通知是否存在
      const notice = await strapi.entityService.findOne('api::notice.notice' as any, noticeId);
      if (!notice) {
        return ctx.notFound('通知不存在');
      }

      // 检查是否已经标记为已读
      const existingRead = await strapi.entityService.findMany('api::user-notification-read.user-notification-read' as any, {
        filters: {
          user: userId,
          noticeId: noticeId
        }
      }) as any[];

      if (existingRead.length === 0) {
        // 创建已读记录
        await strapi.entityService.create('api::user-notification-read.user-notification-read' as any, {
          data: {
            user: userId,
            noticeId: noticeId,
            readAt: new Date()
          }
        });
      }

      ctx.body = {
        success: true,
        message: '标记已读成功'
      };
    } catch (error) {
      console.error('标记已读失败:', error);
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  // 获取未读通知数量
  async getUnreadCount(ctx) {
    try {
      const userId = ctx.state.user.id;

      // 获取所有活跃通知
      const allNotifications = await strapi.entityService.findMany('api::notice.notice' as any, {
        filters: {
          isActive: true,
          publishedAt: { $notNull: true }
        }
      }) as any[];

      // 获取用户已读通知记录
      const readNotifications = await strapi.entityService.findMany('api::user-notification-read.user-notification-read' as any, {
        filters: { user: userId }
      }) as any[];

      const readIds = new Set(readNotifications.map(r => r.noticeId));
      const unreadCount = allNotifications.filter(notice => !readIds.has(notice.id)).length;

      ctx.body = {
        success: true,
        data: {
          unreadCount: unreadCount
        }
      };
    } catch (error) {
      console.error('获取未读数量失败:', error);
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  // 获取通知设置
  async getNotificationSettings(ctx) {
    try {
      const userId = ctx.state.user.id;

      // 获取用户通知设置
      let settings = await strapi.entityService.findMany('api::user-notification-settings.user-notification-settings' as any, {
        filters: { user: userId }
      }) as any[];

      if (settings.length === 0) {
        // 如果没有设置，创建默认设置
        settings = [await strapi.entityService.create('api::user-notification-settings.user-notification-settings' as any, {
          data: {
            user: userId,
            systemNotifications: true,
            emailNotifications: false,
            pushNotifications: true,
            marketingNotifications: false
          }
        })];
      }

      ctx.body = {
        success: true,
        data: settings[0]
      };
    } catch (error) {
      console.error('获取通知设置失败:', error);
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  },

  // 更新通知设置
  async updateNotificationSettings(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { systemNotifications, emailNotifications, pushNotifications, marketingNotifications } = ctx.request.body;

      // 查找现有设置
      let settings = await strapi.entityService.findMany('api::user-notification-settings.user-notification-settings' as any, {
        filters: { user: userId }
      }) as any[];

      if (settings.length === 0) {
        // 创建新设置
        await strapi.entityService.create('api::user-notification-settings.user-notification-settings' as any, {
          data: {
            user: userId,
            systemNotifications: systemNotifications ?? true,
            emailNotifications: emailNotifications ?? false,
            pushNotifications: pushNotifications ?? true,
            marketingNotifications: marketingNotifications ?? false
          }
        });
      } else {
        // 更新现有设置
        await strapi.entityService.update('api::user-notification-settings.user-notification-settings' as any, settings[0].id, {
          data: {
            systemNotifications: systemNotifications ?? settings[0].systemNotifications,
            emailNotifications: emailNotifications ?? settings[0].emailNotifications,
            pushNotifications: pushNotifications ?? settings[0].pushNotifications,
            marketingNotifications: marketingNotifications ?? settings[0].marketingNotifications
          }
        });
      }

      // 如果用户关闭了推送通知，注销其FCM token
      if (pushNotifications === false) {
        try {
          const pushNotificationService = strapi.service('api::push-notification.push-notification');
          const userTokens = await strapi.entityService.findMany('api::user-fcm-token.user-fcm-token' as any, {
            filters: { userId },
          });
          
                     for (const token of userTokens as any[]) {
             await pushNotificationService.unregisterUserToken(userId, token.fcmToken);
           }
        } catch (error) {
          console.error('注销FCM token失败:', error);
        }
      }

      ctx.body = {
        success: true,
        message: '通知设置更新成功'
      };
    } catch (error) {
      console.error('更新通知设置失败:', error);
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }
}));