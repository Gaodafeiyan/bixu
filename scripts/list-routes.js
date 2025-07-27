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
}; 