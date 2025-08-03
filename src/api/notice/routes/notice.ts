export default {
  routes: [
    {
      method: 'GET',
      path: '/api/notices',
      handler: 'notice.findActive',
      config: {
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
        auth: {},
        policies: [],
        middlewares: [],
      },
    },
  ],
};