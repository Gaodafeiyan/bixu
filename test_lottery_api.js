const https = require('https');
const http = require('http');

// 测试函数
function testAPI() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiaWF0IjoxNzUzNzczMjk0LCJleHAiOjE3NTQzNzgwOTR9.EL_666bg3kTzoa224J7sxXSOvViDiN2PQAp8VWcSDoE';
  
  const options = {
    hostname: '118.107.4.158',
    port: 1337,
    path: '/api/choujiang-jihuis/my-chances',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  console.log('开始测试API...');
  console.log('请求URL:', `http://${options.hostname}:${options.port}${options.path}`);
  console.log('Token:', token.substring(0, 20) + '...');

  const req = http.request(options, (res) => {
    console.log('响应状态码:', res.statusCode);
    console.log('响应头:', res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('响应数据:');
      try {
        const jsonData = JSON.parse(data);
        console.log(JSON.stringify(jsonData, null, 2));
        
        if (jsonData.success) {
          console.log('✅ API调用成功');
          console.log('抽奖机会数量:', jsonData.data.chances?.length || 0);
          console.log('总可用次数:', jsonData.data.totalAvailableCount || 0);
        } else {
          console.log('❌ API调用失败:', jsonData.message);
        }
      } catch (e) {
        console.log('❌ 解析响应失败:', e.message);
        console.log('原始响应:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ 请求失败:', e.message);
  });

  req.end();
}

// 运行测试
testAPI();