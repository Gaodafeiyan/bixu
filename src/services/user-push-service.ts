import { HybridPushService } from './push/hybrid-push';
import { Strapi } from '@strapi/strapi';

export class UserPushService {
  private strapi: Strapi;
  private pushService: HybridPushService;

  constructor(strapi: Strapi) {
    this.strapi = strapi;
    this.pushService = new HybridPushService(strapi);
  }

  // ==================== 认购相关推送 ====================

  /**
   * 认购成功推送
   */
  async sendSubscriptionSuccessPush(userId: number, planName: string, amount: number, planId: number) {
    try {
      const title = '认购成功';
      const body = `恭喜您成功认购${planName}，认购金额${amount}元`;
      const data = {
        type: 'subscription_success',
        planId,
        amount,
        timestamp: new Date().toISOString()
      };

      console.log(`📈 发送认购成功推送: 用户${userId}, 计划${planName}`);
      
      const result = await this.pushService.sendToUser(userId, title, body, data);
      
      console.log(`✅ 认购成功推送发送完成:`, result);
      return result;
    } catch (error) {
      console.error('❌ 认购成功推送发送失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 认购到期推送
   */
  async sendSubscriptionExpiredPush(userId: number, planName: string, profit: number, planId: number) {
    try {
      const title = '认购到期';
      const body = `您的认购${planName}已到期，收益${profit}元已到账`;
      const data = {
        type: 'subscription_expired',
        planId,
        profit,
        timestamp: new Date().toISOString()
      };

      console.log(`📈 发送认购到期推送: 用户${userId}, 计划${planName}, 收益${profit}`);
      
      const result = await this.pushService.sendToUser(userId, title, body, data);
      
      console.log(`✅ 认购到期推送发送完成:`, result);
      return result;
    } catch (error) {
      console.error('❌ 认购到期推送发送失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 认购提醒推送（即将到期）
   */
  async sendSubscriptionReminderPush(userId: number, planName: string, daysLeft: number, planId: number) {
    try {
      const title = '认购提醒';
      const body = `您的认购${planName}将在${daysLeft}天后到期`;
      const data = {
        type: 'subscription_reminder',
        planId,
        daysLeft,
        timestamp: new Date().toISOString()
      };

      console.log(`📈 发送认购提醒推送: 用户${userId}, 计划${planName}, 剩余${daysLeft}天`);
      
      const result = await this.pushService.sendToUser(userId, title, body, data);
      
      console.log(`✅ 认购提醒推送发送完成:`, result);
      return result;
    } catch (error) {
      console.error('❌ 认购提醒推送发送失败:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== 赎回相关推送 ====================

  /**
   * 赎回成功推送
   */
  async sendRedemptionSuccessPush(userId: number, planName: string, amount: number, profit: number, planId: number) {
    try {
      const title = '赎回成功';
      const body = `您的${planName}赎回成功，本金${amount}元，收益${profit}元`;
      const data = {
        type: 'redemption_success',
        planId,
        amount,
        profit,
        timestamp: new Date().toISOString()
      };

      console.log(`💰 发送赎回成功推送: 用户${userId}, 计划${planName}, 本金${amount}, 收益${profit}`);
      
      const result = await this.pushService.sendToUser(userId, title, body, data);
      
      console.log(`✅ 赎回成功推送发送完成:`, result);
      return result;
    } catch (error) {
      console.error('❌ 赎回成功推送发送失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 赎回失败推送
   */
  async sendRedemptionFailedPush(userId: number, planName: string, reason: string, planId: number) {
    try {
      const title = '赎回失败';
      const body = `您的${planName}赎回失败：${reason}`;
      const data = {
        type: 'redemption_failed',
        planId,
        reason,
        timestamp: new Date().toISOString()
      };

      console.log(`❌ 发送赎回失败推送: 用户${userId}, 计划${planName}, 原因${reason}`);
      
      const result = await this.pushService.sendToUser(userId, title, body, data);
      
      console.log(`✅ 赎回失败推送发送完成:`, result);
      return result;
    } catch (error) {
      console.error('❌ 赎回失败推送发送失败:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== 兑换相关推送 ====================

  /**
   * 代币兑换成功推送
   */
  async sendTokenExchangeSuccessPush(userId: number, fromToken: string, toToken: string, amount: number, exchangeAmount: number) {
    try {
      const title = '兑换成功';
      const body = `成功兑换${amount}${fromToken}为${exchangeAmount}${toToken}`;
      const data = {
        type: 'token_exchange_success',
        fromToken,
        toToken,
        amount,
        exchangeAmount,
        timestamp: new Date().toISOString()
      };

      console.log(`🔄 发送代币兑换成功推送: 用户${userId}, ${amount}${fromToken} -> ${exchangeAmount}${toToken}`);
      
      const result = await this.pushService.sendToUser(userId, title, body, data);
      
      console.log(`✅ 代币兑换成功推送发送完成:`, result);
      return result;
    } catch (error) {
      console.error('❌ 代币兑换成功推送发送失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 代币兑换失败推送
   */
  async sendTokenExchangeFailedPush(userId: number, fromToken: string, toToken: string, reason: string) {
    try {
      const title = '兑换失败';
      const body = `兑换${fromToken}为${toToken}失败：${reason}`;
      const data = {
        type: 'token_exchange_failed',
        fromToken,
        toToken,
        reason,
        timestamp: new Date().toISOString()
      };

      console.log(`❌ 发送代币兑换失败推送: 用户${userId}, ${fromToken} -> ${toToken}, 原因${reason}`);
      
      const result = await this.pushService.sendToUser(userId, title, body, data);
      
      console.log(`✅ 代币兑换失败推送发送完成:`, result);
      return result;
    } catch (error) {
      console.error('❌ 代币兑换失败推送发送失败:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== 充值相关推送 ====================

  /**
   * 充值成功推送
   */
  async sendRechargeSuccessPush(userId: number, amount: number, currency: string = 'USDT') {
    try {
      const title = '充值成功';
      const body = `充值成功，到账${amount}${currency}`;
      const data = {
        type: 'recharge_success',
        amount,
        currency,
        timestamp: new Date().toISOString()
      };

      console.log(`💳 发送充值成功推送: 用户${userId}, 金额${amount}${currency}`);
      
      const result = await this.pushService.sendToUser(userId, title, body, data);
      
      console.log(`✅ 充值成功推送发送完成:`, result);
      return result;
    } catch (error) {
      console.error('❌ 充值成功推送发送失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 充值失败推送
   */
  async sendRechargeFailedPush(userId: number, amount: number, reason: string, currency: string = 'USDT') {
    try {
      const title = '充值失败';
      const body = `充值${amount}${currency}失败：${reason}`;
      const data = {
        type: 'recharge_failed',
        amount,
        currency,
        reason,
        timestamp: new Date().toISOString()
      };

      console.log(`❌ 发送充值失败推送: 用户${userId}, 金额${amount}${currency}, 原因${reason}`);
      
      const result = await this.pushService.sendToUser(userId, title, body, data);
      
      console.log(`✅ 充值失败推送发送完成:`, result);
      return result;
    } catch (error) {
      console.error('❌ 充值失败推送发送失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 充值订单创建推送
   */
  async sendRechargeOrderCreatedPush(userId: number, amount: number, orderNo: string, address: string, currency: string = 'USDT') {
    try {
      const title = '充值订单创建';
      const body = `充值订单${orderNo}已创建，请向地址${address.substring(0, 10)}...转账${amount}${currency}`;
      const data = {
        type: 'recharge_order_created',
        amount,
        currency,
        orderNo,
        address,
        timestamp: new Date().toISOString()
      };

      console.log(`📝 发送充值订单创建推送: 用户${userId}, 订单${orderNo}, 金额${amount}${currency}`);
      
      const result = await this.pushService.sendToUser(userId, title, body, data);
      
      console.log(`✅ 充值订单创建推送发送完成:`, result);
      return result;
    } catch (error) {
      console.error('❌ 充值订单创建推送发送失败:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== 提现相关推送 ====================

  /**
   * 提现成功推送
   */
  async sendWithdrawalSuccessPush(userId: number, amount: number, currency: string = 'USDT') {
    try {
      const title = '提现成功';
      const body = `提现成功，${amount}${currency}已到账`;
      const data = {
        type: 'withdrawal_success',
        amount,
        currency,
        timestamp: new Date().toISOString()
      };

      console.log(`💸 发送提现成功推送: 用户${userId}, 金额${amount}${currency}`);
      
      const result = await this.pushService.sendToUser(userId, title, body, data);
      
      console.log(`✅ 提现成功推送发送完成:`, result);
      return result;
    } catch (error) {
      console.error('❌ 提现成功推送发送失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 提现失败推送
   */
  async sendWithdrawalFailedPush(userId: number, amount: number, reason: string, currency: string = 'USDT') {
    try {
      const title = '提现失败';
      const body = `提现${amount}${currency}失败：${reason}`;
      const data = {
        type: 'withdrawal_failed',
        amount,
        currency,
        reason,
        timestamp: new Date().toISOString()
      };

      console.log(`❌ 发送提现失败推送: 用户${userId}, 金额${amount}${currency}, 原因${reason}`);
      
      const result = await this.pushService.sendToUser(userId, title, body, data);
      
      console.log(`✅ 提现失败推送发送完成:`, result);
      return result;
    } catch (error) {
      console.error('❌ 提现失败推送发送失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 提现订单创建推送
   */
  async sendWithdrawalOrderCreatedPush(userId: number, amount: number, orderNo: string, currency: string = 'USDT') {
    try {
      const title = '提现订单创建';
      const body = `提现订单${orderNo}已创建，金额${amount}${currency}，请等待处理`;
      const data = {
        type: 'withdrawal_order_created',
        amount,
        currency,
        orderNo,
        timestamp: new Date().toISOString()
      };

      console.log(`📝 发送提现订单创建推送: 用户${userId}, 订单${orderNo}, 金额${amount}${currency}`);
      
      const result = await this.pushService.sendToUser(userId, title, body, data);
      
      console.log(`✅ 提现订单创建推送发送完成:`, result);
      return result;
    } catch (error) {
      console.error('❌ 提现订单创建推送发送失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 提现处理中推送
   */
  async sendWithdrawalProcessingPush(userId: number, amount: number, orderNo: string, currency: string = 'USDT') {
    try {
      const title = '提现处理中';
      const body = `提现订单${orderNo}正在处理中，金额${amount}${currency}`;
      const data = {
        type: 'withdrawal_processing',
        amount,
        currency,
        orderNo,
        timestamp: new Date().toISOString()
      };

      console.log(`⏳ 发送提现处理中推送: 用户${userId}, 订单${orderNo}, 金额${amount}${currency}`);
      
      const result = await this.pushService.sendToUser(userId, title, body, data);
      
      console.log(`✅ 提现处理中推送发送完成:`, result);
      return result;
    } catch (error) {
      console.error('❌ 提现处理中推送发送失败:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== 系统通知推送 ====================

  /**
   * 系统公告推送
   */
  async sendSystemAnnouncementPush(userId: number, title: string, content: string, announcementId: number) {
    try {
      const data = {
        type: 'system_announcement',
        announcementId,
        timestamp: new Date().toISOString()
      };

      console.log(`📢 发送系统公告推送: 用户${userId}, 公告${announcementId}`);
      
      const result = await this.pushService.sendToUser(userId, title, content, data);
      
      console.log(`✅ 系统公告推送发送完成:`, result);
      return result;
    } catch (error) {
      console.error('❌ 系统公告推送发送失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 下级认购成功奖励推送（上级获得奖励）
   */
  async sendSubordinateSubscriptionRewardPush(userId: number, subordinateName: string, planName: string, rewardAmount: number, rewardType: string) {
    try {
      const title = '下级认购奖励';
      const body = `您的下级${subordinateName}认购${planName}成功，您获得${rewardAmount}${rewardType}奖励`;
      const data = {
        type: 'subordinate_subscription_reward',
        subordinateName,
        planName,
        rewardAmount,
        rewardType,
        timestamp: new Date().toISOString()
      };

      console.log(`🎁 发送下级认购奖励推送: 用户${userId}, 下级${subordinateName}, 计划${planName}, 奖励${rewardAmount}${rewardType}`);
      
      const result = await this.pushService.sendToUser(userId, title, body, data);
      
      console.log(`✅ 下级认购奖励推送发送完成:`, result);
      return result;
    } catch (error) {
      console.error('❌ 下级认购奖励推送发送失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 下级赎回成功奖励推送（上级获得最终奖励）
   */
  async sendSubordinateRedemptionRewardPush(userId: number, subordinateName: string, planName: string, rewardAmount: number, rewardType: string) {
    try {
      const title = '下级赎回奖励';
      const body = `您的下级${subordinateName}赎回${planName}成功，您获得${rewardAmount}${rewardType}最终奖励`;
      const data = {
        type: 'subordinate_redemption_reward',
        subordinateName,
        planName,
        rewardAmount,
        rewardType,
        timestamp: new Date().toISOString()
      };

      console.log(`💰 发送下级赎回奖励推送: 用户${userId}, 下级${subordinateName}, 计划${planName}, 奖励${rewardAmount}${rewardType}`);
      
      const result = await this.pushService.sendToUser(userId, title, body, data);
      
      console.log(`✅ 下级赎回奖励推送发送完成:`, result);
      return result;
    } catch (error) {
      console.error('❌ 下级赎回奖励推送发送失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 团队业绩奖励推送
   */
  async sendTeamPerformanceRewardPush(userId: number, teamLevel: string, performanceAmount: number, rewardAmount: number, rewardType: string) {
    try {
      const title = '团队业绩奖励';
      const body = `恭喜您获得${teamLevel}团队业绩奖励，团队业绩${performanceAmount}，奖励${rewardAmount}${rewardType}`;
      const data = {
        type: 'team_performance_reward',
        teamLevel,
        performanceAmount,
        rewardAmount,
        rewardType,
        timestamp: new Date().toISOString()
      };

      console.log(`🏆 发送团队业绩奖励推送: 用户${userId}, 级别${teamLevel}, 业绩${performanceAmount}, 奖励${rewardAmount}${rewardType}`);
      
      const result = await this.pushService.sendToUser(userId, title, body, data);
      
      console.log(`✅ 团队业绩奖励推送发送完成:`, result);
      return result;
    } catch (error) {
      console.error('❌ 团队业绩奖励推送发送失败:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== 批量推送方法 ====================

  /**
   * 批量发送认购到期提醒推送
   */
  async sendBatchSubscriptionReminders() {
    try {
      console.log('📅 开始批量发送认购到期提醒...');
      
      // 查询3天内到期的认购订单
      const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      
      const expiringSubscriptions = await this.strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
        filters: {
          status: 'running',
          end_at: {
            $lte: threeDaysFromNow
          }
        },
        populate: {
          user: true,
          jihua: true
        }
      }) as any[];

      console.log(`📈 找到${expiringSubscriptions.length}个即将到期的认购`);

      for (const subscription of expiringSubscriptions) {
        const daysLeft = Math.ceil((new Date(subscription.end_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        
        await this.sendSubscriptionReminderPush(
          subscription.user.id,
          subscription.jihua?.name || '未知计划',
          daysLeft
        );
        
        // 避免发送过快
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log(`✅ 批量认购到期提醒发送完成，共${expiringSubscriptions.length}条`);
      return { success: true, count: expiringSubscriptions.length };
    } catch (error) {
      console.error('❌ 批量认购到期提醒发送失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 批量发送系统公告
   */
  async sendBatchSystemAnnouncement(userIds: number[], title: string, content: string, announcementId: number) {
    try {
      console.log(`📢 开始批量发送系统公告: ${userIds.length}个用户`);
      
      const results = [];
      for (const userId of userIds) {
        const result = await this.sendSystemAnnouncementPush(userId, title, content, announcementId);
        results.push({ userId, result });
      }

      console.log('✅ 批量系统公告发送完成');
      return results;
    } catch (error) {
      console.error('❌ 批量系统公告发送失败:', error);
      return [];
    }
  }
}
