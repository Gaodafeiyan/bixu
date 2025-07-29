const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function quickFixRecharge() {
  console.log('🚀 快速修复充值问题...\n');
  console.log(`服务器地址: ${BASE_URL}\n`);

  // 1. 登录
  console.log('1. 登录...');
  let token = null;
  try {
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: '852',
      password: '123456'
    });
    
    token = loginResponse.data.jwt;
    console.log('✅ 登录成功');
  } catch (error) {
    console.log('❌ 登录失败:', error.response?.data || error.message);
    return;
  }

  // 2. 直接更新用户钱包余额
  console.log('\n2. 直接更新用户钱包余额...');
  try {
    // 获取用户钱包
    const walletResponse = await axios.get(`${BASE_URL}/api/qianbao-yues/user-wallet`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (walletResponse.data.success) {
      const wallet = walletResponse.data.data;
      const currentBalance = parseFloat(wallet.usdtYue || '0');
      const addAmount = 100; // 添加100 USDT
      const newBalance = currentBalance + addAmount;

      console.log(`   当前余额: ${currentBalance} USDT`);
      console.log(`   添加金额: ${addAmount} USDT`);
      console.log(`   新余额: ${newBalance} USDT`);

      // 更新钱包余额
      const updateResponse = await axios.put(`${BASE_URL}/api/qianbao-yues/${wallet.id}`, {
        data: {
          usdtYue: newBalance.toString()
        }
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (updateResponse.data.data) {
        console.log('✅ 钱包余额更新成功！');
        console.log(`   新余额: ${updateResponse.data.data.usdtYue} USDT`);
      } else {
        console.log('❌ 钱包余额更新失败:', updateResponse.data.message);
      }
    } else {
      console.log('❌ 获取钱包失败:', walletResponse.data.message);
    }
  } catch (error) {
    console.log('❌ 钱包余额更新失败:', error.response?.data || error.message);
  }

  // 3. 检查更新后的余额
  console.log('\n3. 检查更新后的余额...');
  try {
    const checkResponse = await axios.get(`${BASE_URL}/api/qianbao-yues/user-wallet`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (checkResponse.data.success) {
      const wallet = checkResponse.data.data;
      console.log('✅ 余额检查成功');
      console.log(`   USDT余额: ${wallet.usdtYue}`);
      console.log(`   AI余额: ${wallet.aiYue}`);
    } else {
      console.log('❌ 余额检查失败:', checkResponse.data.message);
    }
  } catch (error) {
    console.log('❌ 余额检查失败:', error.response?.data || error.message);
  }

  console.log('\n🎯 快速修复完成！');
  console.log('\n📋 下一步操作:');
  console.log('1. 刷新前端页面查看余额');
  console.log('2. 如果仍有问题，检查前端缓存');
  console.log('3. 检查区块链监控是否正常工作');
}

// 运行快速修复
quickFixRecharge().catch(console.error);