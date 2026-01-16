/**
 * Rate Limiter for Hapi.js
 * Implements per-IP rate limiting for /threads and related endpoints
 * Requirement: Max 90 requests per minute for /threads endpoints
 */

class RateLimiter {
  constructor() {
    // Store request counts: { ip: { timestamp: count } }
    this.store = new Map();
    this.maxRequests = 90; // 90 requests per minute as per requirement
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

    // Remove old requests outside the current window
    ipData.requests = ipData.requests.filter(
      (timestamp) => now - timestamp < this.windowMs,
    );

    // Update window start if no requests in current window
    if (ipData.requests.length === 0) {
      ipData.window_start = now;
    }

    const currentCount = ipData.requests.length;
    const allowed = currentCount < this.maxRequests;

    // Calculate the oldest request time for reset calculation
    const oldestRequest = ipData.requests.length > 0 ? ipData.requests[0] : now;
    const resetTime = oldestRequest + this.windowMs;

    if (allowed) {
      ipData.requests.push(now);
      const remaining = Math.max(0, this.maxRequests - currentCount - 1);
      return {
        allowed: true,
        remaining,
        resetTime,
        retryAfter: null,
      };
    }

    // Request not allowed - calculate retry after
    const retryAfter = Math.ceil((resetTime - now) / 1000);
    
    return {
      allowed: false,
      remaining: 0,
      resetTime,
      retryAfter: Math.max(1, retryAfter),
    };
  }

  /**
   * Get IP address from request
   * @param {object} request - Hapi request object
   * @returns {string} IP address
   */
  getClientIp(request) {
    // Railway proxy headers (try these first)
    const xForwarded = request.headers['x-forwarded-for'];
    const xRealIp = request.headers['x-real-ip'];
    const cfConnectingIp = request.headers['cf-connecting-ip']; // Cloudflare
    const xClientIp = request.headers['x-client-ip'];
    const trueClientIp = request.headers['true-client-ip'];
    
    // Try to get real client IP from various proxy headers
    const ip = cfConnectingIp
      || trueClientIp
      || xClientIp
      || (xForwarded && xForwarded.split(',')[0].trim())
      || xRealIp
      || request.info.remoteAddress;
    
    // Debug logging (dapat dinonaktifkan di production)
    if (process.env.DEBUG_RATE_LIMIT === 'true') {
      // eslint-disable-next-line no-console
      console.log('[RateLimiter] IP Detection:', {
        finalIp: ip,
        xForwarded,
        xRealIp,
        cfConnectingIp,
        remoteAddress: request.info.remoteAddress,
      });
    }
    
    return ip;
  }

  /**
   * Clean up old entries to prevent memory leak
   */
  startCleanup() {
    this.cleanupTimer = setInterval(() => {
      // Skip cleanup if already stopped (prevents logging after test completion)
      if (!this.cleanupTimer) {
        return;
      }

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

    // Allow process to exit even if this interval is running
    // This is useful for tests and graceful shutdowns
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Stop cleanup interval
   */
  stop() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Create Hapi extension handler
   * @returns {function} Hapi onRequest handler
   */
  createHapiHandler() {
    return (request, h) => {
      // Only rate limit /threads and its child routes using strict regex
      // Matches: /threads, /threads/, /threads/123, /threads/123/comments
      // Does NOT match: /threadsx, /threadsomething
      if (!/^\/threads(\/|$)/.test(request.path)) {
        return h.continue;
      }

      const ip = this.getClientIp(request);
      const result = this.check(ip);

      // Debug logging untuk production troubleshooting
      if (process.env.NODE_ENV === 'production' || process.env.DEBUG_RATE_LIMIT === 'true') {
        // eslint-disable-next-line no-console
        console.log(`[RateLimiter] ${request.method} ${request.path} - IP: ${ip} - Allowed: ${result.allowed} - Remaining: ${result.remaining}`);
      }

      // Set rate limit headers
      request.plugins.rateLimiter = {
        limit: this.maxRequests,
        remaining: Math.max(0, result.remaining),
        reset: Math.floor(result.resetTime / 1000),
      };

      if (!result.allowed) {
        // eslint-disable-next-line no-console
        console.warn(`[RateLimiter] Rate limit exceeded for IP: ${ip} on ${request.path}`);
        const response = h.response({
          status: 'fail',
          message: 'Too many requests, please try again later',
        });
        response.code(429); // Too Many Requests
        response.header('Retry-After', result.retryAfter);
        response.header('X-RateLimit-Limit', this.maxRequests);
        response.header('X-RateLimit-Remaining', 0);
        response.header('X-RateLimit-Reset', Math.floor(result.resetTime / 1000));
        return response.takeover();
      }

      // Add rate limit headers to successful responses
      // This will be visible in response
      return h.continue;
    };
  }
}

module.exports = RateLimiter;
