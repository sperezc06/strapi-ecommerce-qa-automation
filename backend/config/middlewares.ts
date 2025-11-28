export default [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:', 'http://localhost:3000', 'http://localhost:1337'],
          'img-src': ["'self'", 'data:', 'blob:', 'http://localhost:3000', 'http://localhost:1337'],
          'media-src': ["'self'", 'data:', 'blob:', 'http://localhost:3000', 'http://localhost:1337'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:3000', 'http://localhost:1337'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With'],
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
