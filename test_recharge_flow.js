const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testRechargeFlow() {
  console.log('🔍 测试充值流程...\n');
  console.log(`服务器地址: ${BASE_URL}\n`);

  // 1. 测试用户登录
  console.log('1. 测试用户登录...');
  let token = null;
  try {
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: '852',
      password: '123456'
    });
    
    token = loginResponse.data.jwt;
    const userId = loginResponse.data.user.id;
    console.log('✅ 登录成功');
    console.log(`   用户ID: ${userId}`);
    console.log(`   用户名: ${loginResponse.data.user.username}`);
  } catch (error) {
    console.log('❌ 登录失败:', error.response?.data || error.message);
    return;
  }

  // 2. 检查用户钱包余额
  console.log('\n2. 检查用户钱包余额...');
  try {
    const walletResponse = await axios.get(`${BASE_URL}/api/qianbao-yues/user-wallet`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (walletResponse.data.success) {
      const wallet = walletResponse.data.data;
      console.log('✅ 钱包余额获取成功');
      console.log(`   USDT余额: ${wallet.usdtYue}`);
      console.log(`   AI余额: ${wallet.aiYue}`);
    } else {
      console.log('❌ 钱包余额获取失败:', walletResponse.data.message);
    }
  } catch (error) {
    console.log('❌ 钱包余额获取失败:', error.response?.data || error.message);
  }

  // 3. 检查充值通道
  console.log('\n3. 检查充值通道...');
  try {
    const channelsResponse = await axios.get(`${BASE_URL}/api/recharge-channels/available-channels`);
    
    if (channelsResponse.data.success) {
      const channels = channelsResponse.data.data;
      console.log('✅ 充值通道获取成功');
      console.log(`   可用通道数量: ${channels.length}`);
      channels.forEach((channel, index) => {
        console.log(`   通道${index + 1}: ${channel.name} (${channel.network})`);
      });
    } else {
      console.log('❌ 充值通道获取失败:', channelsResponse.data.message);
    }
  } catch (error) {
    console.log('❌ 充值通道获取失败:', error.response?.data || error.message);
  }

  // 4. 检查充值订单
  console.log('\n4. 检查充值订单...');
  try {
    const ordersResponse = await axios.get(`${BASE_URL}/api/recharge-orders`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { 'filters[user][id]': 2 }
    });
    
    if (ordersResponse.data.data) {
      const orders = ordersResponse.data.data;
      console.log('✅ 充值订单获取成功');
      console.log(`   订单数量: ${orders.length}`);
      orders.forEach((order, index) => {
        console.log(`   订单${index + 1}: ${order.orderNo} - ${order.amount} USDT - ${order.status}`);
      });
    } else {
      console.log('❌ 充值订单获取失败:', ordersResponse.data.message);
    }
  } catch (error) {
    console.log('❌ 充值订单获取失败:', error.response?.data || error.message);
  }

  // 5. 检查区块链监控状态
  console.log('\n5. 检查区块链监控状态...');
  try {
    const blockchainResponse = await axios.get(`${BASE_URL}/api/recharge-channels/test-blockchain`);
    
    if (blockchainResponse.data.success) {
      console.log('✅ 区块链服务正常');
      console.log(`   钱包地址: ${blockchainResponse.data.data.walletAddress}`);
      console.log(`   钱包余额: ${blockchainResponse.data.data.balance} USDT`);
    } else {
      console.log('❌ 区块链服务异常:', blockchainResponse.data.message);
    }
  } catch (error) {
    console.log('❌ 区块链服务检查失败:', error.response?.data || error.message);
  }

  // 6. 检查系统配置
  console.log('\n6. 检查系统配置...');
  try {
    const configResponse = await axios.get(`${BASE_URL}/api/system-configs`);
    
    if (configResponse.data.data) {
      const configs = configResponse.data.data;
      console.log('✅ 系统配置获取成功');
      configs.forEach((config, index) => {
        console.log(`   配置${index + 1}: ${config.key} = ${config.value}`);
      });
    } else {
      console.log('❌ 系统配置获取失败:', configResponse.data.message);
    }
  } catch (error) {
    console.log('❌ 系统配置获取失败:', error.response?.data || error.message);
  }

  console.log('\n🎯 充值流程测试完成！');
  console.log('\n📋 问题排查建议:');
  console.log('1. 如果区块链服务异常，检查BSC节点连接');
  console.log('2. 如果充值订单状态异常，检查订单处理逻辑');
  console.log('3. 如果钱包余额未更新，检查余额更新逻辑');
  console.log('4. 检查定时任务是否正常运行');
}

// 运行测试
testRechargeFlow().catch(console.error);