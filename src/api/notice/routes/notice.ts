export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/notices',
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
      path: '/notices/:id',
      handler: 'notice.findOne',
      config: {
        type: 'content-api',
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/notices/:id',
      handler: 'notice.update',
      config: {
        type: 'content-api',
        auth: {},
        policies: [],
        middlewares: [],
      },
    },
    // 用户通知相关路由
    {
      method: 'GET',
      path: '/notifications/user',
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
      path: '/notifications/mark-read',
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
      path: '/notifications/unread-count',
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
      path: '/notifications/settings',
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
      path: '/notifications/settings',
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