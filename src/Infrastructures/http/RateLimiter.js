/**
 * Rate Limiter for Hapi.js
 * Implements per-IP rate limiting for /threads and related endpoints
 * Requirement: Max 10 requests per minute for /threads endpoints
 */

class RateLimiter {
  constructor() {
    // Store request counts: { ip: { timestamp: count } }
    this.store = new Map();
    this.maxRequests = 10;
    this.windowMs = 60 * 1000; // 1 minute
    this.cleanupInterval = 5 * 60 * 1000; // Clean up every 5 minutes

    // Start cleanup interval
    this.startCleanup();
  }

  /**
   * Check if request is within rate limit
   * @param {string} ip - Client IP address
   * @returns {object} { allowed: boolean, remaining: number, resetTime: number }
   */
  check(ip) {
    const now = Date.now();

    if (!this.store.has(ip)) {
      this.store.set(ip, { requests: [], window_start: now });
    }

    const ipData = this.store.get(ip);

    // Remove old requests outside the window
    ipData.requests = ipData.requests.filter(
      (timestamp) => now - timestamp < this.windowMs,
    );

    const currentCount = ipData.requests.length;
    const allowed = currentCount < this.maxRequests;

    if (allowed) {
      ipData.requests.push(now);
    }

    const resetTime = ipData.window_start + this.windowMs;
    const remaining = Math.max(0, this.maxRequests - currentCount - 1);

    return {
      allowed,
      remaining,
      resetTime,
      retryAfter: allowed ? null : Math.ceil((resetTime - now) / 1000),
    };
  }

  /**
   * Get IP address from request
   * @param {object} request - Hapi request object
   * @returns {string} IP address
   */
  getClientIp(request) {
    const xForwarded = request.headers['x-forwarded-for'];
    const xRealIp = request.headers['x-real-ip'];
    return (
      (xForwarded && xForwarded.split(',')[0].trim())
      || xRealIp
      || request.info.remoteAddress
    );
  }

  /**
   * Clean up old entries to prevent memory leak
   */
  startCleanup() {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      const keys = Array.from(this.store.keys());
      keys.forEach((ip) => {
        const data = this.store.get(ip);
        // Remove entries with no recent requests
        if (now - data.window_start > this.windowMs * 2) {
          this.store.delete(ip);
          cleaned += 1;
        }
      });

      if (cleaned > 0) {
        // eslint-disable-next-line no-console
        console.log(`[RateLimiter] Cleaned up ${cleaned} expired entries`);
      }
    }, this.cleanupInterval);
  }

  /**
   * Stop cleanup interval
   */
  stop() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }

  /**
   * Create Hapi extension handler
   * @returns {function} Hapi onRequest handler
   */
  createHapiHandler() {
    return (request, h) => {
      // Only rate limit /threads and its child routes
      if (!request.path.startsWith('/threads')) {
        return h.continue;
      }

      const ip = this.getClientIp(request);
      const result = this.check(ip);

      // Set rate limit headers
      request.plugins.rateLimiter = {
        limit: this.maxRequests,
        remaining: Math.max(0, result.remaining),
        reset: Math.floor(result.resetTime / 1000),
      };

      if (!result.allowed) {
        // eslint-disable-next-line no-console
        console.warn(`[RateLimiter] Rate limit exceeded for IP: ${ip}`);
        const response = h.response({
          status: 'fail',
          message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
        });
        response.code(429); // Too Many Requests
        response.header('Retry-After', result.retryAfter);
        response.header('X-RateLimit-Limit', this.maxRequests);
        response.header('X-RateLimit-Remaining', 0);
        response.header('X-RateLimit-Reset', Math.floor(result.resetTime / 1000));
        return response;
      }

      return h.continue;
    };
  }
}

module.exports = RateLimiter;
