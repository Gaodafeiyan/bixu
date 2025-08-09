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
                            <div style="width: 60px; height: 60px; background: #2a2a2a; border-radius: 12px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                    <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #FF6B9D 0%, #FFD700 100%); clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);"></div>
                </div>
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
                <input type="email" id="email" name="email" placeholder="请输入邮箱" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" minlength="5" maxlength="50" required>
                <small style="color: rgba(255, 255, 255, 0.6); font-size: 12px;">请输入有效的邮箱地址</small>
            </div>
            
            <div class="form-group">
                <label for="password">密码</label>
                <input type="password" id="password" name="password" placeholder="请输入密码" minlength="6" maxlength="20" required>
                <small style="color: rgba(255, 255, 255, 0.6); font-size: 12px;">密码长度6-20位</small>
            </div>
            
            <div class="form-group">
                <label for="confirmPassword">确认密码</label>
                <input type="password" id="confirmPassword" name="confirmPassword" placeholder="请再次输入密码" minlength="6" maxlength="20" required>
                <small style="color: rgba(255, 255, 255, 0.6); font-size: 12px;">请确保两次输入的密码一致</small>
            </div>
            
            <div class="form-group">
                <label for="inviteCode">邀请码</label>
                <input type="text" id="inviteCode" name="inviteCode" value="${inviteCode || ''}" placeholder="请输入邀请码" required>
            </div>
            
            <button type="submit" class="btn">注册</button>
        </form>
        
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
            const username = formData.get('username');
            const email = formData.get('email');
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');
            const inviteCode = formData.get('inviteCode');
            
            // 验证邮箱格式
            const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailPattern.test(email)) {
                showMessage('请输入有效的邮箱地址', 'error');
                return;
            }
            
            // 验证邮箱长度
            if (email.length < 5 || email.length > 50) {
                showMessage('邮箱长度应在5-50位之间', 'error');
                return;
            }
            
            // 验证密码长度
            if (password.length < 6 || password.length > 20) {
                showMessage('密码长度应在6-20位之间', 'error');
                return;
            }
            
            // 验证确认密码
            if (password !== confirmPassword) {
                showMessage('两次输入的密码不一致', 'error');
                return;
            }
            
            const data = {
                username,
                email,
                password,
                inviteCode
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
                    showMessage('注册成功！正在跳转到下载页面...', 'success');
                    
                    // 显示成功提示
                    const successTip = document.createElement('div');
                    successTip.className = 'success-tip';
                    successTip.innerHTML = '<div style="background: rgba(0, 231, 255, 0.1); padding: 15px; border-radius: 10px; margin-top: 15px; text-align: center;"><p style="color: #00E7FF; margin-bottom: 10px;">🎉 注册成功！</p><p style="color: rgba(255, 255, 255, 0.8); font-size: 14px; margin-bottom: 15px;">正在为您跳转到下载页面...</p></div>';
                    
                    const form = document.getElementById('registerForm');
                    form.appendChild(successTip);
                    
                    // 2秒后自动跳转到下载页面
                    setTimeout(() => {
                        window.location.href = '/api/auth/download';
                    }, 2000);
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
            <div class="logo">
                <div style="width: 80px; height: 80px; background: #2a2a2a; border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <div style="width: 42px; height: 42px; background: linear-gradient(135deg, #FF6B9D 0%, #FFD700 100%); clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);"></div>
                </div>
            </div>
        </div>
        
        <h1 class="hero-title">Zenithus｜AI驱动的大健康跨境平台</h1>
        <p class="hero-subtitle">让高品质草本多肽走向全球，用智能连接健康与增长</p>
        
        <div class="download-section">
            <a href="/api/auth/download-apk" class="download-btn" onclick="trackDownload('android')">
                📱 立即下载 Android 安装包（v1.10）
            </a>
            <br>
            <a href="/api/auth/whitepaper" class="download-btn secondary-btn">
                📖 了解平台 · 白皮书
            </a>
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

    // APK下载
    async downloadApk(ctx) {
      try {
        // 设置响应头，强制下载
        ctx.set('Content-Type', 'application/vnd.android.package-archive');
        ctx.set('Content-Disposition', 'attachment; filename="zenithus-v1.10.apk"');
        ctx.set('Cache-Control', 'no-cache');
        
        // 返回服务器上的APK文件
        const apkPath = '/var/www/html/app-release.apk';
        
        // 检查文件是否存在
        const fs = require('fs');
        const path = require('path');
        
        console.log('检查APK文件路径:', apkPath);
        
        if (fs.existsSync(apkPath)) {
          const stats = fs.statSync(apkPath);
          console.log('APK文件存在，大小:', stats.size, '字节');
          
          // 设置文件大小头
          ctx.set('Content-Length', stats.size.toString());
          
          // 创建文件流
          const fileStream = fs.createReadStream(apkPath);
          
          // 处理流错误
          fileStream.on('error', (error) => {
            console.error('文件流错误:', error);
            ctx.throw(500, '文件读取失败');
          });
          
          ctx.body = fileStream;
        } else {
          // 如果文件不存在，返回错误信息
          console.error('APK文件不存在:', apkPath);
          ctx.status = 404;
          ctx.body = {
            error: 'APK文件不存在',
            message: '请确保APK文件已放置在正确位置',
            path: apkPath
          };
        }
      } catch (error) {
        console.error('APK下载失败:', error);
        ctx.throw(500, 'APK下载失败');
      }
    },

    // 记录下载行为
    async trackDownload(ctx) {
      try {
        const { userId, downloadType, userAgent, ip } = ctx.request.body;
        
        // 记录下载统计信息
        console.log('下载记录:', {
          userId: userId || 'anonymous',
          downloadType: downloadType || 'apk',
          userAgent: userAgent || ctx.request.headers['user-agent'],
          ip: ip || ctx.request.ip,
          timestamp: new Date().toISOString()
        });

        // 这里可以添加数据库记录逻辑
        // await strapi.entityService.create('api::download-log.download-log', {
        //   data: {
        //     userId: userId || null,
        //     downloadType,
        //     userAgent: ctx.request.headers['user-agent'],
        //     ip: ctx.request.ip,
        //     timestamp: new Date()
        //   }
        // });

        ctx.body = {
          success: true,
          message: '下载记录已保存'
        };
      } catch (error) {
        console.error('记录下载失败:', error);
        ctx.body = {
          success: false,
          message: '记录下载失败'
        };
      }
    },

    // 白皮书页面
    async showWhitepaperPage(ctx) {
      try {
        const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zenithus 白皮书</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%);
            color: white;
            line-height: 1.7;
            letter-spacing: 0.3px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            padding: 60px 0;
            background: linear-gradient(135deg, #1A1A1A 0%, #2C2C2C 100%);
            border-radius: 24px;
            margin-bottom: 40px;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, rgba(0, 122, 255, 0.1), rgba(0, 212, 255, 0.1));
            pointer-events: none;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            background: #2a2a2a;
            border-radius: 16px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .logo-diamond {
            width: 42px;
            height: 42px;
            background: linear-gradient(135deg, #FF6B9D 0%, #FFD700 100%);
            clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        }
        
        .header h1 {
            font-size: 48px;
            font-weight: 300;
            background: linear-gradient(45deg, #007AFF, #00D4FF);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 16px;
            letter-spacing: 2px;
        }
        
        .header p {
            font-size: 18px;
            color: rgba(255, 255, 255, 0.8);
            font-weight: 400;
        }
        
        .toc {
            background: linear-gradient(135deg, #1A1A1A 0%, #2C2C2C 100%);
            border-radius: 24px;
            padding: 40px;
            margin-bottom: 40px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .toc h2 {
            font-size: 32px;
            font-weight: 300;
            margin-bottom: 32px;
            letter-spacing: 1.2px;
            display: flex;
            align-items: center;
        }
        
        .toc h2::before {
            content: '';
            width: 4px;
            height: 32px;
            background: linear-gradient(45deg, #007AFF, #00D4FF);
            border-radius: 2px;
            margin-right: 16px;
        }
        
        .toc-item {
            display: flex;
            align-items: center;
            padding: 20px;
            margin-bottom: 16px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .toc-item:hover {
            background: rgba(0, 122, 255, 0.1);
            border-color: rgba(0, 122, 255, 0.3);
            transform: translateY(-2px);
        }
        
        .toc-number {
            width: 40px;
            height: 40px;
            background: linear-gradient(45deg, #007AFF, #00D4FF);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            margin-right: 20px;
        }
        
        .toc-content h3 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 4px;
            color: white;
        }
        
        .toc-content p {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
        }
        
        .section {
            background: linear-gradient(135deg, #1A1A1A 0%, #2C2C2C 100%);
            border-radius: 24px;
            margin-bottom: 40px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }
        
        .section-header {
            background: linear-gradient(135deg, #007AFF 0%, #00D4FF 100%);
            padding: 40px;
            position: relative;
        }
        
        .section-header h2 {
            font-size: 32px;
            font-weight: 300;
            color: white;
            margin-bottom: 8px;
            letter-spacing: 1.2px;
            display: flex;
            align-items: center;
        }
        
        .section-header h2::before {
            content: '';
            width: 4px;
            height: 32px;
            background: white;
            border-radius: 2px;
            margin-right: 16px;
        }
        
        .section-header p {
            font-size: 18px;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 400;
        }
        
        .section-content {
            padding: 40px;
        }
        
        .subsection {
            margin-bottom: 32px;
        }
        
        .subsection h3 {
            font-size: 24px;
            font-weight: 600;
            color: #007AFF;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
        }
        
        .subsection h3::before {
            content: '';
            width: 6px;
            height: 6px;
            background: #007AFF;
            border-radius: 3px;
            margin-right: 12px;
        }
        
        .subsection p {
            font-size: 16px;
            line-height: 1.8;
            color: rgba(255, 255, 255, 0.9);
            text-align: justify;
        }
        
        .back-btn {
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 12px;
            color: white;
            text-decoration: none;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            z-index: 1000;
        }
        
        .back-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .header h1 {
                font-size: 32px;
            }
            
            .section-header h2 {
                font-size: 24px;
            }
            
            .subsection h3 {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <a href="javascript:history.back()" class="back-btn">
        ← 返回
    </a>
    
    <div class="container">
        <div class="header">
            <div class="logo">
                <div class="logo-diamond"></div>
            </div>
            <h1>Zenithus 白皮书</h1>
            <p>AI驱动的大健康跨境平台</p>
        </div>
        
        <div class="toc">
            <h2>目录</h2>
            <div class="toc-item" onclick="scrollToSection('intro')">
                <div class="toc-number">1</div>
                <div class="toc-content">
                    <h3>引言</h3>
                    <p>项目背景与使命</p>
                </div>
            </div>
            <div class="toc-item" onclick="scrollToSection('market')">
                <div class="toc-number">2</div>
                <div class="toc-content">
                    <h3>市场分析</h3>
                    <p>全球大健康产业趋势</p>
                </div>
            </div>
            <div class="toc-item" onclick="scrollToSection('platform')">
                <div class="toc-number">3</div>
                <div class="toc-content">
                    <h3>Zenithus平台概述</h3>
                    <p>平台定位与核心价值</p>
                </div>
            </div>
            <div class="toc-item" onclick="scrollToSection('tech')">
                <div class="toc-number">4</div>
                <div class="toc-content">
                    <h3>技术架构与核心优势</h3>
                    <p>AI智能营销系统</p>
                </div>
            </div>
            <div class="toc-item" onclick="scrollToSection('business')">
                <div class="toc-number">5</div>
                <div class="toc-content">
                    <h3>商业模式</h3>
                    <p>投资认购与盈利模式</p>
                </div>
            </div>
            <div class="toc-item" onclick="scrollToSection('ecosystem')">
                <div class="toc-number">6</div>
                <div class="toc-content">
                    <h3>生态体系建设</h3>
                    <p>商城、淘金、认购专区</p>
                </div>
            </div>
            <div class="toc-item" onclick="scrollToSection('partnership')">
                <div class="toc-number">7</div>
                <div class="toc-content">
                    <h3>合作伙伴与战略布局</h3>
                    <p>国际合作与渠道拓展</p>
                </div>
            </div>
            <div class="toc-item" onclick="scrollToSection('risk')">
                <div class="toc-number">8</div>
                <div class="toc-content">
                    <h3>风险控制与合规管理</h3>
                    <p>安全保障与合规运营</p>
                </div>
            </div>
            <div class="toc-item" onclick="scrollToSection('roadmap')">
                <div class="toc-number">9</div>
                <div class="toc-content">
                    <h3>发展路线图</h3>
                    <p>短期、中期、长期目标</p>
                </div>
            </div>
            <div class="toc-item" onclick="scrollToSection('team')">
                <div class="toc-number">10</div>
                <div class="toc-content">
                    <h3>团队与顾问</h3>
                    <p>核心团队与专家委员会</p>
                </div>
            </div>
            <div class="toc-item" onclick="scrollToSection('conclusion')">
                <div class="toc-number">11</div>
                <div class="toc-content">
                    <h3>总结与展望</h3>
                    <p>未来发展与愿景</p>
                </div>
            </div>
        </div>
        
        <div id="intro" class="section">
            <div class="section-header">
                <h2>一、引言</h2>
                <p>项目背景与使命</p>
            </div>
            <div class="section-content">
                <div class="subsection">
                    <h3>项目背景</h3>
                    <p>在全球经济快速融合的背景下，大健康产业以其广阔的发展前景和强劲的市场需求成为全球投资热点。与此同时，人工智能技术（AI）的快速发展和应用，也为传统健康产业带来了创新和转型的巨大机遇。Zenithus平台正是基于这样的大背景下诞生，结合AI技术与大健康产业优势，积极布局跨境出海市场，致力于推动高端健康产品更高效地进入东南亚、欧美等国际市场。</p>
                </div>
                <div class="subsection">
                    <h3>行业痛点与机遇</h3>
                    <p>随着全球人口老龄化趋势加剧及健康意识的提升，高端健康产品在国际市场的需求不断攀升。然而，由于信息不对称、营销手段单一、市场定位不精准等问题，许多优秀的健康产品未能有效进入海外市场，无法实现其价值最大化。这为创新型平台带来了明确的发展机遇，即如何通过科技驱动、精准营销，破解传统跨境营销的痛点。</p>
                </div>
                <div class="subsection">
                    <h3>Zenithus平台使命与愿景</h3>
                    <p>Zenithus平台的使命是通过AI技术赋能全球大健康产业，助力优质草本多肽产品实现高效精准的跨境营销。我们的愿景是成为全球领先的AI驱动的大健康跨境出海平台，以创新产品和技术助力全球健康产业升级，为投资者创造持续稳定的收益和价值，助推全球健康经济持续繁荣发展。</p>
                </div>
            </div>
        </div>
        
        <div id="market" class="section">
            <div class="section-header">
                <h2>二、市场分析</h2>
                <p>全球大健康产业趋势</p>
            </div>
            <div class="section-content">
                <div class="subsection">
                    <h3>全球大健康产业趋势分析</h3>
                    <p>随着全球人口结构的变化，老龄化日益显著，人们对健康生活的追求持续增强。根据市场研究数据显示，全球大健康产业每年以超过5%的速度稳定增长，预计未来十年内将达到数万亿美元的市场规模。特别是在亚太地区、欧美市场等经济发达地区，大健康领域的消费需求呈现明显的增长趋势。</p>
                </div>
                <div class="subsection">
                    <h3>跨境出海市场机会分析</h3>
                    <p>跨境出海成为近年来健康产品企业实现增长突破的关键路径之一，尤其是高端、差异化的健康产品更易于被国际市场接受。东南亚、欧美地区市场对高品质的草本多肽产品需求旺盛，但本地供应不足，市场缺口显著。这为Zenithus平台利用跨境出海策略，推动AI赋能的大健康产品进入国际市场，创造了极大的发展空间。</p>
                </div>
                <div class="subsection">
                    <h3>AI技术在健康产业中的应用前景</h3>
                    <p>AI技术在大健康产业的应用正在逐步深入。从市场趋势分析、消费需求预测到精准营销与客户管理，AI的高效性与精准性有效提升了传统营销手段的效率和效果。特别是在跨境营销领域，AI技术能有效帮助企业精准定位目标客户群，降低市场进入的风险和成本，显著提升企业的国际竞争力和盈利能力。这正是Zenithus平台应用AI技术布局国际市场的重要战略支撑。</p>
                </div>
            </div>
        </div>
        
        <div id="platform" class="section">
            <div class="section-header">
                <h2>三、Zenithus平台概述</h2>
                <p>平台定位与核心价值</p>
            </div>
            <div class="section-content">
                <div class="subsection">
                    <h3>平台定位</h3>
                    <p>Zenithus是一款以AI技术驱动的跨境出海平台，专注于推动高端草本多肽产品进入东南亚、欧美等国际市场。平台通过精准的市场分析与智能营销策略，有效满足国际用户对高品质健康产品的需求。</p>
                </div>
                <div class="subsection">
                    <h3>产品与服务介绍</h3>
                    <p>Zenithus平台主营高端草本多肽产品，这些产品具有高科技含量、高品质保障以及强大的市场竞争力。平台提供便捷的认购方案，帮助投资者灵活选择投资档位，通过认购草本多肽产品实现资产增值。同时，平台还设有商城专区、淘金专区和认购专区，为用户提供多样化的消费与投资体验。</p>
                </div>
                <div class="subsection">
                    <h3>核心价值主张</h3>
                    <p>Zenithus平台的核心价值在于充分利用AI技术的优势，实现产品营销的精准性、高效性与智能化。通过整合全球大健康产业链资源，Zenithus不仅能够迅速打开海外市场，还能最大化投资者和合作伙伴的收益，推动全球大健康产业持续发展，实现多方共赢。</p>
                </div>
            </div>
        </div>
        
        <div id="tech" class="section">
            <div class="section-header">
                <h2>四、技术架构与核心优势</h2>
                <p>AI智能营销系统</p>
            </div>
            <div class="section-content">
                <div class="subsection">
                    <h3>AI智能营销系统</h3>
                    <p>Zenithus平台搭载领先的AI智能营销系统，具备深度学习算法、智能数据分析、实时市场洞察等先进技术能力。系统能够对目标市场消费行为进行精准预测，自动优化营销方案，大幅提升产品推广效率，显著提高市场覆盖率。</p>
                </div>
                <div class="subsection">
                    <h3>大健康产业链资源整合</h3>
                    <p>平台整合全球大健康产业链上下游资源，包括产品研发、生产制造、品牌推广及物流配送等各环节。通过资源的高效整合与协同合作，Zenithus实现了从生产到营销的一体化闭环管理，保障了产品的品质和供应链的高效运转。</p>
                </div>
                <div class="subsection">
                    <h3>产品特色与市场优势</h3>
                    <p>Zenithus平台精选的草本多肽产品具备明显的市场差异化优势。产品不仅技术含量高，而且品质严格把控，满足国际市场对高端健康产品的严苛标准。同时，通过AI赋能，产品在国际市场的品牌效应和认可度快速提升，进一步巩固了平台及产品在海外市场的领先地位。</p>
                </div>
            </div>
        </div>
        
        <div id="business" class="section">
            <div class="section-header">
                <h2>五、商业模式</h2>
                <p>投资认购与盈利模式</p>
            </div>
            <div class="section-content">
                <div class="subsection">
                    <h3>投资认购方案介绍</h3>
                    <p>Zenithus平台提供多层次投资认购方案，满足投资者多元化需求。通过认购草本多肽产品，用户可享受稳定收益和额外奖励，进一步提升投资价值。</p>
                </div>
                <div class="subsection">
                    <h3>营收模式分析</h3>
                    <p>平台主要通过产品销售收入、用户认购产生的服务费用和其他增值服务收入实现盈利。同时，通过拓展国际市场，平台收益渠道不断丰富，收入结构更加稳定。</p>
                </div>
                <div class="subsection">
                    <h3>盈利点与成长空间</h3>
                    <p>Zenithus在国际市场布局的拓展中，持续扩大产品销售规模，增强品牌价值。同时，平台持续优化AI技术营销能力，提升客户留存率和消费频率，创造可持续增长空间，实现长期稳定盈利。</p>
                </div>
            </div>
        </div>
        
        <div id="ecosystem" class="section">
            <div class="section-header">
                <h2>六、生态体系建设</h2>
                <p>商城、淘金、认购专区</p>
            </div>
            <div class="section-content">
                <div class="subsection">
                    <h3>商城专区介绍</h3>
                    <p>Zenithus平台设立商城专区，提供高端草本多肽相关产品，满足用户日常健康消费需求，提升用户粘性。</p>
                </div>
                <div class="subsection">
                    <h3>淘金专区介绍</h3>
                    <p>平台推出淘金专区，提供创新型投资体验，增强用户投资的趣味性与互动性，有效提升用户活跃度。</p>
                </div>
                <div class="subsection">
                    <h3>认购专区介绍</h3>
                    <p>认购专区提供多样化的认购方案，用户可根据自身需求灵活选择产品档位，享受稳定的投资收益与福利，实现资产增值与财富增益。</p>
                </div>
            </div>
        </div>
        
        <div id="partnership" class="section">
            <div class="section-header">
                <h2>七、合作伙伴与战略布局</h2>
                <p>国际合作与渠道拓展</p>
            </div>
            <div class="section-content">
                <div class="subsection">
                    <h3>国际与区域性合作机构介绍</h3>
                    <p>Zenithus平台积极与国际知名大健康机构、区域性跨境贸易企业建立深度合作关系，借助这些合作伙伴的渠道和资源，快速拓展国际市场。</p>
                </div>
                <div class="subsection">
                    <h3>战略合作模式</h3>
                    <p>平台通过多种战略合作模式，包括联合研发、渠道共享、营销推广等，与合作伙伴实现优势互补，提升品牌效应。</p>
                </div>
                <div class="subsection">
                    <h3>合作案例分享</h3>
                    <p>平台已与多个海外市场的中小型健康企业成功合作，成功推动产品落地，取得显著的市场反馈与良好业绩，进一步巩固了Zenithus品牌的国际影响力。</p>
                </div>
            </div>
        </div>
        
        <div id="risk" class="section">
            <div class="section-header">
                <h2>八、风险控制与合规管理</h2>
                <p>安全保障与合规运营</p>
            </div>
            <div class="section-content">
                <div class="subsection">
                    <h3>风险识别与管理</h3>
                    <p>Zenithus平台高度重视风险控制，建立了完善的风险识别与防控机制。平台通过实时数据监控和分析，提前识别市场风险、运营风险和技术风险，实施精准的风险预警措施，确保各项业务安全稳定运行。</p>
                </div>
                <div class="subsection">
                    <h3>合规管理体系</h3>
                    <p>Zenithus严格遵守国际及当地的法律法规，全面落实合规经营。平台建立了完善的法律顾问机制，定期审查业务模式及合作伙伴资质，确保所有交易、合作及运营活动合法合规，保障投资者权益。</p>
                </div>
                <div class="subsection">
                    <h3>用户资金安全保障</h3>
                    <p>Zenithus采用先进的资金管理技术和安全措施，保障用户资金安全。通过资金独立存管、严密的交易监控系统以及信息加密技术，全面保护用户资金和隐私安全，构建安全、透明的投资环境。</p>
                </div>
                <div class="subsection">
                    <h3>持续合规更新</h3>
                    <p>Zenithus持续跟踪国际法律法规变化和行业监管动态，及时更新合规政策与措施，确保平台运营始终处于合规前沿。平台同时积极与监管机构保持沟通与合作，保障业务发展的合法性和可持续性。</p>
                </div>
            </div>
        </div>
        
        <div id="roadmap" class="section">
            <div class="section-header">
                <h2>九、发展路线图</h2>
                <p>短期、中期、长期目标</p>
            </div>
            <div class="section-content">
                <div class="subsection">
                    <h3>短期发展目标（1年内）</h3>
                    <p>• 完善平台基础设施建设，提升用户体验和交互功能。<br>• 建立AI智能营销系统初步模型，初步实现数据驱动的精准营销。<br>• 完成首批草本多肽产品在东南亚地区的市场推广和销售。<br>• 启动首批战略合作项目，拓展渠道资源。</p>
                </div>
                <div class="subsection">
                    <h3>中期发展目标（2-3年）</h3>
                    <p>• 深化AI技术应用，优化平台营销算法，全面提高营销效率和用户转化率。<br>• 实现欧美市场布局，成功推广并树立Zenithus品牌在欧美市场的影响力。<br>• 扩大生态体系建设，进一步丰富商城专区、淘金专区及认购专区的产品及服务。<br>• 增强与国际知名机构的战略合作，进一步提升国际市场份额。</p>
                </div>
                <div class="subsection">
                    <h3>长期发展目标（3年以上）</h3>
                    <p>• 成为全球领先的AI驱动的大健康跨境出海平台，实现规模化国际市场占有率。<br>• 持续优化产业链资源整合，推动全球大健康产业的良性发展与升级。<br>• 建立强大的用户社区和品牌生态圈，打造高端健康产品领域的领导品牌。<br>• 实现平台运营的多元化与稳健持续增长，稳定提升投资者收益水平。</p>
                </div>
            </div>
        </div>
        
        <div id="team" class="section">
            <div class="section-header">
                <h2>十、团队与顾问</h2>
                <p>核心团队与专家委员会</p>
            </div>
            <div class="section-content">
                <div class="subsection">
                    <h3>核心团队成员介绍</h3>
                    <p>Zenithus平台的核心团队由来自香港、深圳以及海外多元背景的行业精英组成。他们拥有丰富的跨境营销经验和AI技术背景，具备国际化视野，致力于推动平台的全球业务发展。</p>
                    <p><br><strong>• 首席执行官（CEO）— 陈嘉豪：</strong> 曾任职于多家国际知名企业，具备丰富的国际市场拓展经验，专注于跨境战略制定和企业国际化运营。</p>
                    <p><br><strong>• 首席技术官（CTO）— 林宇翔：</strong> 资深AI技术专家，曾在深圳多家科技企业担任技术高管，精通人工智能算法和数据分析系统的研发。</p>
                    <p><br><strong>• 首席市场官（CMO）— James Smith：</strong> 在欧美跨境电商领域有超过十年的营销管理经验，成功打造多个国际品牌，拥有丰富的海外市场资源。</p>
                </div>
                <div class="subsection">
                    <h3>战略顾问与专家委员会</h3>
                    <p>Zenithus平台同时聘请了来自香港、欧美等地的行业专家作为战略顾问，为平台提供全球视角的战略建议和市场资源支持。</p>
                    <p><br><strong>• 行业专家顾问— 李志明：</strong> 拥有超过二十年的国际大健康产业经验，专注于全球健康产业趋势分析与战略布局。</p>
                    <p><br><strong>• 技术顾问— Dr. Emily White：</strong> 著名的人工智能研究学者，长期从事AI技术在国际市场应用的研究和实践。</p>
                    <p><br><strong>• 法律合规顾问— 王婉如：</strong> 资深国际法律专家，擅长跨境法律事务和合规风险管理。</p>
                    <p><br>Zenithus平台依托多元化的国际团队及顾问资源，确保平台业务的合规性与创新性，实现长期稳健发展，并为投资者和合作伙伴创造持续稳定的价值。</p>
                </div>
            </div>
        </div>
        
        <div id="conclusion" class="section">
            <div class="section-header">
                <h2>十一、总结与展望</h2>
                <p>未来发展与愿景</p>
            </div>
            <div class="section-content">
                <div class="subsection">
                    <h3>总结与展望</h3>
                    <p>Zenithus平台基于AI技术与健康产业深度融合的前沿趋势，积极布局跨境出海市场。未来，平台将继续优化AI技术应用，加强市场精准定位，全面拓展国际影响力。通过构建高效的跨境营销体系和生态平台，Zenithus致力于成为全球领先的AI驱动跨境健康平台。</p>
                </div>
                <div class="subsection">
                    <h3>未来愿景</h3>
                    <p>我们将继续深化与全球合作伙伴的战略协作，共同推动国际市场拓展和产业升级，助力全球健康产业可持续发展。Zenithus平台秉持初心，持续创新，努力为用户、投资者和合作伙伴创造更高价值，共享全球健康经济发展红利。</p>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        function scrollToSection(sectionId) {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
        
        // 添加滚动监听，高亮当前章节
        window.addEventListener('scroll', function() {
            const sections = document.querySelectorAll('.section');
            const tocItems = document.querySelectorAll('.toc-item');
            
            let currentSection = '';
            
            sections.forEach((section, index) => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 100 && rect.bottom >= 100) {
                    currentSection = section.id;
                }
            });
            
            tocItems.forEach((item, index) => {
                const sectionId = ['intro', 'market', 'platform', 'tech', 'business', 'ecosystem', 'partnership', 'risk', 'roadmap', 'team', 'conclusion'][index];
                if (sectionId === currentSection) {
                    item.style.background = 'rgba(0, 122, 255, 0.1)';
                    item.style.borderColor = 'rgba(0, 122, 255, 0.3)';
                } else {
                    item.style.background = 'rgba(255, 255, 255, 0.05)';
                    item.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }
            });
        });
    </script>
</body>
</html>`;
        
        ctx.type = 'text/html';
        ctx.body = html;
      } catch (error) {
        console.error('白皮书页面生成失败:', error);
        ctx.throw(500, '白皮书页面生成失败');
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
