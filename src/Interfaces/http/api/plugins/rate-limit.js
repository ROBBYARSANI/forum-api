const rateLimit = require('hapi-rate-limit');

const rateLimitPlugin = {
  name: 'rateLimit',
  version: '1.0.0',
  register: async (server) => {
    await server.register({
      plugin: rateLimit,
      options: {
        enabled: true,
        userLimit: 90, // 90 requests per minute per user
        userCache: {
          expiresIn: 60000, // 1 minute
        },
        pathLimit: 90, // 90 requests per minute per path
        pathCache: {
          expiresIn: 60000,
        },
        // Custom function untuk path-specific limits
        getPath: (request) => {
          const { path } = request;
          if (path.startsWith('/threads')) {
            return 'threads';
          }
          return null;
        },
      },
    });
  },
};

module.exports = rateLimitPlugin;
