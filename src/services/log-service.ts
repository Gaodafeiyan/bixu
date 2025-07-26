import { Strapi } from '@strapi/strapi';

export default ({ strapi }: { strapi: Strapi }) => ({
  // 记录用户操作日志
  async logUserAction(userId: number, action: string, details: any = {}) {
    try {
      const logEntry = {
        userId,
        action,
        details: JSON.stringify(details),
        timestamp: new Date(),
        ip: details.ip || 'unknown',
        userAgent: details.userAgent || 'unknown'
      };
      
      console.log(`[用户操作] ${new Date().toISOString()} - 用户${userId} - ${action}`, details);
      
      // 这里可以保存到数据库或发送到日志服务
      // await strapi.entityService.create('api::operation-log.operation-log', {
      //   data: logEntry
      // });
      
    } catch (error) {
      console.error('记录用户操作日志失败:', error);
    }
  },

  // 记录系统错误日志
  async logError(error: Error, context: string, userId?: number) {
    try {
      const errorLog = {
        userId: userId || null,
        context,
        error: error.message,
        stack: error.stack,
        timestamp: new Date()
      };
      
      console.error(`[系统错误] ${new Date().toISOString()} - ${context}`, errorLog);
      
      // 这里可以保存到数据库或发送到错误监控服务
      // await strapi.entityService.create('api::error-log.error-log', {
      //   data: errorLog
      // });
      
    } catch (logError) {
      console.error('记录错误日志失败:', logError);
    }
  },

  // 记录投资操作日志
  async logInvestment(userId: number, planId: number, amount: string, action: 'invest' | 'redeem') {
    await this.logUserAction(userId, `投资${action === 'invest' ? '操作' : '赎回'}`, {
      planId,
      amount,
      action,
      timestamp: new Date().toISOString()
    });
  },

  // 记录钱包操作日志
  async logWalletOperation(userId: number, operation: string, details: any) {
    await this.logUserAction(userId, `钱包${operation}`, {
      ...details,
      timestamp: new Date().toISOString()
    });
  },

  // 记录邀请奖励日志
  async logInvitationReward(tuijianRenId: number, laiyuanRenId: number, rewardAmount: string) {
    await this.logUserAction(tuijianRenId, '邀请奖励', {
      laiyuanRenId,
      rewardAmount,
      timestamp: new Date().toISOString()
    });
  },

  // 记录系统性能日志
  async logPerformance(operation: string, duration: number, details: any = {}) {
    try {
      const perfLog = {
        operation,
        duration,
        details: JSON.stringify(details),
        timestamp: new Date()
      };
      
      console.log(`[性能监控] ${new Date().toISOString()} - ${operation} - ${duration}ms`, details);
      
      // 这里可以保存到数据库或发送到性能监控服务
      // await strapi.entityService.create('api::performance-log.performance-log', {
      //   data: perfLog
      // });
      
    } catch (error) {
      console.error('记录性能日志失败:', error);
    }
  }
}); 