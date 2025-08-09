import { factories } from '@strapi/strapi';
import QRCode from 'qrcode';

export default factories.createCoreController(
  'plugin::users-permissions.user',
  ({ strapi }) => ({
    // 健康检查端点
    async health(ctx) {
      try {
        ctx.body = {
          status: 'ok',
          timestamp: new Date().toISOString(),
          message: 'Zenithus API is running'
        };
      } catch (error) {
        ctx.throw(500, 'Health check failed');
      }
    },

    // H5注册页面
    async showRegisterPage(ctx) {
      try {
        const inviteCode = ctx.params.inviteCode || ctx.query.ref;
        
        // 生成H5注册页面HTML
        const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zenithus - 邀请注册</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0D1117 0%, #161B22 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            max-width: 400px;
            width: 100%;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .logo h1 {
            font-size: 28px;
            font-weight: bold;
            background: linear-gradient(45deg, #00E7FF, #FF3CF4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 8px;
        }
        
        .logo p {
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 500;
        }
        
        .form-group input {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            color: white;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #00E7FF;
            box-shadow: 0 0 0 3px rgba(0, 231, 255, 0.1);
        }
        
        .form-group input::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }
        
        .invite-code {
            background: linear-gradient(45deg, #00E7FF, #FF3CF4);
            padding: 15px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 20px;
        }
        
        .invite-code span {
            font-size: 18px;
            font-weight: bold;
            color: white;
            letter-spacing: 2px;
        }
        
        .btn {
            width: 100%;
            padding: 16px;
            background: linear-gradient(45deg, #00E7FF, #FF3CF4);
            border: none;
            border-radius: 12px;
            color: white;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 15px;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 231, 255, 0.3);
        }
        
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .download-btn {
            background: linear-gradient(45deg, #D4AF37, #FFD700);
            color: #000;
        }
        
        .download-btn:hover {
            box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
        }
        
        .features {
            margin-top: 30px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
        }
        
        .features h3 {
            color: #00E7FF;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .features ul {
            list-style: none;
            color: rgba(255, 255, 255, 0.8);
        }
        
        .features li {
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
        }
        
        .features li:before {
            content: "🌟";
            position: absolute;
            left: 0;
        }
        
        .error {
            color: #ff6b6b;
            font-size: 14px;
            margin-top: 8px;
        }
        
        .success {
            color: #51cf66;
            font-size: 14px;
            margin-top: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <div style="width: 60px; height: 60px; background: linear-gradient(45deg, #00E7FF, #FF3CF4); border-radius: 15px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold;">Z</div>
            <h1>Zenithus</h1>
            <p>AI驱动的大健康跨境平台</p>
        </div>
        
        <div class="invite-code">
            <span>邀请码: ${inviteCode || '请输入邀请码'}</span>
        </div>
        
        <form id="registerForm">
            <div class="form-group">
                <label for="username">用户名</label>
                <input type="text" id="username" name="username" placeholder="请输入用户名" required>
            </div>
            
            <div class="form-group">
                <label for="email">邮箱</label>
                <input type="email" id="email" name="email" placeholder="请输入邮箱" required>
            </div>
            
            <div class="form-group">
                <label for="password">密码</label>
                <input type="password" id="password" name="password" placeholder="请输入密码" required>
            </div>
            
            <div class="form-group">
                <label for="inviteCode">邀请码</label>
                <input type="text" id="inviteCode" name="inviteCode" value="${inviteCode || ''}" placeholder="请输入邀请码" required>
            </div>
            
            <button type="submit" class="btn">注册</button>
        </form>
        
        <button onclick="downloadApp()" class="btn download-btn">下载APP</button>
        
        <div class="features">
            <h3>平台特色</h3>
            <ul>
                <li>AI健康科技投资</li>
                <li>邀请有礼奖励</li>
                <li>抽奖豪华礼包</li>
                <li>安全可靠保障</li>
            </ul>
        </div>
    </div>
    
    <script>
        document.getElementById('registerForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {
                username: formData.get('username'),
                email: formData.get('email'),
                password: formData.get('password'),
                inviteCode: formData.get('inviteCode')
            };
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '注册中...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('/api/auth/invite-register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showMessage('注册成功！正在跳转到APP...', 'success');
                    
                    // 显示下载提示
                    const downloadTip = document.createElement('div');
                    downloadTip.className = 'download-tip';
                    downloadTip.innerHTML = '<div style="background: rgba(0, 231, 255, 0.1); padding: 15px; border-radius: 10px; margin-top: 15px; text-align: center;"><p style="color: #00E7FF; margin-bottom: 10px;">🎉 注册成功！</p><p style="color: rgba(255, 255, 255, 0.8); font-size: 14px; margin-bottom: 15px;">正在为您跳转到APP下载页面...</p><button onclick="downloadApp()" style="background: linear-gradient(45deg, #00E7FF, #FF3CF4); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer;">立即下载APP</button></div>';
                    
                    const form = document.getElementById('registerForm');
                    form.appendChild(downloadTip);
                    
                    // 3秒后自动跳转
                    setTimeout(() => {
                        downloadApp();
                    }, 3000);
                } else {
                    showMessage(result.message || '注册失败，请重试', 'error');
                }
            } catch (error) {
                showMessage('网络错误，请检查网络连接', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
        
        function showMessage(message, type) {
            const existingMessage = document.querySelector('.message');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${type}\`;
            messageDiv.textContent = message;
            
            const form = document.getElementById('registerForm');
            form.appendChild(messageDiv);
        }
        
        function downloadApp() {
            // 检测设备类型
            const userAgent = navigator.userAgent.toLowerCase();
            
            if (/android/.test(userAgent)) {
                // Android设备 - 尝试打开应用或跳转到应用商店
                try {
                    // 首先尝试打开应用
                    window.location.href = 'zenithus://register?ref=${inviteCode}';
                    
                    // 如果应用未安装，3秒后跳转到下载页面
                    setTimeout(() => {
                        window.location.href = 'https://play.google.com/store/apps/details?id=com.zenithus.app';
                    }, 3000);
                } catch (e) {
                    // 如果出错，直接跳转到下载页面
                    window.location.href = 'https://play.google.com/store/apps/details?id=com.zenithus.app';
                }
            } else if (/iphone|ipad|ipod/.test(userAgent)) {
                // iOS设备 - 尝试打开应用，如果失败则跳转到App Store
                try {
                    window.location.href = 'zenithus://register?ref=${inviteCode}';
                    
                    // 如果应用未安装，3秒后跳转到App Store
                    setTimeout(() => {
                        window.location.href = 'https://apps.apple.com/app/zenithus/id123456789';
                    }, 3000);
                } catch (e) {
                    window.location.href = 'https://apps.apple.com/app/zenithus/id123456789';
                }
            } else {
                // 其他设备 - 显示下载页面
                const downloadUrl = 'https://zenithus.app/download';
                window.open(downloadUrl, '_blank');
            }
        }
    </script>
</body>
</html>`;

        ctx.type = 'text/html';
        ctx.body = html;
      } catch (error) {
        console.error('生成注册页面失败:', error);
        ctx.throw(500, '生成注册页面失败');
      }
    },

    // 下载页面
    async showDownloadPage(ctx) {
      try {
        const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zenithus｜AI驱动的大健康跨境平台</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0D1117 0%, #161B22 100%);
            color: white;
            min-height: 100vh;
            line-height: 1.6;
        }
        
        .hero-section {
            padding: 60px 20px;
            text-align: center;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .logo-container {
            margin-bottom: 40px;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(45deg, #00E7FF, #FF3CF4);
            border-radius: 20px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
        }
        
        .hero-title {
            font-size: 36px;
            font-weight: bold;
            background: linear-gradient(45deg, #00E7FF, #FF3CF4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 20px;
            line-height: 1.2;
        }
        
        .hero-subtitle {
            font-size: 18px;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 40px;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .download-section {
            margin: 40px 0;
        }
        
        .download-btn {
            display: inline-block;
            padding: 18px 40px;
            margin: 10px;
            background: linear-gradient(45deg, #00E7FF, #FF3CF4);
            border: none;
            border-radius: 12px;
            color: white;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            box-shadow: 0 4px 15px rgba(0, 231, 255, 0.3);
        }
        
        .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 231, 255, 0.4);
        }
        
        .secondary-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .secondary-btn:hover {
            background: rgba(255, 255, 255, 0.15);
        }
        
        .security-info {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .security-info h3 {
            color: #00E7FF;
            margin-bottom: 15px;
            font-size: 16px;
        }
        
        .security-info p {
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
            margin-bottom: 8px;
        }
        
        .features-section {
            margin: 60px 0;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            margin-top: 40px;
        }
        
        .feature-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 30px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 231, 255, 0.1);
        }
        
        .feature-icon {
            font-size: 32px;
            margin-bottom: 20px;
        }
        
        .feature-title {
            color: #00E7FF;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        
        .feature-desc {
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
            line-height: 1.6;
        }
        
        .product-section {
            margin: 60px 0;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 20px;
            padding: 40px;
        }
        
        .product-title {
            text-align: center;
            color: #00E7FF;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 30px;
        }
        
        .product-highlights {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        
        .highlight-item {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 20px;
            text-align: center;
        }
        
        .highlight-title {
            color: #00E7FF;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .highlight-desc {
            color: rgba(255, 255, 255, 0.7);
            font-size: 12px;
        }
        
        .faq-section {
            margin: 60px 0;
        }
        
        .faq-item {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .faq-question {
            color: #00E7FF;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .faq-answer {
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
        }
        
        .version-info {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
        }
        
        .version-info h3 {
            color: #00E7FF;
            margin-bottom: 15px;
        }
        
        .version-details {
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
        }
        
        @media (max-width: 768px) {
            .hero-title {
                font-size: 28px;
            }
            
            .hero-subtitle {
                font-size: 16px;
            }
            
            .features-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="hero-section">
        <div class="logo-container">
            <div class="logo">Z</div>
        </div>
        
        <h1 class="hero-title">Zenithus｜AI驱动的大健康跨境平台</h1>
        <p class="hero-subtitle">让高品质草本多肽走向全球，用智能连接健康与增长</p>
        
        <div class="download-section">
            <a href="https://play.google.com/store/apps/details?id=com.zenithus.app" class="download-btn" onclick="trackDownload('android')">
                📱 立即下载 Android 安装包（v2.1.0｜15.6MB）
            </a>
            <br>
            <a href="/whitepaper" class="download-btn secondary-btn">
                📖 了解平台 · 白皮书
            </a>
        </div>
        
        <div class="security-info">
            <h3>🔒 安全说明</h3>
            <p>仅从官方渠道下载。安装前可对照校验码：SHA-256 a1b2c3d4e5f6...</p>
            <p>兼容性：Android 8.0 及以上（ARM64 优先适配）</p>
        </div>
    </div>
    
    <div class="features-section">
        <h2 style="text-align: center; color: #00E7FF; font-size: 28px; margin-bottom: 40px;">为什么选择 Zenithus</h2>
        
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">🤖</div>
                <div class="feature-title">AI 智能营销</div>
                <div class="feature-desc">多维人群洞察与效果优化，提升触达与转化，让好产品更快被看见。</div>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">🌐</div>
                <div class="feature-title">国际品质供应链</div>
                <div class="feature-desc">严选研发与制造体系，稳定供给、批次可追溯、品质更放心。</div>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">🔄</div>
                <div class="feature-title">一站式生态</div>
                <div class="feature-desc">商城专区、淘金专区、认购专区三大版块，覆盖消费、互动与增值。</div>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">🛡️</div>
                <div class="feature-title">合规与隐私保护</div>
                <div class="feature-desc">遵循目的最小化与分级加密，账号与订单数据全程受保护。</div>
            </div>
        </div>
    </div>
    
    <div class="product-section">
        <h2 class="product-title">核心产品亮点（草本多肽）</h2>
        <p style="text-align: center; color: rgba(255, 255, 255, 0.8); margin-bottom: 30px;">科学配方 · 品质优选</p>
        
        <div class="product-highlights">
            <div class="highlight-item">
                <div class="highlight-title">胶原蛋白肽</div>
                <div class="highlight-desc">鳕鱼胶原蛋白肽、罗非鱼胶原肽（专利）——有助于提升水润度与肌肤弹性*</div>
            </div>
            
            <div class="highlight-item">
                <div class="highlight-title">大豆肽</div>
                <div class="highlight-desc">江南大学专利——协同营养吸收，增强体能与活力*</div>
            </div>
            
            <div class="highlight-item">
                <div class="highlight-title">弹性蛋白肽</div>
                <div class="highlight-desc">鲣鱼弹性支撑，紧致加分*</div>
            </div>
            
            <div class="highlight-item">
                <div class="highlight-title">益生元组合</div>
                <div class="highlight-desc">低聚果糖、菊粉、水苏糖——调节肠道菌群，帮助消化与吸收*</div>
            </div>
            
            <div class="highlight-item">
                <div class="highlight-title">复合益生菌</div>
                <div class="highlight-desc">出厂添加量≥500亿CFU/袋，合成消化酶、维持菌群平衡*</div>
            </div>
            
            <div class="highlight-item">
                <div class="highlight-title">酵母抽提物</div>
                <div class="highlight-desc">抗氧化支持，抵御日常环境压力*</div>
            </div>
        </div>
        
        <p style="text-align: center; color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-top: 20px;">
            *以上为营养与功效性原料的一般性说明，非医疗诊疗或治愈承诺。实际感受因人而异，请以产品标签与说明书为准。
        </p>
    </div>
    
    <div class="faq-section">
        <h2 style="text-align: center; color: #00E7FF; font-size: 28px; margin-bottom: 40px;">常见问题（FAQ）</h2>
        
        <div class="faq-item">
            <div class="faq-question">Q：下载很慢或中断怎么办？</div>
            <div class="faq-answer">A：可在 Wi-Fi 环境下重试，或使用备用下载通道。</div>
        </div>
        
        <div class="faq-item">
            <div class="faq-question">Q：我的数据安全吗？</div>
            <div class="faq-answer">A：账号、订单与地址等信息遵循最小化采集，采用分级加密与访问控制，仅用于订单履约与服务所必需的场景。</div>
        </div>
        
        <div class="faq-item">
            <div class="faq-question">Q：认购与活动是否有风险？</div>
            <div class="faq-answer">A：任何认购与权益活动均有不确定性，请理性参与，详细规则以公告与条款为准。</div>
        </div>
    </div>
    
    <div class="version-info">
        <h3>版本信息</h3>
        <div class="version-details">
            <p>当前版本：v2.1.0（发布日期：2024-01-15）</p>
            <p>文件大小：15.6MB</p>
            <p>校验值：SHA-256 a1b2c3d4e5f6...</p>
            <p style="margin-top: 15px; color: rgba(255, 255, 255, 0.6); font-size: 12px;">
                本页面信息仅用于产品与服务介绍，不构成医疗、营养或财务建议。<br>
                请阅读并同意《用户协议》《隐私政策》《风险提示》。<br>
                未成年人请在监护人指导下使用。
            </p>
        </div>
    </div>
    
    <script>
        function trackDownload(platform) {
            fetch('/api/auth/track-download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    platform: platform,
                    timestamp: new Date().toISOString()
                })
            }).catch(error => {
                console.log('下载追踪失败:', error);
            });
        }
    </script>
</body>
</html>`;

        ctx.type = 'text/html';
        ctx.body = html;
      } catch (error) {
        console.error('生成下载页面失败:', error);
        ctx.throw(500, '生成下载页面失败');
      }
    },

    // 邀请注册
    async inviteRegister(ctx) {
      try {
        const { username, email, password, inviteCode } = ctx.request.body;
        
        if (!username || !email || !password || !inviteCode) {
          return ctx.badRequest('缺少必要参数');
        }

        // 验证邀请码
        const inviteUser = await strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: { inviteCode } as any
        });

        if (inviteUser.length === 0) {
          return ctx.badRequest('邀请码无效');
        }

        // 检查用户名是否已存在
        const existingUser = await strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: { username } as any
        });

        if (existingUser.length > 0) {
          return ctx.badRequest('用户名已存在');
        }

        // 检查邮箱是否已存在
        const existingEmail = await strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: { email }
        });

        if (existingEmail.length > 0) {
          return ctx.badRequest('邮箱已存在');
        }

        // 获取authenticated角色
        const [authenticatedRole] = await strapi.entityService.findMany('plugin::users-permissions.role', {
          filters: { type: 'authenticated' },
          limit: 1
        }) as any[];

        if (!authenticatedRole) {
          return ctx.badRequest('系统错误：未找到默认角色');
        }

        // 使用Strapi实体服务创建用户，确保密码正确加密
        const newUser = await strapi.entityService.create('plugin::users-permissions.user', {
          data: {
            username,
            email,
            password,
            provider: 'local',
            confirmed: true,  // 自动确认用户
            blocked: false,
            inviteCode: generateInviteCode(),
            invitedBy: inviteUser[0].id,
            role: authenticatedRole.id  // 使用正确的角色ID
          }
        });

        // 确保用户有正确的角色
        const userWithRole = newUser as any;
        if (!userWithRole.role) {
          // 如果没有角色，手动设置默认角色
          await strapi.plugin('users-permissions').service('user').edit(newUser.id, {
            role: authenticatedRole.id
          });
        }

        // 创建用户钱包
        await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
          data: {
            usdtYue: '0',
            aiYue: '0',
            aiTokenBalances: '{}',
            user: newUser.id
          } as any
        });

        ctx.body = {
          success: true,
          data: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            inviteCode: newUser.inviteCode
          },
          message: '注册成功'
        };
      } catch (error) {
        console.error('邀请注册失败:', error);
        ctx.throw(500, `注册失败：${error.message}`);
      }
    },

    // 用户登录
    async local(ctx) {
      try {
        const { identifier, password } = ctx.request.body;
        
        if (!identifier || !password) {
          return ctx.badRequest('用户名/邮箱和密码不能为空');
        }

        // 使用Strapi的users-permissions插件进行认证
        const userService = strapi.plugin('users-permissions').service('user');
        const jwtService = strapi.plugin('users-permissions').service('jwt');
        
        // 查找用户 - 使用正确的查询方式
        let targetUser = null;
        
        // 先尝试用用户名查找，包含角色信息
        const usersByUsername = await strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: { username: identifier },
          populate: ['role']
        }) as any[];
        
        if (usersByUsername.length > 0) {
          targetUser = usersByUsername[0];
        } else {
          // 如果用户名没找到，尝试用邮箱查找，包含角色信息
          const usersByEmail = await strapi.entityService.findMany('plugin::users-permissions.user', {
            filters: { email: identifier },
            populate: ['role']
          }) as any[];
          
          if (usersByEmail.length > 0) {
            targetUser = usersByEmail[0];
          }
        }
        
        if (!targetUser) {
          return ctx.badRequest('用户名或密码错误');
        }
        
        // 验证密码
        const validPassword = await userService.validatePassword(password, targetUser.password);
        if (!validPassword) {
          return ctx.badRequest('用户名或密码错误');
        }

        // 检查用户状态
        if (targetUser.blocked) {
          return ctx.badRequest('账户已被禁用');
        }

        if (!targetUser.confirmed) {
          return ctx.badRequest('账户未确认');
        }

        // 生成JWT token
        const token = jwtService.issue({ id: targetUser.id });

        // 安全地获取用户角色信息
        let role = targetUser.role;
        if (!role) {
          // 如果没有角色信息，使用默认角色
          role = {
            id: 1,
            name: 'Authenticated',
            description: 'Default role given to authenticated user.',
            type: 'authenticated'
          };
        }

        // 安全地获取用户钱包信息
        let wallet = null;
        try {
          const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
            filters: { user: { id: targetUser.id } }
          }) as any[];

          wallet = wallets && wallets.length > 0 ? wallets[0] : null;
        } catch (walletError) {
          console.warn('获取钱包信息失败:', walletError);
          // 如果获取钱包失败，创建默认钱包信息
          wallet = {
            id: null,
            usdtYue: '0',
            aiYue: '0',
            aiTokenBalances: '{}'
          };
        }

        ctx.body = {
          jwt: token,
          user: {
            id: targetUser.id,
            username: targetUser.username,
            email: targetUser.email,
            confirmed: targetUser.confirmed,
            blocked: targetUser.blocked,
            role: role,
            inviteCode: targetUser.inviteCode,
            invitedBy: targetUser.invitedBy,
            qianbao: wallet,
            createdAt: targetUser.createdAt,
            updatedAt: targetUser.updatedAt
          }
        };
      } catch (error) {
        console.error('登录失败:', error);
        ctx.throw(500, `登录失败: ${error.message}`);
      }
    },

    // 获取邀请信息
    async getInviteInfo(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
        
        if (!user) {
          return ctx.notFound('用户不存在');
        }

        // 生成包含邀请码的注册页面链接
        const registerLink = `${process.env.FRONTEND_URL || 'https://zenithus.app'}/register?ref=${user.inviteCode}`;
        
        // 生成邀请链接（用于网页分享）
        const inviteLink = `${process.env.FRONTEND_URL || 'https://zenithus.app'}/register?ref=${user.inviteCode}`;
        
        // 生成包含邀请码的二维码（指向注册页面）
        const qrCodeData = await QRCode.toDataURL(registerLink, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        ctx.body = {
          success: true,
          data: {
            inviteCode: user.inviteCode,
            inviteLink: inviteLink,
            appDownloadLink: registerLink,
            qrCodeData: qrCodeData,
            username: user.username
          }
        };
      } catch (error) {
        console.error('获取邀请信息失败:', error);
        ctx.throw(500, `获取邀请信息失败: ${error.message}`);
      }
    },

    // 获取团队信息
    async getTeamInfo(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        // 获取直接推荐的用户
        const directReferrals = await strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: { invitedBy: userId },
          fields: ['id', 'username', 'createdAt'],
          sort: { createdAt: 'desc' },
        }) as any[];

        // 计算总收益（这里可以根据实际业务逻辑计算）
        const totalEarnings = await this.calculateTotalEarnings(userId);

        // 格式化团队成员数据
        const members = directReferrals.map((user: any) => ({
          username: user.username,
          registrationDate: user.createdAt.toISOString().split('T')[0],
        }));

        ctx.body = {
          success: true,
          data: {
            directReferrals: directReferrals.length,
            totalEarnings: totalEarnings.toFixed(2),
            members: members,
          }
        };
      } catch (error) {
        console.error('获取团队信息失败:', error);
        ctx.throw(500, `获取团队信息失败: ${error.message}`);
      }
    },

    // 获取收益信息
    async getRewardInfo(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        // 获取邀请奖励记录
        const rewards = await strapi.entityService.findMany('api::yaoqing-jiangli.yaoqing-jiangli', {
          filters: { tuijianRen: userId },
          fields: ['id', 'shouyiUSDT', 'createdAt'],
          sort: { createdAt: 'desc' },
          limit: 10,
        }) as any[];

        // 计算总收益
        const totalRewards = rewards.reduce((sum: number, reward: any) => {
          return sum + (parseFloat(reward.shouyiUSDT) || 0);
        }, 0);

        // 计算本月收益
        const currentMonth = new Date();
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const monthlyRewards = rewards
          .filter((reward: any) => new Date(reward.createdAt) >= monthStart)
          .reduce((sum: number, reward: any) => {
            return sum + (parseFloat(reward.shouyiUSDT) || 0);
          }, 0);

        // 格式化收益记录
        const formattedRewards = rewards.map((reward: any) => ({
          amount: reward.shouyiUSDT,
          timestamp: reward.createdAt.toISOString().replace('T', ' ').substring(0, 19),
        }));

        ctx.body = {
          success: true,
          data: {
            totalRewards: totalRewards.toFixed(2),
            monthlyRewards: monthlyRewards.toFixed(2),
            rewards: formattedRewards,
          }
        };
      } catch (error) {
        console.error('获取收益信息失败:', error);
        ctx.throw(500, `获取收益信息失败: ${error.message}`);
      }
    },

    // 获取当前档位信息
    async getCurrentTierInfo(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        console.log(`🔍 开始获取用户 ${userId} 的当前档位信息...`);
        
        // 获取用户所有有效的认购订单（running、redeemable、finished状态）
        const activeOrders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
          filters: { 
            user: { id: userId },
            status: { $in: ['running', 'redeemable', 'finished'] }  // 包含所有有效状态
          },
          populate: ['jihua']
        }) as any[];

        console.log(`用户 ${userId} 的有效订单数量: ${activeOrders.length}`);

        if (!activeOrders || activeOrders.length === 0) {
          console.log(`用户 ${userId} 没有有效的订单`);
          return ctx.body = {
          success: true,
            data: null,
            message: '用户没有有效的投资订单'
          };
        }

        // 找到最高档位的订单
        let maxTierOrder = null;
        let maxPrincipal = 0;

        for (const order of activeOrders) {
          const orderPrincipal = parseFloat(order.principal || order.amount || 0);
          console.log(`订单 ${order.id}: 状态=${order.status}, 金额=${orderPrincipal}, 计划=${order.jihua?.name}`);

          if (orderPrincipal > maxPrincipal) {
            maxTierOrder = order;
            maxPrincipal = orderPrincipal;
          }
        }

        if (!maxTierOrder) {
          return ctx.body = {
          success: true,
            data: null,
            message: '未找到有效的投资订单'
          };
        }

        const plan = maxTierOrder.jihua;
        console.log(`用户最高档位订单: 计划=${plan?.name}, 金额=${maxPrincipal} USDT`);

        // 计算静态收益（年化）
        const staticRate = parseFloat(plan?.jingtaiBili || 0) / 100; // 转换为小数
        const aiRate = parseFloat(plan?.aiBili || 0) / 100; // AI代币奖励比例
        const cycleDays = parseInt(plan?.zhouQiTian || 30);
        
        // 计算周期收益
        const cycleStaticRate = (staticRate * cycleDays / 365) * 100; // 转换为百分比
        const cycleAiRate = (aiRate * cycleDays / 365) * 100; // 转换为百分比

        ctx.body = {
          success: true,
          data: {
            tierName: plan?.name || '未知档位',
            principal: maxPrincipal,
            staticRate: staticRate,
            aiRate: aiRate,
            cycleDays: cycleDays,
            cycleStaticRate: cycleStaticRate,
            cycleAiRate: cycleAiRate,
            planCode: plan?.jihuaCode,
            description: `当前档位: ${plan?.name}，投资金额: ${maxPrincipal} USDT，年化静态收益率: ${(staticRate * 100).toFixed(2)}%，周期静态收益: ${cycleStaticRate.toFixed(2)}%，AI代币奖励: ${(aiRate * 100).toFixed(2)}%，投资周期: ${cycleDays}天`
          }
        };
      } catch (error) {
        console.error('获取当前档位信息失败:', error);
        ctx.throw(500, `获取当前档位信息失败: ${error.message}`);
      }
    },

    // 计算总收益的辅助方法
    async calculateTotalEarnings(userId) {
      try {
        const rewards = await strapi.entityService.findMany('api::yaoqing-jiangli.yaoqing-jiangli', {
          filters: { tuijianRen: userId },
          fields: ['shouyiUSDT'],
        }) as any[];

        return rewards.reduce((sum: number, reward: any) => {
          return sum + (parseFloat(reward.shouyiUSDT) || 0);
        }, 0);
      } catch (error) {
        console.error('计算总收益失败:', error);
        return 0;
      }
    },

    // 记录分享行为
    async trackInviteShare(ctx) {
      try {
        const userId = ctx.state.user.id;
        const { shareType, sharePlatform } = ctx.request.body;
        
        if (!shareType || !sharePlatform) {
          return ctx.badRequest('缺少必要参数');
        }

        // 记录分享行为到数据库（可选）
        // 这里可以创建一个分享记录表来存储分享行为
        console.log(`用户 ${userId} 进行了分享行为: ${shareType} - ${sharePlatform}`);

        ctx.body = {
          success: true,
          message: '分享行为记录成功',
          data: {
            shareType,
            sharePlatform,
            timestamp: new Date().toISOString(),
          }
        };
      } catch (error) {
        console.error('记录分享行为失败:', error);
        ctx.throw(500, `记录分享行为失败: ${error.message}`);
      }
    },

    // 更新用户资料
    async updateProfile(ctx) {
      try {
        const userId = ctx.state.user.id;
        const { username, email, phone, avatar } = ctx.request.body;
        
        // 这里可以实现用户资料更新逻辑
        ctx.body = {
          success: true,
          message: '用户资料更新成功'
        };
      } catch (error) {
        console.error('更新用户资料失败:', error);
        ctx.throw(500, `更新用户资料失败: ${error.message}`);
      }
    },

    // 获取安全设置
    async getSecuritySettings(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        ctx.body = {
          success: true,
          data: {
            twoFactorEnabled: false,
            emailNotifications: true,
            smsNotifications: false,
          }
        };
      } catch (error) {
        console.error('获取安全设置失败:', error);
        ctx.throw(500, `获取安全设置失败: ${error.message}`);
      }
    },

    // 更新安全设置
    async updateSecuritySettings(ctx) {
      try {
        const userId = ctx.state.user.id;
        const { twoFactorEnabled, emailNotifications, smsNotifications } = ctx.request.body;
        
        ctx.body = {
          success: true,
          message: '安全设置更新成功'
        };
      } catch (error) {
        console.error('更新安全设置失败:', error);
        ctx.throw(500, `更新安全设置失败: ${error.message}`);
      }
    },

    // 获取应用设置
    async getAppSettings(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        ctx.body = {
          success: true,
          data: {
            language: 'zh-CN',
            theme: 'dark',
            autoLogin: true,
          }
        };
      } catch (error) {
        console.error('获取应用设置失败:', error);
        ctx.throw(500, `获取应用设置失败: ${error.message}`);
      }
    },

    // 更新应用设置
    async updateAppSettings(ctx) {
      try {
        const userId = ctx.state.user.id;
        const { language, theme, autoLogin } = ctx.request.body;
        
        ctx.body = {
          success: true,
          message: '应用设置更新成功'
        };
      } catch (error) {
        console.error('更新应用设置失败:', error);
        ctx.throw(500, `更新应用设置失败: ${error.message}`);
      }
    },

    // 获取团队订单信息
    async getTeamOrders(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        console.log(`🔍 获取用户 ${userId} 的团队订单信息`);

        // 获取用户直接邀请的下级用户
        const directReferrals = await strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: { invitedBy: { id: userId } }
        }) as any[];

        console.log(`用户 ${userId} 的直接邀请人数: ${directReferrals.length}`);

        const teamOrders = [];
        let totalOrders = 0;
        let runningOrders = 0;
        let finishedOrders = 0;
        let totalRewards = 0;
        let pendingRewards = 0;

        for (const referral of directReferrals) {
          // 获取该用户的订单
          const orders = await strapi.entityService.findMany('api::dinggou-dingdan.dinggou-dingdan', {
            filters: { user: { id: referral.id } },
            populate: ['jihua']
          }) as any[];
          
          for (const order of orders) {
            totalOrders++;
            
            if (order.status === 'running') {
              runningOrders++;
            } else if (order.status === 'finished') {
              finishedOrders++;
            }

            // 计算到期时间
            let expiryDate = null;
            let daysRemaining = null;
            
            if (order.createdAt && order.jihua) {
              const createdDate = new Date(order.createdAt);
              const durationDays = order.jihua.duration || 90; // 默认90天
              expiryDate = new Date(createdDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
              
              const now = new Date();
              const remainingMs = expiryDate.getTime() - now.getTime();
              daysRemaining = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
            }

            // 获取邀请奖励信息
            const rewardRecord = await strapi.entityService.findMany('api::yaoqing-jiangli.yaoqing-jiangli', {
              filters: { 
                tuijianRen: { id: userId },
                laiyuanRen: { id: referral.id },
                laiyuanDan: { id: order.id }
              }
            }) as any[];

            let rewardAmount = '0';
            let rewardStatus = 'none';
            
            if (rewardRecord.length > 0) {
              rewardAmount = rewardRecord[0].shouyiUSDT || '0';
              totalRewards += parseFloat(rewardAmount);
              
              if (order.status === 'finished') {
                rewardStatus = 'paid';
              } else {
                rewardStatus = 'pending';
                pendingRewards += parseFloat(rewardAmount);
              }
            }

            teamOrders.push({
              orderId: order.id,
              username: referral.username,
              registrationDate: referral.createdAt ? new Date(referral.createdAt).toLocaleDateString() : '',
              status: order.status,
              planName: order.jihua?.name || '未知计划',
              amount: order.principal || order.amount || '0',
              investmentDate: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '',
              expiryDate: expiryDate ? expiryDate.toLocaleDateString() : null,
              daysRemaining: daysRemaining,
              rewardAmount: rewardAmount,
              rewardStatus: rewardStatus
            });
          }
        }

        // 按投资时间排序，最新的在前面
        teamOrders.sort((a, b) => {
          const dateA = new Date(a.investmentDate);
          const dateB = new Date(b.investmentDate);
          return dateB.getTime() - dateA.getTime();
        });

        ctx.body = {
          success: true,
          data: {
            totalOrders,
            runningOrders,
            finishedOrders,
            totalRewards: totalRewards.toFixed(2),
            pendingRewards: pendingRewards.toFixed(2),
            orders: teamOrders
          },
          message: '团队订单信息获取成功'
        };
      } catch (error) {
        console.error('获取团队订单信息失败:', error);
        ctx.throw(500, `获取团队订单信息失败: ${error.message}`);
      }
    },
  })
);

// 生成邀请码的辅助函数
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
} 
  return result;
}
