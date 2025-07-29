const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function manualRechargeProcess() {
  console.log('🔧 手动处理充值流程...\n');
  console.log(`服务器地址: ${BASE_URL}\n`);

  // 1. 登录获取token
  console.log('1. 登录获取token...');
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

  // 2. 创建充值订单
  console.log('\n2. 创建充值订单...');
  try {
    const orderData = {
      data: {
        user: 2, // 用户ID
        channel: 1, // 充值通道ID
        amount: '100', // 充值金额
        currency: 'USDT',
        status: 'pending',
        orderNo: `R${Date.now()}`, // 生成订单号
        receiveAddress: '0xe3353f75d68f9096aC4A49b4968e56b5DFbd2697', // 接收地址
        expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30分钟后过期
      }
    };

    const orderResponse = await axios.post(`${BASE_URL}/api/recharge-orders`, orderData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (orderResponse.data.data) {
      const order = orderResponse.data.data;
      console.log('✅ 充值订单创建成功');
      console.log(`   订单号: ${order.orderNo}`);
      console.log(`   金额: ${order.amount} ${order.currency}`);
      console.log(`   状态: ${order.status}`);
      console.log(`   接收地址: ${order.receiveAddress}`);
      
      // 3. 模拟交易到账
      console.log('\n3. 模拟交易到账...');
      await simulateTransactionReceived(order.id, order.amount);
      
    } else {
      console.log('❌ 充值订单创建失败:', orderResponse.data.message);
    }
  } catch (error) {
    console.log('❌ 充值订单创建失败:', error.response?.data || error.message);
  }
}

async function simulateTransactionReceived(orderId, amount) {
  try {
    // 更新订单状态为已完成
    const updateData = {
      data: {
        status: 'completed',
        txHash: `0x${Math.random().toString(16).substring(2, 66)}`, // 模拟交易哈希
        blockNumber: 12345678,
        confirmations: 12,
        receivedTime: new Date().toISOString(),
        completedTime: new Date().toISOString()
      }
    };

    const updateResponse = await axios.put(`${BASE_URL}/api/recharge-orders/${orderId}`, updateData);
    
    if (updateResponse.data.data) {
      console.log('✅ 订单状态更新成功');
      
      // 4. 更新用户钱包余额
      console.log('\n4. 更新用户钱包余额...');
      await updateUserWalletBalance(2, amount);
      
    } else {
      console.log('❌ 订单状态更新失败:', updateResponse.data.message);
    }
  } catch (error) {
    console.log('❌ 订单状态更新失败:', error.response?.data || error.message);
  }
}

async function updateUserWalletBalance(userId, amount) {
  try {
    // 获取用户钱包
    const walletResponse = await axios.get(`${BASE_URL}/api/qianbao-yues`, {
      params: { 'filters[user][id]': userId }
    });

    if (walletResponse.data.data && walletResponse.data.data.length > 0) {
      const wallet = walletResponse.data.data[0];
      const currentBalance = parseFloat(wallet.usdtYue || '0');
      const newBalance = currentBalance + parseFloat(amount);

      const updateData = {
        data: {
          usdtYue: newBalance.toString()
        }
      };

      const updateResponse = await axios.put(`${BASE_URL}/api/qianbao-yues/${wallet.id}`, updateData);
      
      if (updateResponse.data.data) {
        console.log('✅ 钱包余额更新成功');
        console.log(`   原余额: ${currentBalance} USDT`);
        console.log(`   充值金额: ${amount} USDT`);
        console.log(`   新余额: ${newBalance} USDT`);
      } else {
        console.log('❌ 钱包余额更新失败:', updateResponse.data.message);
      }
    } else {
      console.log('❌ 未找到用户钱包');
    }
  } catch (error) {
    console.log('❌ 钱包余额更新失败:', error.response?.data || error.message);
  }
}

// 运行手动充值处理
manualRechargeProcess().catch(console.error);