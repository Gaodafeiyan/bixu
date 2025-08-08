export default {
  type: 'content-api',
  routes: [
    {
      method: 'POST',
      path: '/push-notification/send-to-user',
      handler: 'push-notification.sendToUser',
      config: {
        type: 'content-api',
        auth: {},
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/push-notification/send-to-all',
      handler: 'push-notification.sendToAllUsers',
      config: {
        type: 'content-api',
        auth: {},
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/push-notification/send-announcement',
      handler: 'push-notification.sendSystemAnnouncement',
      config: {
        type: 'content-api',
        auth: {},
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/push-notification/test',
      handler: 'push-notification.test',
      config: {
        type: 'content-api',
        auth: {},
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 