const API_BASE_URL = 'http://118.107.4.158:1337';

async function fixRemotePrizeType() {
  try {
    console.log('🔧 开始修复远程数据库中的奖品类型...');
    
    // 1. 查找宝马x5奖品
    const findResponse = await fetch(`${API_BASE_URL}/api/choujiang-jiangpins?filters[name][$contains]=宝马x5`);
    const findData = await findResponse.json();
    
    console.log('远程API响应:', JSON.stringify(findData, null, 2));
    
    if (findData.results && findData.results.length > 0) {
      const prize = findData.results[0];
      console.log(`📦 找到远程奖品: ${prize.name}, 当前类型: ${prize.jiangpinType}`);
      
      // 2. 更新远程数据库中的奖品类型为physical
      const updateResponse = await fetch(`${API_BASE_URL}/api/choujiang-jiangpins/${prize.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            jiangpinType: 'physical'
          }
        })
      });
      
      const updateData = await updateResponse.json();
      
      if (updateData.data) {
        console.log(`✅ 成功更新远程奖品类型: ${updateData.data.jiangpinType}`);
      } else {
        console.log('❌ 远程更新失败:', updateData);
      }
    } else {
      console.log('❌ 未找到远程宝马x5奖品');
    }
    
  } catch (error) {
    console.error('❌ 修复远程奖品类型失败:', error.message);
  }
}

fixRemotePrizeType(); 