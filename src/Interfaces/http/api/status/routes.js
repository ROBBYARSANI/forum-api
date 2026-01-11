const routes = (handler) => ([
  {
    method: 'GET',
    path: '/status',
    handler: () => handler.getStatusHandler(),
  },
]);

module.exports = routes;