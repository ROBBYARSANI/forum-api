/**
 * Goodbye Endpoint Handler
 * Provides a simple goodbye message endpoint
 * Demonstrates feature addition with proper testing
 */

const createGoodbyeHandler = () => ({
  getGoodbyeHandler: async (request, h) => {
    try {
      const goodbyeMessage = {
        status: 'success',
        message: 'Goodbye! Thank you for using Forum API',
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/health',
          status: '/status',
          'server-info': '/server-info',
        },
      };

      return h.response(goodbyeMessage).code(200);
    } catch (error) {
      return h.response({
        status: 'error',
        message: error.message,
      }).code(500);
    }
  },
});

module.exports = createGoodbyeHandler;
