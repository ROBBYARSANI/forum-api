const StatusHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'status',
  version: '1.0.0',
  register: async (server) => {
    const statusHandler = new StatusHandler();
    server.route(routes(statusHandler));
  },
};
