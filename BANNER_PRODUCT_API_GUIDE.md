# Banner和产品介绍API使用指南

## 概述

本系统新增了Banner轮播图和产品介绍功能，用于展示产品信息和营销内容。

## 功能特性

### 🎨 Banner功能
- 支持轮播图展示
- 可设置显示时间范围
- 支持排序和状态控制
- 支持图片和链接配置

### 📦 产品介绍功能
- 详细的产品信息展示
- 产品成分和功效说明
- 使用方法和注意事项
- 支持富文本内容
- 产品亮点数据化

## API端点

### Banner API

#### 1. 获取活跃Banner列表
```http
GET /api/banners/active
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "裕丰朋♥🌹 草本多肽",
      "subtitle": "专业草本营养，呵护健康生活",
      "description": "采用先进工艺，精选优质草本原料...",
      "image": {
        "id": 1,
        "url": "/uploads/banner1.jpg"
      },
      "link": "/product/1",
      "order": 1,
      "isActive": true,
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-12-31T23:59:59.000Z"
    }
  ]
}
```

#### 2. 获取Banner详情
```http
GET /api/banners/:id
```

#### 3. 创建Banner
```http
POST /api/banners
Content-Type: application/json

{
  "data": {
    "title": "Banner标题",
    "subtitle": "副标题",
    "description": "描述内容",
    "image": 1,
    "link": "/product/1",
    "order": 1,
    "isActive": true,
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-12-31T23:59:59.000Z"
  }
}
```

### 产品介绍 API

#### 1. 获取活跃产品介绍列表
```http
GET /api/product-intros/active
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "productName": "裕丰朋♥🌹 草本多肽",
      "productSubtitle": "专业草本营养，呵护健康生活",
      "shortDescription": "采用先进工艺，精选优质草本原料...",
      "mainImage": {
        "id": 1,
        "url": "/uploads/product1.jpg"
      },
      "highlights": {
        "patents": 7,
        "importedIngredients": 4,
        "prebiotics": 5,
        "probiotics": "≥500亿CFU每袋",
        "peptidePatents": 2
      },
      "isActive": true,
      "order": 1
    }
  ]
}
```

#### 2. 获取产品介绍详情
```http
GET /api/product-intros/:id
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "productName": "裕丰朋♥🌹 草本多肽",
    "productSubtitle": "专业草本营养，呵护健康生活",
    "shortDescription": "采用先进工艺，精选优质草本原料...",
    "fullDescription": "<h2>产品资料</h2><p>支撑点，主要成分亮点...</p>",
    "highlights": {
      "patents": 7,
      "importedIngredients": 4,
      "prebiotics": 5,
      "probiotics": "≥500亿CFU每袋",
      "peptidePatents": 2
    },
    "ingredients": [
      {
        "id": 1,
        "name": "鳕鱼胶原蛋白肽",
        "description": "进口成分",
        "benefits": "深度补水，润肤淡纹，促进睡眠",
        "isImported": true,
        "hasPatent": false
      }
    ],
    "benefits": [
      {
        "id": 1,
        "title": "修复细胞",
        "description": "深层修复受损细胞，促进细胞再生",
        "icon": "🔬",
        "order": 1
      }
    ],
    "usageInstructions": "<h3>用法说明</h3><p>因为草本多含有益生菌的成分...</p>",
    "precautions": "<h3>注意事项</h3><p>在口服益生菌的时候尽可能不要与抗生素同时口服...</p>",
    "mainImage": {
      "id": 1,
      "url": "/uploads/product1.jpg"
    },
    "gallery": [
      {
        "id": 2,
        "url": "/uploads/product1_detail1.jpg"
      }
    ]
  }
}
```

#### 3. 根据名称获取产品介绍
```http
GET /api/product-intros/name/:name
```

#### 4. 创建产品介绍
```http
POST /api/product-intros
Content-Type: application/json

{
  "data": {
    "productName": "产品名称",
    "productSubtitle": "产品副标题",
    "shortDescription": "简短描述",
    "fullDescription": "<h2>详细描述</h2>",
    "highlights": {
      "patents": 7,
      "importedIngredients": 4,
      "prebiotics": 5,
      "probiotics": "≥500亿CFU每袋",
      "peptidePatents": 2
    },
    "ingredients": [
      {
        "name": "成分名称",
        "description": "成分描述",
        "benefits": "功效说明",
        "isImported": true,
        "hasPatent": false,
        "patentInfo": "专利信息"
      }
    ],
    "benefits": [
      {
        "title": "功效标题",
        "description": "功效描述",
        "icon": "🔬",
        "order": 1
      }
    ],
    "usageInstructions": "<h3>用法说明</h3>",
    "precautions": "<h3>注意事项</h3>",
    "mainImage": 1,
    "gallery": [2, 3],
    "isActive": true,
    "order": 1
  }
}
```

## 数据结构

### Banner数据结构
```typescript
interface Banner {
  id: number;
  title: string;           // 标题
  subtitle?: string;       // 副标题
  description?: string;    // 描述
  image?: Media;          // 图片
  link?: string;          // 链接
  order: number;          // 排序
  isActive: boolean;      // 是否激活
  startDate?: Date;       // 开始时间
  endDate?: Date;         // 结束时间
  createdAt: Date;
  updatedAt: Date;
}
```

### 产品介绍数据结构
```typescript
interface ProductIntro {
  id: number;
  productName: string;           // 产品名称
  productSubtitle?: string;      // 产品副标题
  shortDescription?: string;     // 简短描述
  fullDescription?: string;      // 详细描述（富文本）
  highlights?: {                 // 产品亮点
    patents: number;            // 专利数量
    importedIngredients: number; // 进口成分数量
    prebiotics: number;         // 益生元数量
    probiotics: string;         // 益生菌数量
    peptidePatents: number;     // 肽类专利数量
  };
  ingredients?: Ingredient[];    // 成分列表
  benefits?: Benefit[];          // 功效列表
  usageInstructions?: string;    // 用法说明（富文本）
  precautions?: string;          // 注意事项（富文本）
  mainImage?: Media;            // 主图
  gallery?: Media[];            // 图片库
  isActive: boolean;            // 是否激活
  order: number;                // 排序
  createdAt: Date;
  updatedAt: Date;
}

interface Ingredient {
  id: number;
  name: string;              // 成分名称
  description?: string;      // 成分描述
  benefits?: string;         // 功效说明
  isImported: boolean;      // 是否进口
  hasPatent: boolean;       // 是否有专利
  patentInfo?: string;      // 专利信息
}

interface Benefit {
  id: number;
  title: string;            // 功效标题
  description?: string;     // 功效描述
  icon?: string;           // 图标
  order: number;           // 排序
}
```

## 使用示例

### 前端调用示例

#### 获取Banner列表
```javascript
// 获取活跃的Banner列表
const response = await fetch('/api/banners/active');
const data = await response.json();

if (data.success) {
  const banners = data.data;
  // 在轮播图中显示banners
  banners.forEach(banner => {
    console.log(`Banner: ${banner.title} - ${banner.subtitle}`);
  });
}
```

#### 获取产品介绍
```javascript
// 获取产品介绍详情
const response = await fetch('/api/product-intros/1');
const data = await response.json();

if (data.success) {
  const product = data.data;
  console.log(`产品: ${product.productName}`);
  console.log(`亮点: ${product.highlights.patents}项专利`);
  
  // 显示成分信息
  product.ingredients.forEach(ingredient => {
    console.log(`成分: ${ingredient.name} - ${ingredient.benefits}`);
  });
  
  // 显示功效信息
  product.benefits.forEach(benefit => {
    console.log(`功效: ${benefit.icon} ${benefit.title} - ${benefit.description}`);
  });
}
```

## 部署说明

### 1. 启动服务
```bash
cd bixu
npm run develop
```

### 2. 创建示例数据
```bash
node scripts/create-sample-data.js
```

### 3. 测试API
```bash
node scripts/test-banner-product-api.js
```

## 管理后台

### Banner管理
- 访问 `/admin/content-manager/collectionType/api::banner.banner`
- 可以创建、编辑、删除Banner
- 支持图片上传和富文本编辑

### 产品介绍管理
- 访问 `/admin/content-manager/collectionType/api::product-intro.product-intro`
- 可以创建、编辑、删除产品介绍
- 支持成分和功效的动态配置
- 支持富文本编辑和图片管理

## 注意事项

1. **图片上传**：确保上传目录有写入权限
2. **富文本内容**：支持HTML标签，注意XSS防护
3. **时间设置**：Banner的时间范围用于控制显示时机
4. **排序功能**：通过order字段控制显示顺序
5. **状态控制**：通过isActive字段控制是否显示

## 扩展功能

### 可扩展的功能
- 多语言支持
- 产品分类管理
- 用户评价系统
- 库存管理
- 价格管理
- 购买链接集成

---

**开发完成时间**：2025年1月8日  
**开发人员**：AI Assistant  
**版本**：v1.0.0 