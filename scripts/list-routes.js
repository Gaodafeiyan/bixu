module.exports = ({ strapi }) => {
  console.log('=== 所有注册的路由 ===');
  console.table(
    strapi.server.routes().map(r => ({
      method: r.method,
      path: r.path,
      type: r.config?.type,
      auth: r.config?.auth,
      handler: r.info.controller + '.' + r.info.action,
    }))
  );
  
  // 特别检查钱包相关路由
  console.log('\n=== 钱包相关路由 ===');
  const walletRoutes = strapi.server.routes().filter(r => 
    r.path.includes('qianbao') || r.path.includes('wallet')
  );
  console.table(
    walletRoutes.map(r => ({
      method: r.method,
      path: r.path,
      auth: r.config?.auth,
      handler: r.info.controller + '.' + r.info.action,
    }))
  );
}; 