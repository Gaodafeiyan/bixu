const API_BASE_URL = 'http://118.107.4.158:1337';

async function testManualShip() {
  try {
    console.log('🚚 开始测试手动发货...');
    
    // 1. 获取所有发货订单
    const ordersResponse = await fetch(`${API_BASE_URL}/api/shipping-orders/all`);
    const ordersData = await ordersResponse.json();
    
    console.log('📦 所有发货订单:', JSON.stringify(ordersData, null, 2));
    
    if (ordersData.data && ordersData.data.results && ordersData.data.results.length > 0) {
      // 找到pending或processing状态的订单
      const pendingOrder = ordersData.data.results.find(order => 
        order.status === 'pending' || order.status === 'processing'
      );
      
      if (pendingOrder) {
        console.log(`📦 找到${pendingOrder.status}订单: ID ${pendingOrder.id}`);
        
        // 2. 手动发货
        const shipResponse = await fetch(`${API_BASE_URL}/api/shipping-orders/${pendingOrder.id}/manual-ship`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            trackingNo: 'SF1234567890',
            carrier: '顺丰快递'
          })
        });
        
        const shipData = await shipResponse.json();
        console.log('🚚 手动发货结果:', JSON.stringify(shipData, null, 2));
        
        if (shipData.success) {
          console.log('✅ 手动发货成功！');
        } else {
          console.log('❌ 手动发货失败:', shipData.message);
        }
      } else {
        console.log('❌ 没有找到pending或processing状态的订单');
      }
    } else {
      console.log('❌ 没有找到任何发货订单');
    }
    
  } catch (error) {
    console.error('❌ 测试手动发货失败:', error.message);
  }
}

testManualShip(); 