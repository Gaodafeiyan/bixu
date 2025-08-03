export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/api/notices',
      handler: 'notice.findActive',
      config: {
        type: 'content-api',
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/api/notices/:id',
      handler: 'notice.findOne',
      config: {
        type: 'content-api',
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // 用户通知相关路由
    {
      method: 'GET',
      path: '/api/notifications/user',
      handler: 'notice.getUserNotifications',
      config: {
        type: 'content-api',
        auth: {},
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/api/notifications/mark-read',
      handler: 'notice.markAsRead',
      config: {
        type: 'content-api',
        auth: {},
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/api/notifications/unread-count',
      handler: 'notice.getUnreadCount',
      config: {
        type: 'content-api',
        auth: {},
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/api/notifications/settings',
      handler: 'notice.getNotificationSettings',
      config: {
        type: 'content-api',
        auth: {},
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/api/notifications/settings',
      handler: 'notice.updateNotificationSettings',
      config: {
        type: 'content-api',
        auth: {},
        policies: [],
        middlewares: [],
      },
    },
  ],
};