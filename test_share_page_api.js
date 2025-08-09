const axios = require('axios');

const BASE_URL = 'http://localhost:1337';

async function testSharePageAPIs() {
  try {
    console.log('🔍 开始测试分享页面相关API...\n');
    
    // 1. 测试登录
    console.log('1. 测试登录...');
    let token = null;
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
        identifier: 'testuser',
        password: 'testpass'
      });
      
      if (loginResponse.data.jwt) {
        token = loginResponse.data.jwt;
        console.log('✅ 登录成功，获取到token');
      } else {
        console.log('❌ 登录失败，没有获取到token');
        return;
      }
    } catch (error) {
      console.log('❌ 登录失败:', error.response?.data || error.message);
      return;
    }
    
    // 2. 测试获取邀请信息
    console.log('\n2. 测试获取邀请信息...');
    try {
      const inviteInfoResponse = await axios.get(`${BASE_URL}/api/auth/invite-info`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ 获取邀请信息成功:', {
        hasInviteCode: !!inviteInfoResponse.data.data?.inviteCode,
        hasUsername: !!inviteInfoResponse.data.data?.username,
        hasAppDownloadLink: !!inviteInfoResponse.data.data?.appDownloadLink,
        hasQrCodeData: !!inviteInfoResponse.data.data?.qrCodeData,
      });
    } catch (error) {
      console.log('❌ 获取邀请信息失败:', error.response?.data || error.message);
    }
    
    // 3. 测试获取团队信息
    console.log('\n3. 测试获取团队信息...');
    try {
      const teamInfoResponse = await axios.get(`${BASE_URL}/api/auth/team-info`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ 获取团队信息成功:', {
        hasDirectReferrals: teamInfoResponse.data.data?.directReferrals !== undefined,
        hasTotalEarnings: teamInfoResponse.data.data?.totalEarnings !== undefined,
      });
    } catch (error) {
      console.log('❌ 获取团队信息失败:', error.response?.data || error.message);
    }
    
    // 4. 测试获取收益信息
    console.log('\n4. 测试获取收益信息...');
    try {
      const rewardInfoResponse = await axios.get(`${BASE_URL}/api/auth/reward-info`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ 获取收益信息成功:', {
        hasTotalRewards: rewardInfoResponse.data.data?.totalRewards !== undefined,
        hasMonthlyRewards: rewardInfoResponse.data.data?.monthlyRewards !== undefined,
      });
    } catch (error) {
      console.log('❌ 获取收益信息失败:', error.response?.data || error.message);
    }
    
    // 5. 测试获取当前档位信息
    console.log('\n5. 测试获取当前档位信息...');
    try {
      const tierInfoResponse = await axios.get(`${BASE_URL}/api/auth/current-tier-info`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ 获取当前档位信息成功:', {
        hasTierName: !!tierInfoResponse.data.data?.tierName,
        hasPrincipal: tierInfoResponse.data.data?.principal !== undefined,
        hasStaticRate: tierInfoResponse.data.data?.staticRate !== undefined,
      });
    } catch (error) {
      console.log('❌ 获取当前档位信息失败:', error.response?.data || error.message);
    }
    
    // 6. 测试记录分享行为
    console.log('\n6. 测试记录分享行为...');
    try {
      const shareResponse = await axios.post(`${BASE_URL}/api/auth/track-invite-share`, {
        shareType: 'invite_code',
        sharePlatform: 'wechat'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ 记录分享行为成功:', shareResponse.data);
    } catch (error) {
      console.log('❌ 记录分享行为失败:', error.response?.data || error.message);
    }
    
    console.log('\n✅ 分享页面API测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testSharePageAPIs();
