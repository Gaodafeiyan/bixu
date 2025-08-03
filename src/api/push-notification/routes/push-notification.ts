export default {
  type: 'content-api',
  routes: [
    {
      method: 'POST',
      path: '/push/send-to-user',
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
      path: '/push/send-to-all',
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
      path: '/push/send-announcement',
      handler: 'push-notification.sendSystemAnnouncement',
      config: {
        type: 'content-api',
        auth: {},
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 