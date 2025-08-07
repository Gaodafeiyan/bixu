export default ({ env }) => ({
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d'
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