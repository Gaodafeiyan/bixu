const axios = require('axios');

const BASE_URL = 'http://localhost:1337/api';

// 创建示例Banner数据
async function createSampleBanners() {
  console.log('🎨 创建示例Banner数据...');
  
  const banners = [
    {
      title: '裕丰朋♥🌹 草本多肽',
      subtitle: '专业草本营养，呵护健康生活',
      description: '采用先进工艺，精选优质草本原料，为您提供专业的营养补充方案',
      order: 1,
      isActive: true
    },
    {
      title: '7项专利技术',
      subtitle: '4项进口成分，5大益生元',
      description: '活性益生菌出厂添加量≥500亿CFU每袋，两大肽类专利认证',
      order: 2,
      isActive: true
    },
    {
      title: '修复细胞，呵护肠道健康',
      subtitle: '润肠通便，美容美白',
      description: '调理解决肠道消化，便秘，肥胖等问题，加强吸收',
      order: 3,
      isActive: true
    }
  ];

  for (const banner of banners) {
    try {
      const response = await axios.post(`${BASE_URL}/banners`, {
        data: banner
      });
      console.log(`✅ Banner创建成功: ${banner.title}`);
    } catch (error) {
      console.error(`❌ Banner创建失败: ${banner.title}`, error.response?.data || error.message);
    }
  }
}

// 创建示例产品介绍数据
async function createSampleProductIntro() {
  console.log('📦 创建示例产品介绍数据...');
  
  const productData = {
    productName: '裕丰朋♥🌹 草本多肽',
    productSubtitle: '专业草本营养，呵护健康生活',
    shortDescription: '采用先进工艺，精选优质草本原料，为您提供专业的营养补充方案',
    fullDescription: `
      <h2>产品资料</h2>
      <p><strong>支撑点，主要成分亮点(详见ppt介绍)：</strong></p>
      <p><strong>产品及主要成分：</strong></p>
      <ul>
        <li>7项专利</li>
        <li>4项进口成分</li>
        <li>5大益生元</li>
        <li>活性益生菌出厂添加量≥500亿CFU每袋</li>
        <li>两大肽类专利认证</li>
      </ul>
      <p><strong>主要成分：</strong></p>
      <ul>
        <li>大豆肽</li>
        <li>鳕鱼胶原蛋白肽</li>
        <li>鲣鱼胶原蛋白肽</li>
        <li>鱼胶原蛋白肽</li>
      </ul>
      <p><strong>调理效果：</strong></p>
      <p>修复细胞，呵护肠道健康，润肠通便，美容美白，调理解决肠道消化，便秘，肥胖等问题，加强吸收</p>
    `,
    highlights: {
      patents: 7,
      importedIngredients: 4,
      prebiotics: 5,
      probiotics: '≥500亿CFU每袋',
      peptidePatents: 2
    },
    ingredients: [
      {
        name: '鳕鱼胶原蛋白肽',
        description: '进口成分',
        benefits: '深度补水，润肤淡纹，促进睡眠',
        isImported: true,
        hasPatent: false
      },
      {
        name: '鱼胶原蛋白肽罗非',
        description: '专利成分',
        benefits: '深度补水，增加水润度',
        isImported: false,
        hasPatent: true,
        patentInfo: '罗非专利'
      },
      {
        name: '大豆肽',
        description: '江南大学专利',
        benefits: '激活细胞，促进吸收，提升免疫',
        isImported: false,
        hasPatent: true,
        patentInfo: '江南大学专利'
      },
      {
        name: '鲣鱼弹性蛋白肽',
        description: '进口成分',
        benefits: '增加肌肤弹性，抑制胸部下垂和提升胸部',
        isImported: true,
        hasPatent: false
      },
      {
        name: '低聚果糖',
        description: '进口成分',
        benefits: '调节肠道菌群、促进钙吸收、调节血脂和免疫调节',
        isImported: true,
        hasPatent: false
      },
      {
        name: '菊粉',
        description: '进口成分',
        benefits: '控制血脂、防止便秘、降低血糖',
        isImported: true,
        hasPatent: false
      },
      {
        name: '水苏糖',
        description: '进口成分',
        benefits: '抑制肠道疾病、调节肠道平衡',
        isImported: true,
        hasPatent: false
      },
      {
        name: '酵母抽提物',
        description: '天然成分',
        benefits: '抗氧化，阻挡紫外线，淡化黑色素',
        isImported: false,
        hasPatent: false
      },
      {
        name: '复合益生菌',
        description: '活性菌群',
        benefits: '合成消化酶，促进肠道营养物质的吸收，清除或减少致病菌的黏附，还可以维持肠道菌群结构平衡，改善便秘、腹泻以及消化不良的症状',
        isImported: false,
        hasPatent: false
      }
    ],
    benefits: [
      {
        title: '修复细胞',
        description: '深层修复受损细胞，促进细胞再生',
        icon: '🔬',
        order: 1
      },
      {
        title: '呵护肠道健康',
        description: '调节肠道菌群平衡，改善消化功能',
        icon: '🌿',
        order: 2
      },
      {
        title: '润肠通便',
        description: '促进肠道蠕动，改善便秘问题',
        icon: '💚',
        order: 3
      },
      {
        title: '美容美白',
        description: '改善肌肤状态，提亮肤色',
        icon: '✨',
        order: 4
      },
      {
        title: '调理消化',
        description: '解决肠道消化问题，加强营养吸收',
        icon: '🍃',
        order: 5
      }
    ],
    usageInstructions: `
      <h3>用法说明</h3>
      <p>因为草本多含有益生菌的成分，益生菌是一种活菌制剂，千万不能用热水冲服，水温应该在40度左右。并且冲好的益生菌需要立即使用，减少益生菌在空气当中失活。餐后服效果是最好的，空腹的时候容易刺激胃酸分泌会使益生菌的效果大打折扣，餐后服用胃酸的浓度降低，有利于益生菌顺利的达到肠道而发挥作用。</p>
    `,
    precautions: `
      <h3>注意事项</h3>
      <p>在口服益生菌的时候尽可能不要与抗生素同时口服，最起码需要间隔半小时左右，抗生素会杀死益生菌当中的活菌。服用益生菌期间，尽可能避免吃辛辣刺激的食物</p>
    `,
    isActive: true,
    order: 1
  };

  try {
    const response = await axios.post(`${BASE_URL}/product-intros`, {
      data: productData
    });
    console.log(`✅ 产品介绍创建成功: ${productData.productName}`);
  } catch (error) {
    console.error(`❌ 产品介绍创建失败: ${productData.productName}`, error.response?.data || error.message);
  }
}

// 主函数
async function main() {
  console.log('🚀 开始创建示例数据...');
  
  try {
    await createSampleBanners();
    await createSampleProductIntro();
    
    console.log('✅ 示例数据创建完成！');
    console.log('\n📋 API端点：');
    console.log('- GET /api/banners/active - 获取活跃的Banner列表');
    console.log('- GET /api/banners/:id - 获取Banner详情');
    console.log('- GET /api/product-intros/active - 获取活跃的产品介绍列表');
    console.log('- GET /api/product-intros/name/:name - 根据名称获取产品介绍');
    console.log('- GET /api/product-intros/:id - 获取产品介绍详情');
    
  } catch (error) {
    console.error('❌ 创建示例数据失败:', error);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { createSampleBanners, createSampleProductIntro }; 