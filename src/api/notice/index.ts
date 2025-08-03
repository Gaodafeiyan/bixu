export default {
  routes: () => import('./routes/notice'),
  controllers: () => import('./controllers/notice'),
  contentTypes: () => import('./content-types/notice/schema'),
}; 