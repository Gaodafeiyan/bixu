#!/usr/bin/env node

/**
 * 重置区块链检查点
 * 将 last_processed_block 设置为当前区块-300，重新扫描最近交易
 */

const { Strapi } = require('@strapi/strapi');
const Web3 = require('web3');

async function resetBlockchainCheckpoint() {
  try {
    console.log('🔧 开始重置区块链检查点...');
    
    // 初始化Strapi
    const strapi = await Strapi().load();
    
    // 获取BSC RPC节点
    const rpcUrl = process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org/';
    const web3 = new Web3(rpcUrl);
    
    // 获取当前区块高度
    const currentBlock = await web3.eth.getBlockNumber();
    console.log(`📍 当前区块高度: ${currentBlock}`);
    
    // 设置回退300个区块
    const targetBlock = Math.max(0, currentBlock - 300);
    console.log(`📍 目标区块高度: ${targetBlock} (回退300个区块)`);
    
    // 更新系统配置
    const existing = await strapi.entityService.findMany('api::system-config.system-config', {
      filters: { key: 'last_processed_block' },
      fields: ['id'],
      limit: 1
    });
    
    if (existing && existing.length > 0) {
      await strapi.entityService.update('api::system-config.system-config', existing[0].id, {
        data: { value: targetBlock.toString() }
      });
      console.log(`✅ 更新检查点: ${existing[0].id} -> ${targetBlock}`);
    } else {
      await strapi.entityService.create('api::system-config.system-config', {
        data: { key: 'last_processed_block', value: targetBlock.toString() }
      });
      console.log(`✅ 创建新检查点: ${targetBlock}`);
    }
    
    console.log('🎉 区块链检查点重置完成！');
    console.log(`💡 系统将在下次扫描时从区块 ${targetBlock} 开始重新扫描`);
    console.log(`💡 建议重启区块链监控服务以立即生效`);
    
  } catch (error) {
    console.error('❌ 重置区块链检查点失败:', error);
  } finally {
    process.exit(0);
  }
}

// 运行重置脚本
resetBlockchainCheckpoint();
