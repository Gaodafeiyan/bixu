import { Strapi } from '@strapi/strapi';

export default ({ strapi }: { strapi: Strapi }) => ({
  // WebSocket连接管理
  connections: new Map<string, any>(),

  // 添加连接
  addConnection(userId: string, connection: any) {
    this.connections.set(userId, connection);
    console.log(`用户 ${userId} 已连接WebSocket`);
  },

  // 移除连接
  removeConnection(userId: string) {
    this.connections.delete(userId);
    console.log(`用户 ${userId} 已断开WebSocket连接`);
  },

  // 向特定用户发送消息
  sendToUser(userId: string, event: string, data: any) {
    const connection = this.connections.get(userId);
    if (connection && connection.readyState === 1) { // WebSocket.OPEN
      try {
        connection.send(JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString()
        }));
        console.log(`向用户 ${userId} 发送 ${event} 事件`);
      } catch (error) {
        console.error(`向用户 ${userId} 发送消息失败:`, error);
        this.removeConnection(userId);
      }
    }
  },

  // 广播消息给所有连接的用户
  broadcast(event: string, data: any) {
    this.connections.forEach((connection, userId) => {
      this.sendToUser(userId, event, data);
    });
  },

  // 发送团队订单更新
  async sendTeamOrdersUpdate(userId: string) {
    try {
      // 获取用户的团队订单数据
      const authController = strapi.controller('api::auth.auth');
      const ctx = {
        state: { user: { id: userId } },
        query: { page: 1, pageSize: 20 }
      } as any;

      const result = await authController.getTeamOrders(ctx);
      
      if (result && result.success) {
        this.sendToUser(userId, 'team_orders_update', result.data);
      }
    } catch (error) {
      console.error(`获取用户 ${userId} 团队订单更新失败:`, error);
    }
  },

  // 发送邀请奖励更新
  async sendInvitationRewardUpdate(userId: string, rewardData: any) {
    this.sendToUser(userId, 'invitation_reward_update', {
      rewardId: rewardData.rewardId,
      rewardAmount: rewardData.rewardAmount,
      inviterId: rewardData.inviterId,
      inviterUsername: rewardData.inviterUsername,
      parentTier: rewardData.parentTier,
      calculation: rewardData.calculation,
      timestamp: new Date().toISOString()
    });
  },

  // 发送订单状态更新
  async sendOrderStatusUpdate(userId: string, orderData: any) {
    this.sendToUser(userId, 'order_status_update', {
      orderId: orderData.id,
      status: orderData.status,
      amount: orderData.amount,
      planName: orderData.jihua?.name,
      timestamp: new Date().toISOString()
    });
  },

  // 获取连接统计
  getConnectionStats() {
    return {
      totalConnections: this.connections.size,
      connectedUsers: Array.from(this.connections.keys())
    };
  }
});
