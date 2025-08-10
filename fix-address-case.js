#!/usr/bin/env node

/**
 * 批量修复地址大小写问题
 * 将充值通道和充值订单中的地址统一转换为小写
 */

const { Strapi } = require('@strapi/strapi');

async function fixAddressCase() {
  try {
    console.log('🔧 开始修复地址大小写问题...');
    
    // 初始化Strapi
    const strapi = await Strapi().load();
    
    // 1. 修复充值通道的地址
    console.log('📝 修复充值通道地址...');
    const channels = await strapi.entityService.findMany('api::recharge-channel.recharge-channel', {
      filters: { status: 'active' }
    });
    
    for (const channel of channels) {
      if (channel.walletAddress && channel.walletAddress !== channel.walletAddress.toLowerCase()) {
        await strapi.entityService.update('api::recharge-channel.recharge-channel', channel.id, {
          data: { walletAddress: channel.walletAddress.toLowerCase() }
        });
        console.log(`✅ 修复通道 ${channel.name}: ${channel.walletAddress} -> ${channel.walletAddress.toLowerCase()}`);
      }
    }
    
    // 2. 修复充值订单的地址
    console.log('📝 修复充值订单地址...');
    const orders = await strapi.entityService.findMany('api::recharge-order.recharge-order', {
      filters: { status: { $in: ['pending', 'completed', 'failed'] } }
    });
    
    let fixedOrders = 0;
    for (const order of orders) {
      if (order.receiveAddress && order.receiveAddress !== order.receiveAddress.toLowerCase()) {
        await strapi.entityService.update('api::recharge-order.recharge-order', order.id, {
          data: { receiveAddress: order.receiveAddress.toLowerCase() }
        });
        fixedOrders++;
        if (fixedOrders % 10 === 0) {
          console.log(`✅ 已修复 ${fixedOrders} 个订单地址`);
        }
      }
    }
    
    console.log(`✅ 总共修复了 ${fixedOrders} 个订单地址`);
    
    // 3. 验证修复结果
    console.log('🔍 验证修复结果...');
    const activeChannels = await strapi.entityService.findMany('api::recharge-channel.recharge-channel', {
      filters: { status: 'active' }
    });
    
    const allLowercase = activeChannels.every(ch => 
      !ch.walletAddress || ch.walletAddress === ch.walletAddress.toLowerCase()
    );
    
    if (allLowercase) {
      console.log('✅ 所有充值通道地址已修复为小写');
    } else {
      console.log('⚠️ 仍有部分充值通道地址未修复');
    }
    
    console.log('🎉 地址大小写修复完成！');
    
  } catch (error) {
    console.error('❌ 修复地址大小写失败:', error);
  } finally {
    process.exit(0);
  }
}

// 运行修复脚本
fixAddressCase();
