/**
 * Server Info Handler
 * Provides information about the server status and configuration
 * This feature demonstrates CI/CD pipeline
 */

const createServerInfoHandler = () => ({
  getServerInfoHandler: async (request, h) => {
    try {
      const serverInfo = {
        status: 'operational',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
          users: '/users',
          threads: '/threads',
          health: '/health',
          status: '/status',
          'server-info': '/server-info',
        },
        rateLimit: {
          enabled: true,
          limit: '90 requests per minute',
          endpoint: '/threads',
        },
        database: {
          connected: true,
          type: 'PostgreSQL',
        },
      };

      return h.response({
        status: 'success',
        data: serverInfo,
      }).code(200);
    } catch (error) {
      return h.response({
        status: 'error',
        message: error.message,
      }).code(500);
    }
  },
});

module.exports = createServerInfoHandler;
