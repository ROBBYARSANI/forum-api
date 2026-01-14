/**
 * Server Info Routes
 * Defines routes for server info endpoint
 */

const createServerInfoHandler = require('./handler');

const routes = (server) => {
  const serverInfoHandler = createServerInfoHandler();

  server.route({
    method: 'GET',
    path: '/server-info',
    handler: serverInfoHandler.getServerInfoHandler,
  });
};

module.exports = routes;
