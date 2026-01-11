const StatusHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'status',
  version: '1.0.0',
  register: async (server, { container }) => {
    const statusHandler = new StatusHandler();
    server.route(routes(statusHandler));
  },
};