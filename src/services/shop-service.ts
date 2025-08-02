import Decimal from 'decimal.js';

export default {
  // 检查用户USDT余额是否足够
  async checkUserBalance(userId: number, requiredAmount: string): Promise<boolean> {
    try {
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: { id: userId } }
      });

      if (!wallets || wallets.length === 0) {
        return false;
      }

      const userWallet = wallets[0];
      const userBalance = new Decimal(userWallet.usdtYue || 0);
      const required = new Decimal(requiredAmount);

      return userBalance.greaterThanOrEqualTo(required);
    } catch (error) {
      console.error('检查用户余额失败:', error);
      return false;
    }
  },

  // 扣除用户USDT余额
  async deductUserBalance(userId: number, amount: string): Promise<boolean> {
    try {
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: { id: userId } }
      });

      if (!wallets || wallets.length === 0) {
        return false;
      }

      const userWallet = wallets[0];
      const currentBalance = new Decimal(userWallet.usdtYue || 0);
      const deductAmount = new Decimal(amount);

      if (currentBalance.lessThan(deductAmount)) {
        return false;
      }

      const newBalance = currentBalance.sub(deductAmount);
      await strapi.entityService.update('api::qianbao-yue.qianbao-yue', userWallet.id, {
        data: { usdtYue: newBalance.toString() }
      });

      return true;
    } catch (error) {
      console.error('扣除用户余额失败:', error);
      return false;
    }
  },

  // 退还用户USDT余额
  async refundUserBalance(userId: number, amount: string): Promise<boolean> {
    try {
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: { id: userId } }
      });

      if (!wallets || wallets.length === 0) {
        return false;
      }

      const userWallet = wallets[0];
      const currentBalance = new Decimal(userWallet.usdtYue || 0);
      const refundAmount = new Decimal(amount);
      const newBalance = currentBalance.plus(refundAmount);

      await strapi.entityService.update('api::qianbao-yue.qianbao-yue', userWallet.id, {
        data: { usdtYue: newBalance.toString() }
      });

      return true;
    } catch (error) {
      console.error('退还用户余额失败:', error);
      return false;
    }
  },

  // 检查商品库存
  async checkProductStock(productId: number, quantity: number): Promise<boolean> {
    try {
      const product = await strapi.entityService.findOne('api::shop-product.shop-product' as any, productId);
      if (!product) {
        return false;
      }

      return product.stock >= quantity;
    } catch (error) {
      console.error('检查商品库存失败:', error);
      return false;
    }
  },

  // 减少商品库存
  async reduceProductStock(productId: number, quantity: number): Promise<boolean> {
    try {
      const product = await strapi.entityService.findOne('api::shop-product.shop-product' as any, productId);
      if (!product || product.stock < quantity) {
        return false;
      }

      const newStock = product.stock - quantity;
      await strapi.entityService.update('api::shop-product.shop-product' as any, productId, {
        data: { stock: newStock }
      });

      return true;
    } catch (error) {
      console.error('减少商品库存失败:', error);
      return false;
    }
  },

  // 恢复商品库存
  async restoreProductStock(productId: number, quantity: number): Promise<boolean> {
    try {
      const product = await strapi.entityService.findOne('api::shop-product.shop-product' as any, productId);
      if (!product) {
        return false;
      }

      const newStock = product.stock + quantity;
      await strapi.entityService.update('api::shop-product.shop-product' as any, productId, {
        data: { stock: newStock }
      });

      return true;
    } catch (error) {
      console.error('恢复商品库存失败:', error);
      return false;
    }
  },

  // 生成订单号
  generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `SO${timestamp}${random}`;
  },

  // 计算订单总金额
  calculateOrderTotal(items: Array<{ price: string; quantity: number }>): string {
    let total = new Decimal(0);
    for (const item of items) {
      total = total.plus(new Decimal(item.price).mul(item.quantity));
    }
    return total.toString();
  },

  // 验证收货地址
  validateShippingAddress(address: any): boolean {
    if (!address) return false;
    
    const requiredFields = ['receiverName', 'mobile', 'province', 'city', 'district', 'address'];
    for (const field of requiredFields) {
      if (!address[field] || address[field].trim() === '') {
        return false;
      }
    }
    
    return true;
  },

  // 获取用户钱包余额
  async getUserWalletBalance(userId: number): Promise<string> {
    try {
      const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { user: { id: userId } }
      });

      if (!wallets || wallets.length === 0) {
        return '0';
      }

      return String(wallets[0].usdtYue || '0');
    } catch (error) {
      console.error('获取用户钱包余额失败:', error);
      return '0';
    }
  },

  // 创建发货订单（从商城订单）
  async createShippingOrderFromShopOrder(shopOrderId: number): Promise<boolean> {
    try {
      const shopOrder = await strapi.entityService.findOne('api::shop-order.shop-order' as any, shopOrderId, {
        populate: ['product', 'user']
      }) as any;

      if (!shopOrder || !shopOrder.product?.isPhysical) {
        return false;
      }

      // 创建发货订单
      const shippingOrder = await strapi.entityService.create('api::shipping-order.shipping-order' as any, {
        data: {
          orderNumber: `SH${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          user: shopOrder.user?.id,
          product: shopOrder.product?.id,
          quantity: shopOrder.quantity,
          status: 'pending',
          receiverName: shopOrder.shippingAddress?.receiverName,
          mobile: shopOrder.shippingAddress?.mobile,
          province: shopOrder.shippingAddress?.province,
          city: shopOrder.shippingAddress?.city,
          district: shopOrder.shippingAddress?.district,
          address: shopOrder.shippingAddress?.address,
          zipCode: shopOrder.shippingAddress?.zipCode || '',
          shopOrderId: shopOrderId
        }
      });

      return true;
    } catch (error) {
      console.error('创建发货订单失败:', error);
      return false;
    }
  }
}; 