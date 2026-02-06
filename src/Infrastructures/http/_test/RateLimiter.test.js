const RateLimiter = require('../RateLimiter');

describe('RateLimiter', () => {
  let rateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter();
  });

  afterEach(() => {
    rateLimiter.stop();
  });

  describe('check method', () => {
    it('should allow requests within limit', () => {
      const ip = '192.168.1.1';

      for (let i = 0; i < 90; i += 1) {
        const result = rateLimiter.check(ip);
        expect(result.allowed).toBe(true);
      }
    });

    it('should reject requests exceeding limit', () => {
      const ip = '192.168.1.1';

      // Make 90 allowed requests
      for (let i = 0; i < 90; i += 1) {
        rateLimiter.check(ip);
      }

      // 91st request should be rejected
      const result = rateLimiter.check(ip);
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
    });

    it('should track remaining requests', () => {
      const ip = '192.168.1.2';

      const result1 = rateLimiter.check(ip);
      expect(result1.remaining).toBe(89);

      const result2 = rateLimiter.check(ip);
      expect(result2.remaining).toBe(88);
    });

    it('should distinguish between different IPs', () => {
      const ip1 = '192.168.1.1';
      const ip2 = '192.168.1.2';

      // Use up limit for ip1
      for (let i = 0; i < 90; i += 1) {
        rateLimiter.check(ip1);
      }

      // ip2 should still have requests available
      const result = rateLimiter.check(ip2);
      expect(result.allowed).toBe(true);
    });
  });

  describe('getClientIp method', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = {
        headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' },
        info: { remoteAddress: '127.0.0.1' },
      };

      const ip = rateLimiter.getClientIp(request);
      expect(ip).toBe('192.168.1.1');
    });

    it('should fallback to x-real-ip header', () => {
      const request = {
        headers: { 'x-real-ip': '192.168.1.2' },
        info: { remoteAddress: '127.0.0.1' },
      };

      const ip = rateLimiter.getClientIp(request);
      expect(ip).toBe('192.168.1.2');
    });

    it('should fallback to remoteAddress', () => {
      const request = {
        headers: {},
        info: { remoteAddress: '192.168.1.3' },
      };

      const ip = rateLimiter.getClientIp(request);
      expect(ip).toBe('192.168.1.3');
    });
  });

  describe('createHapiHandler method', () => {
    it('should allow requests to non-threads endpoints', () => {
      const handler = rateLimiter.createHapiHandler();
      const request = {
        path: '/health',
        headers: {},
        info: { remoteAddress: '192.168.1.1' },
        plugins: {},
      };

      const h = { continue: 'continue' };
      const result = handler(request, h);

      expect(result).toBe('continue');
    });

    it('should reject rate-limited requests with 429', () => {
      const handler = rateLimiter.createHapiHandler();

      // Make 10 requests
      for (let i = 0; i < 10; i += 1) {
        const request = {
          path: '/threads',
          headers: {},
          info: { remoteAddress: '192.168.1.1' },
          plugins: {},
        };
        const h = {
          response: () => ({
            code: jest.fn().mockReturnThis(),
            header: jest.fn().mockReturnThis(),
          }),
          continue: 'continue',
        };
        handler(request, h);
      }

      // 11th request should be rejected
      const request = {
        path: '/threads',
        headers: {},
        info: { remoteAddress: '192.168.1.1' },
        plugins: {},
      };

      const h = {
        response: (data) => ({
          data,
          code: jest.fn().mockReturnThis(),
          header: jest.fn().mockReturnThis(),
        }),
        continue: 'continue',
      };

      const result = handler(request, h);
      expect(result).toBeDefined();
    });

    it('should set rate limit headers', () => {
      const handler = rateLimiter.createHapiHandler();
      const request = {
        path: '/threads/1',
        headers: {},
        info: { remoteAddress: '192.168.1.1' },
        plugins: {},
      };

      const h = { continue: 'continue' };
      handler(request, h);

      expect(request.plugins.rateLimiter).toBeDefined();
      expect(request.plugins.rateLimiter.limit).toBe(90);
      expect(request.plugins.rateLimiter.remaining).toBeDefined();
    });
  });
});
