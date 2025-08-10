#!/usr/bin/env node

/**
 * 为现有用户创建缺失的钱包
 * 运行方式: node scripts/create-missing-wallets.js
 */

const { Strapi } = require('@strapi/strapi');
const path = require('path');

async function createMissingWallets() {
  try {
    console.log('🚀 开始为现有用户创建缺失的钱包...');
    
    // 初始化Strapi
    const strapi = await Strapi({
      appPath: path.resolve(__dirname, '..'),
      distPath: path.resolve(__dirname, '../dist'),
      autoReload: false,
      serveAdminPanel: false,
    }).load();
    
    console.log('✅ Strapi 初始化成功');
    
    // 获取所有用户
    const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
      populate: ['qianbao']
    });
    
    console.log(`📊 找到 ${users.length} 个用户`);
    
    let createdCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const user of users) {
      try {
        // 检查用户是否已有钱包
        if (user.qianbao) {
          console.log(`⚠️ 用户 ${user.username} (ID: ${user.id}) 已有钱包，跳过`);
          skippedCount++;
          continue;
        }
        
        // 创建钱包
        const wallet = await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
          data: {
            usdtYue: '0',
            aiYue: '0',
            aiTokenBalances: '{}',
            user: user.id
          }
        });
        
        console.log(`✅ 为用户 ${user.username} (ID: ${user.id}) 创建钱包成功，钱包ID: ${wallet.id}`);
        createdCount++;
        
      } catch (error) {
        console.error(`❌ 为用户 ${user.username} (ID: ${user.id}) 创建钱包失败:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 钱包创建统计:');
    console.log(`✅ 成功创建: ${createdCount} 个`);
    console.log(`⚠️ 已存在跳过: ${skippedCount} 个`);
    console.log(`❌ 创建失败: ${errorCount} 个`);
    
    if (createdCount > 0) {
      console.log('\n🎉 钱包创建完成！现在充值应该能正常到账了');
    }
    
  } catch (error) {
    console.error('❌ 脚本执行失败:', error);
  } finally {
    process.exit(0);
  }
}

// 运行脚本
createMissingWallets();
