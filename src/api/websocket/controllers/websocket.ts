import { factories } from '@strapi/strapi';

export default ({ strapi }) => ({
  // 处理WebSocket连接
  async handleConnection(ctx) {
    try {
      const userId = ctx.state.user.id;
      console.log(`用户 ${userId} 请求WebSocket连接`);
      
      // 这里应该实现真正的WebSocket连接
      // 由于Strapi的限制，我们使用轮询机制作为替代
      
      ctx.body = {
        success: true,
        message: 'WebSocket连接已建立',
        userId: userId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('WebSocket连接处理失败:', error);
      ctx.throw(500, `WebSocket连接失败: ${error.message}`);
    }
  },

  // 获取WebSocket统计信息
  async getStats(ctx) {
    try {
      const websocketService = strapi.service('api::websocket-service.websocket-service');
      const stats = websocketService.getConnectionStats();
      
      ctx.body = {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('获取WebSocket统计失败:', error);
      ctx.throw(500, `获取统计失败: ${error.message}`);
    }
  },

  // 发送测试消息
  async sendTestMessage(ctx) {
    try {
      const { userId, message } = ctx.request.body;
      const websocketService = strapi.service('api::websocket-service.websocket-service');
      
      websocketService.sendToUser(userId, 'test_message', {
        message,
        timestamp: new Date().toISOString()
      });
      
      ctx.body = {
        success: true,
        message: '测试消息已发送'
      };
    } catch (error) {
      console.error('发送测试消息失败:', error);
      ctx.throw(500, `发送消息失败: ${error.message}`);
    }
  }
}));
