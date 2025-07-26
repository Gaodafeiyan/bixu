export default (config, { strapi }) => {
  return async (ctx, next) => {
    try {
      // 验证用户认证
      if (ctx.state.user) {
        const userId = ctx.state.user.id;
        if (!userId || isNaN(Number(userId))) {
          return ctx.unauthorized('无效的用户认证');
        }
      }

      // 验证数字参数
      const validateNumber = (value: any, fieldName: string, min: number = 0) => {
        if (value !== undefined && (isNaN(Number(value)) || Number(value) < min)) {
          throw new Error(`${fieldName}必须是大于等于${min}的数字`);
        }
        return true;
      };

      // 验证字符串参数
      const validateString = (value: any, fieldName: string, minLength: number = 1) => {
        if (value !== undefined && (typeof value !== 'string' || value.length < minLength)) {
          throw new Error(`${fieldName}必须是至少${minLength}个字符的字符串`);
        }
        return true;
      };

      // 验证布尔参数
      const validateBoolean = (value: any, fieldName: string) => {
        if (value !== undefined && typeof value !== 'boolean') {
          throw new Error(`${fieldName}必须是布尔值`);
        }
        return true;
      };

      // 验证日期参数
      const validateDate = (value: any, fieldName: string) => {
        if (value !== undefined) {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            throw new Error(`${fieldName}必须是有效的日期格式`);
          }
        }
        return true;
      };

      // 验证分页参数
      const validatePagination = (page: any, pageSize: any) => {
        const pageNum = parseInt(String(page || 1));
        const pageSizeNum = parseInt(String(pageSize || 10));
        
        if (isNaN(pageNum) || isNaN(pageSizeNum) || pageNum < 1 || pageSizeNum < 1) {
          throw new Error('分页参数必须是大于0的整数');
        }
        
        if (pageSizeNum > 100) {
          throw new Error('每页大小不能超过100');
        }
        
        return true;
      };

      // 验证金额参数
      const validateAmount = (value: any, fieldName: string) => {
        if (value !== undefined) {
          const amount = new (require('decimal.js'))(value);
          if (amount.isNaN() || amount.lessThan(0)) {
            throw new Error(`${fieldName}必须是大于等于0的有效金额`);
          }
        }
        return true;
      };

      // 将验证函数添加到ctx对象中
      ctx.validate = {
        number: validateNumber,
        string: validateString,
        boolean: validateBoolean,
        date: validateDate,
        pagination: validatePagination,
        amount: validateAmount
      };

      await next();
    } catch (error) {
      console.error('验证中间件错误:', error);
      return ctx.badRequest(error.message);
    }
  };
}; 