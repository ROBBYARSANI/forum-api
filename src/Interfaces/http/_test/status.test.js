const StatusHandler = require('../api/status/handler');

describe('StatusHandler', () => {
  let statusHandler;

  beforeEach(() => {
    statusHandler = new StatusHandler();
  });

  describe('getStatusHandler', () => {
    it('should return detailed system status', () => {
      const result = statusHandler.getStatusHandler();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('message', 'Forum API is running');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('memory');
      expect(result).toHaveProperty('system');
      expect(result).toHaveProperty('version', '1.0.0');

      // Check uptime structure
      expect(result.uptime).toHaveProperty('seconds');
      expect(result.uptime).toHaveProperty('formatted');
      expect(typeof result.uptime.seconds).toBe('number');

      // Check memory structure
      expect(result.memory).toHaveProperty('rss');
      expect(result.memory).toHaveProperty('heapTotal');
      expect(result.memory).toHaveProperty('heapUsed');
      expect(result.memory).toHaveProperty('external');
      expect(result.memory.rss).toMatch(/MB$/);
      expect(result.memory.heapTotal).toMatch(/MB$/);

      // Check system structure
      expect(result.system).toHaveProperty('platform');
      expect(result.system).toHaveProperty('arch');
      expect(result.system).toHaveProperty('nodeVersion');
      expect(result.system).toHaveProperty('pid');
      expect(typeof result.system.pid).toBe('number');
    });

    it('should return valid timestamp', () => {
      const result = statusHandler.getStatusHandler();

      const timestamp = new Date(result.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });
  });
});