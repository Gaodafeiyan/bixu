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
      // 直接获取用户的团队订单数据，避免控制器调用问题
      const directReferrals = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: { invitedBy: { id: userId } }
      }) as any[];

      const allOrders = [];
      let totalOrders = 0;
      let runningOrders = 0;
      let finishedOrders = 0;
      let totalRewards = 0;
      let pendingRewards = 0;

      // 获取所有订单用于统计
      for (const referral of directReferrals) {
        const orders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
          filters: { user: { id: referral.id } },
          populate: ['jihua'],
          sort: { createdAt: 'desc' }
        }) as any[];
        
        for (const order of orders) {
          totalOrders++;
          
          if (order.status === 'running') {
            runningOrders++;
          } else if (order.status === 'finished') {
            finishedOrders++;
          }

          // 计算奖励统计
          const rewardRecord = await strapi.entityService.findMany('api::yaoqing-jiangli.yaoqing-jiangli', {
            filters: { 
              tuijianRen: { id: userId },
              laiyuanRen: { id: referral.id },
              laiyuanDan: { id: order.id }
            }
          }) as any[];

          if (rewardRecord.length > 0) {
            const rewardAmount = rewardRecord[0].shouyiUSDT || '0';
            totalRewards += parseFloat(rewardAmount);
            
            if (order.status !== 'finished') {
              pendingRewards += parseFloat(rewardAmount);
            }
          }

          // 计算到期时间
          let expiryDate = null;
          let daysRemaining = null;
          
          if (order.createdAt && order.jihua) {
            const createdDate = new Date(order.createdAt);
            const durationDays = order.jihua.duration || 90;
            expiryDate = new Date(createdDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
            
            const now = new Date();
            const remainingMs = expiryDate.getTime() - now.getTime();
            daysRemaining = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
          }

          let rewardAmount = '0';
          let rewardStatus = 'none';
          
          if (rewardRecord.length > 0) {
            rewardAmount = rewardRecord[0].shouyiUSDT || '0';
            
            if (order.status === 'finished') {
              rewardStatus = 'paid';
            } else if (order.status === 'running') {
              rewardStatus = 'pending';
            }
          }

          allOrders.push({
            orderId: order.id,
            username: referral.username,
            registrationDate: referral.createdAt,
            status: order.status,
            planName: order.jihua?.name,
            amount: order.amount,
            principal: order.principal,
            investmentDate: order.start_at,
            expiryDate: expiryDate,
            daysRemaining: daysRemaining,
            rewardAmount: rewardAmount,
            rewardStatus: rewardStatus
          });
        }
      }

      const result = {
        success: true,
        data: {
          totalOrders,
          runningOrders,
          finishedOrders,
          totalRewards: totalRewards.toFixed(2),
          pendingRewards: pendingRewards.toFixed(2),
          orders: allOrders.slice(0, 20), // 只取前20条
          pagination: {
            page: 1,
            pageSize: 20,
            total: allOrders.length,
            totalPages: Math.ceil(allOrders.length / 20),
            hasNext: allOrders.length > 20,
            hasPrev: false
          }
        }
      };
      
      this.sendToUser(userId, 'team_orders_update', result.data);
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
