const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';
const INVITE_CODE = 'KQJ1ZG';

let authToken = '';
let userId = '';
let walletId = '';
let planId = '';
let orderId = '';

async function testAPI(name, method, url, data = null, headers = {}) {
    console.log(`\n🔍 测试: ${name}`);
    
    try {
        const config = {
            method,
            url,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };
        
        if (data) {
            config.data = data;
        }
        
        const response = await axios(config);
        console.log(`✅ 成功 - 状态码: ${response.status}`);
        console.log(`📄 响应:`, JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.log(`❌ 失败: ${error.message}`);
        if (error.response) {
            console.log(`📄 错误响应:`, JSON.stringify(error.response.data, null, 2));
        }
        return null;
    }
}

async function runAllTests() {
    console.log('=== Bixu 系统全面API测试 ===');
    console.log(`服务器: ${BASE_URL}`);
    console.log(`邀请码: ${INVITE_CODE}`);
    console.log('');

    // 1. 验证邀请码
    const inviteValidation = await testAPI(
        '验证邀请码',
        'GET',
        `${BASE_URL}/api/auth/validate-invite-code/${INVITE_CODE}`
    );

    if (!inviteValidation) {
        console.log('❌ 邀请码验证失败，停止测试');
        return;
    }

    // 2. 用户注册
    const testUser = `testuser_${Date.now()}`;
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    const registerResponse = await testAPI(
        '邀请注册',
        'POST',
        `${BASE_URL}/api/auth/invite-register`,
        {
            username: testUser,
            email: testEmail,
            password: testPassword,
            inviteCode: INVITE_CODE
        }
    );

    if (!registerResponse) {
        console.log('❌ 用户注册失败，停止测试');
        return;
    }

    userId = registerResponse.data.id;
    console.log(`👤 用户ID: ${userId}`);

    // 3. 用户登录
    const loginResponse = await testAPI(
        '用户登录',
        'POST',
        `${BASE_URL}/api/auth/local`,
        {
            identifier: testUser,
            password: testPassword
        }
    );

    if (!loginResponse) {
        console.log('❌ 用户登录失败，停止测试');
        return;
    }

    authToken = loginResponse.jwt;
    console.log(`🔑 获取到JWT Token`);

    const headers = {
        'Authorization': `Bearer ${authToken}`
    };

    // 4. 获取我的邀请码
    await testAPI(
        '获取我的邀请码',
        'GET',
        `${BASE_URL}/api/auth/my-invite-code`,
        null,
        headers
    );

    // 5. 获取我的团队
    await testAPI(
        '获取我的团队',
        'GET',
        `${BASE_URL}/api/auth/my-team?page=1&pageSize=10`,
        null,
        headers
    );

    // 6. 获取用户钱包
    const userWallet = await testAPI(
        '获取用户钱包',
        'GET',
        `${BASE_URL}/api/qianbao-yues/user-wallet`,
        null,
        headers
    );

    if (userWallet) {
        walletId = userWallet.data.id;
        console.log(`💰 钱包ID: ${walletId}`);
    }

    // 7. 更新钱包余额
    await testAPI(
        '更新钱包余额',
        'PUT',
        `${BASE_URL}/api/qianbao-yues/update-wallet`,
        {
            usdtYue: "1000.00",
            aiYue: "50.00"
        },
        headers
    );

    // 8. 充值钱包
    await testAPI(
        '充值钱包',
        'POST',
        `${BASE_URL}/api/qianbao-yues/recharge`,
        {
            data: {
                user: userId,
                usdtYue: "500.00",
                aiYue: "25.00"
            }
        },
        headers
    );

    // 9. 获取认购计划列表
    const plans = await testAPI(
        '获取认购计划列表',
        'GET',
        `${BASE_URL}/api/dinggou-jihuas`
    );

    if (plans && plans.data && plans.data.length > 0) {
        planId = plans.data[0].id;
        console.log(`📋 选择计划ID: ${planId}`);
    }

    // 10. 获取计划统计
    if (planId) {
        await testAPI(
            '获取计划统计',
            'GET',
            `${BASE_URL}/api/dinggou-jihuas/${planId}/stats`,
            null,
            headers
        );
    }

    // 11. 投资认购计划
    if (planId) {
        const investment = await testAPI(
            '投资认购计划',
            'POST',
            `${BASE_URL}/api/dinggou-jihuas/${planId}/invest`,
            {
                amount: "100.00"
            },
            headers
        );

        if (investment) {
            orderId = investment.data.id;
            console.log(`📊 订单ID: ${orderId}`);
        }
    }

    // 12. 获取我的投资
    await testAPI(
        '获取我的投资',
        'GET',
        `${BASE_URL}/api/dinggou-jihuas/my-investments?page=1&pageSize=10`,
        null,
        headers
    );

    // 13. 获取用户订单
    await testAPI(
        '获取用户订单',
        'GET',
        `${BASE_URL}/api/dinggou-dingdans/user-orders?page=1&pageSize=10`,
        null,
        headers
    );

    // 14. 获取订单详情
    if (orderId) {
        await testAPI(
            '获取订单详情',
            'GET',
            `${BASE_URL}/api/dinggou-dingdans/${orderId}/detail`,
            null,
            headers
        );
    }

    // 15. 创建邀请奖励
    if (inviteValidation.data.inviter && orderId) {
        await testAPI(
            '创建邀请奖励',
            'POST',
            `${BASE_URL}/api/yaoqing-jianglis/create-reward`,
            {
                data: {
                    tuijianRen: inviteValidation.data.inviter.id,
                    laiyuanRen: userId,
                    shouyiUSDT: "25.00",
                    laiyuanDan: orderId
                }
            },
            headers
        );
    }

    // 16. 获取用户邀请奖励
    await testAPI(
        '获取用户邀请奖励',
        'GET',
        `${BASE_URL}/api/yaoqing-jianglis/user-rewards?page=1&pageSize=10`,
        null,
        headers
    );

    // 17. 获取团队统计
    await testAPI(
        '获取团队统计',
        'GET',
        `${BASE_URL}/api/yaoqing-jianglis/team-stats`,
        null,
        headers
    );

    // 18. 测试赎回投资（如果订单状态允许）
    if (orderId) {
        await testAPI(
            '赎回投资',
            'POST',
            `${BASE_URL}/api/dinggou-jihuas/${orderId}/redeem`,
            null,
            headers
        );
    }

    // 19. 测试健康检查
    await testAPI(
        '健康检查',
        'GET',
        `${BASE_URL}/api/health`
    );

    // 20. 测试系统信息
    await testAPI(
        '系统信息',
        'GET',
        `${BASE_URL}/api/system-info`
    );

    console.log('\n=== 测试完成 ===');
    console.log(`测试用户: ${testUser}`);
    console.log(`用户ID: ${userId}`);
    console.log(`钱包ID: ${walletId}`);
    console.log(`计划ID: ${planId}`);
    console.log(`订单ID: ${orderId}`);
    console.log('\n🎉 所有API功能测试完成！');
}

// 运行测试
runAllTests().catch(console.error); 