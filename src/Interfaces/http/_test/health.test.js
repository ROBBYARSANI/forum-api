const HealthHandler = require('../api/health/handler');

describe('HealthHandler', () => {
  let healthHandler;

  beforeEach(() => {
    healthHandler = new HealthHandler();
  });

  describe('getHealthHandler', () => {
    it('should return health status', () => {
      const result = healthHandler.getHealthHandler();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('message', 'Forum API is healthy');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.timestamp).toBe('string');
    });
  });
});
