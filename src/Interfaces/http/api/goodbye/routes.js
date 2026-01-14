/**
 * Goodbye Routes
 * Defines the goodbye endpoint routes
 */

const createGoodbyeHandler = require('./handler');

const routes = async (server) => {
  const { getGoodbyeHandler } = createGoodbyeHandler();

  server.route({
    method: 'GET',
    path: '/goodbye',
    handler: getGoodbyeHandler,
  });
};

module.exports = routes;
