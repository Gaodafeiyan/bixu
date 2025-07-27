export default {
  type: 'content-api',
  routes: [
    // 自定义路由
    {
      method: 'POST',
      path: '/yaoqing-jianglis/create-reward',
      handler: 'yaoqing-jiangli.createReward',
      config: { 
        type: 'content-api',
        auth: {},  // 空对象表示需要登录
      },
    },
    {
      method: 'POST',
      path: '/yaoqing-jianglis/create-reward-v2',
      handler: 'yaoqing-jiangli.createRewardV2',
      config: { 
        type: 'content-api',
        auth: {},  // 空对象表示需要登录
      },
    },
    {
      method: 'GET',
      path: '/yaoqing-jianglis/user-rewards',
      handler: 'yaoqing-jiangli.getUserRewards',
      config: { 
        type: 'content-api',
        auth: {},  // 空对象表示需要登录
      },
    },
    {
      method: 'GET',
      path: '/yaoqing-jianglis/team-stats',
      handler: 'yaoqing-jiangli.getTeamStats',
      config: { 
        type: 'content-api',
        auth: {},  // 空对象表示需要登录
      },
    },
    {
      method: 'GET',
      path: '/yaoqing-jianglis/team-stats-v2',
      handler: 'yaoqing-jiangli.getTeamStatsV2',
      config: { 
        type: 'content-api',
        auth: {},  // 空对象表示需要登录
      },
    },
    {
      method: 'GET',
      path: '/yaoqing-jianglis/reward-tiers',
      handler: 'yaoqing-jiangli.getRewardTiers',
      config: { 
        type: 'content-api',
        auth: {},  // 空对象表示需要登录
      },
    },
    {
      method: 'GET',
      path: '/yaoqing-jianglis/order/:orderId/reward',
      handler: 'yaoqing-jiangli.getOrderInvitationReward',
      config: { 
        type: 'content-api',
        auth: {},  // 空对象表示需要登录
      },
    },
    // 标准CRUD路由
    {
      method: 'GET',
      path: '/yaoqing-jianglis',
      handler: 'yaoqing-jiangli.find',
    },
    {
      method: 'GET',
      path: '/yaoqing-jianglis/:id',
      handler: 'yaoqing-jiangli.findOne',
    },
    {
      method: 'POST',
      path: '/yaoqing-jianglis',
      handler: 'yaoqing-jiangli.create',
    },
    {
      method: 'PUT',
      path: '/yaoqing-jianglis/:id',
      handler: 'yaoqing-jiangli.update',
    },
    {
      method: 'DELETE',
      path: '/yaoqing-jianglis/:id',
      handler: 'yaoqing-jiangli.delete',
    },
  ],
}; 