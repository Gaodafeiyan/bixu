export default ({ env }) => ({
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
        secret: env('JWT_SECRET', 'your-jwt-secret-key-here')
      },
      register: {
        enabled: false,
        defaultRole: 'authenticated'
      },
      routes: {
        register: false,
        'auth/register': false
      }
    }
  },
  upload: {
    config: {
      provider: 'local',
    },
  },
});