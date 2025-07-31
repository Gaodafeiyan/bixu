const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';
const TEST_USER = {
  username: '123',
  password: '123456'
};

describe('赎回功能集成测试', () => {
  let authToken;
  let testOrderId = '50'; // 测试订单ID

  beforeAll(async () => {
    // 登录获取token
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: TEST_USER.username,
      password: TEST_USER.password
    });
    
    authToken = loginResponse.data.jwt;
    expect(authToken).toBeDefined();
  });

  test('用户登录成功', async () => {
    expect(authToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
  });

  test('获取用户投资订单列表', async () => {
    const response = await axios.get(
      `${BASE_URL}/api/dinggou-dingdans/user-orders?page=1&pageSize=10`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('data');
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  test('执行赎回操作并验证lotteryChances', async () => {
    const response = await axios.post(
      `${BASE_URL}/api/dinggou-jihuas/${testOrderId}/redeem`,
      {},
      {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('success', true);
    expect(response.data).toHaveProperty('lotteryChances');
    
    const lotteryChances = response.data.lotteryChances;
    expect(typeof lotteryChances).toBe('number');
    expect(lotteryChances).toBeGreaterThanOrEqual(0);
    
    if (lotteryChances > 0) {
      console.log(`✅ 赎回成功，获得抽奖机会: ${lotteryChances}`);
    } else {
      console.log(`ℹ️ 赎回成功，但未获得抽奖机会`);
    }
  });
}); 