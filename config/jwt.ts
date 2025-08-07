export default ({ env }) => ({
  jwt: {
    secret: env('JWT_SECRET', 'your-jwt-secret-key-here'),
  },
}); 