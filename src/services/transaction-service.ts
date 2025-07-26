import { Strapi } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default ({ strapi }: { strapi: Strapi }) => ({
  // 执行投资事务
  async executeInvestmentTransaction(userId: number, planId: number, investmentAmount: Decimal) {
    const knex = strapi.connection;
    
    return await knex.transaction(async (trx) => {
      try {
        // 1. 锁定用户钱包记录
        const wallet = await trx('qianbao_yues')
          .where('user', userId)
          .forUpdate()
          .first();
        
        if (!wallet) {
          throw new Error('用户钱包不存在');
        }
        
        const currentBalance = new Decimal(wallet.usdt_yue || 0);
        if (currentBalance.lessThan(investmentAmount)) {
          throw new Error('钱包余额不足');
        }
        
        // 2. 更新钱包余额
        const newBalance = currentBalance.minus(investmentAmount);
        await trx('qianbao_yues')
          .where('id', wallet.id)
          .update({ usdt_yue: newBalance.toString() });
        
        // 3. 获取计划信息
        const plan = await trx('dinggou_jihuas')
          .where('id', planId)
          .first();
        
        if (!plan) {
          throw new Error('认购计划不存在');
        }
        
        // 4. 创建投资订单
        const [orderId] = await trx('dinggou_dingdans').insert({
          user: userId,
          jihua: planId,
          amount: investmentAmount.toString(),
          principal: investmentAmount.toString(),
          yield_rate: plan.jingtai_bili,
          cycle_days: plan.zhou_qi_tian,
          start_at: new Date(),
          end_at: new Date(Date.now() + plan.zhou_qi_tian * 24 * 60 * 60 * 1000),
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date()
        });
        
        // 5. 更新计划当前槽位
        await trx('dinggou_jihuas')
          .where('id', planId)
          .increment('current_slots', 1);
        
        return {
          orderId,
          newBalance: newBalance.toString(),
          planName: plan.name,
          planCode: plan.jihua_code
        };
        
      } catch (error) {
        console.error('投资事务失败:', error);
        throw error;
      }
    });
  },
  
  // 执行赎回事务
  async executeRedemptionTransaction(orderId: number, userId: number) {
    const knex = strapi.connection;
    
    return await knex.transaction(async (trx) => {
      try {
        // 1. 锁定订单记录
        const order = await trx('dinggou_dingdans')
          .where('id', orderId)
          .where('user', userId)
          .forUpdate()
          .first();
        
        if (!order) {
          throw new Error('订单不存在');
        }
        
        if (order.status !== 'finished') {
          throw new Error('订单尚未完成，无法赎回');
        }
        
        // 2. 获取计划信息
        const plan = await trx('dinggou_jihuas')
          .where('id', order.jihua)
          .first();
        
        // 3. 计算收益
        const investmentAmount = new Decimal(order.amount);
        const yieldRate = new Decimal(order.yield_rate);
        const cycleDays = order.cycle_days;
        
        const staticYield = investmentAmount.mul(yieldRate).mul(cycleDays).div(365);
        const totalPayout = investmentAmount.plus(staticYield);
        
        // 4. 更新钱包余额
        const wallet = await trx('qianbao_yues')
          .where('user', userId)
          .forUpdate()
          .first();
        
        if (wallet) {
          const currentBalance = new Decimal(wallet.usdt_yue || 0);
          await trx('qianbao_yues')
            .where('id', wallet.id)
            .update({ 
              usdt_yue: currentBalance.plus(totalPayout).toString(),
              updated_at: new Date()
            });
        }
        
        // 5. 更新订单状态
        await trx('dinggou_dingdans')
          .where('id', orderId)
          .update({
            status: 'redeemed',
            redeemed_at: new Date(),
            payout_amount: totalPayout.toString(),
            updated_at: new Date()
          });
        
        return {
          orderId,
          investmentAmount: investmentAmount.toString(),
          staticYield: staticYield.toString(),
          totalPayout: totalPayout.toString()
        };
        
      } catch (error) {
        console.error('赎回事务失败:', error);
        throw error;
      }
    });
  },
  
  // 执行邀请奖励事务
  async executeInvitationRewardTransaction(tuijianRenId: number, laiyuanRenId: number, rewardAmount: Decimal, orderId: number) {
    const knex = strapi.connection;
    
    return await knex.transaction(async (trx) => {
      try {
        // 1. 创建奖励记录
        const [rewardId] = await trx('yaoqing_jianglis').insert({
          shouyi_usdt: rewardAmount.toString(),
          tuijian_ren: tuijianRenId,
          laiyuan_ren: laiyuanRenId,
          laiyuan_dan: orderId,
          created_at: new Date(),
          updated_at: new Date()
        });
        
        // 2. 更新推荐人钱包余额
        const wallet = await trx('qianbao_yues')
          .where('user', tuijianRenId)
          .forUpdate()
          .first();
        
        if (wallet) {
          const currentBalance = new Decimal(wallet.usdt_yue || 0);
          await trx('qianbao_yues')
            .where('id', wallet.id)
            .update({
              usdt_yue: currentBalance.plus(rewardAmount).toString(),
              updated_at: new Date()
            });
        }
        
        return { rewardId };
        
      } catch (error) {
        console.error('邀请奖励事务失败:', error);
        throw error;
      }
    });
  }
}); 