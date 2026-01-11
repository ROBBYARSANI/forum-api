/* eslint-disable no-console */
require('dotenv').config();
const createServer = require('./Infrastructures/http/createServer');
const container = require('./Infrastructures/container');

(async () => {
  try {
    const server = await createServer(container);
    await server.start();
    console.log(`server start at ${server.info.uri}`);
  } catch (error) {
    console.error('Failed to start server:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});
