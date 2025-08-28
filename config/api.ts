export default {
  rest: {
    defaultLimit: 25,
    maxLimit: 2000, // 修复：增加最大限制到2000，确保能返回所有订单
    withCount: true,
  },
};
