# Rate Limiting Implementation - Forum API

## Overview

Rate limiting telah diimplementasikan untuk melindungi `/threads` endpoint dari DDoS attacks. Sistem menggunakan **dua lapisan** (layered approach):

1. **NGINX Level** - Konfigurasi untuk deployment lokal dengan Docker Compose
2. **Application Level** - Rate limiter di Node.js untuk Railway deployment

---

## Requirement

- **Resource yang dibatasi:** `/threads` dan sub-path-nya
- **Batas request:** 90 requests per menit per IP
- **HTTP Status:** 429 Too Many Requests ketika limit terlampaui

---

## Implementation

### 1. Application Level (Node.js) - ACTIVE ON RAILWAY

**File:** `src/Infrastructures/http/RateLimiter.js`

```javascript
class RateLimiter {
  constructor() {
    this.maxRequests = 90;        // 90 requests per minute
    this.windowMs = 60 * 1000;    // 1 minute window
    // ... tracking logic
  }

  check(ip) {
    // Per-IP request tracking
    // Returns: { allowed: boolean, remaining: number, resetTime: number }
  }

  createHapiHandler() {
    // Returns Hapi extension for onRequest
    // Only rate limits /threads and child routes
  }
}
```

**How it works:**
1. Tracks requests per IP address
2. Uses sliding window (60 seconds)
3. Auto-cleans old entries every 5 minutes
4. Returns 429 status when limit exceeded

**Integration:**
```javascript
// src/Infrastructures/http/createServer.js
const rateLimiter = new RateLimiter();
server.ext('onRequest', rateLimiter.createHapiHandler());
```

---

### 2. NGINX Level - LOCAL DEPLOYMENT

**File:** `nginx.conf`

```nginx
# Rate limit zone definition
limit_req_zone $binary_remote_addr zone=threads_limit:10m rate=90r/m;

location /threads {
    limit_req zone=threads_limit burst=10 nodelay;
    # ... proxy settings
}
```

**Configuration Breakdown:**

| Parameter | Value | Meaning |
|-----------|-------|---------|
| `$binary_remote_addr` | - | Track by client IP |
| `zone=threads_limit:10m` | - | Zone name & memory size (10MB) |
| `rate=90r/m` | 90 req/min | 90 requests per minute |
| `burst=10` | 10 requests | Allow burst of 10 requests |
| `nodelay` | - | No delay for burst requests |

---

## Why Two Layers?

### NGINX Layer (Local):
- ✅ Efficient rate limiting at reverse proxy level
- ✅ Protects upstream application
- ❌ **Doesn't work on Railway** (no NGINX in container)

### Application Layer (Node.js):
- ✅ Works on Railway.app
- ✅ Per-IP tracking
- ✅ Returns proper 429 response with headers
- ⚠️ More CPU intensive than NGINX (but acceptable)

---

## Response Format

### Successful Request (Within Limit)

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 90
X-RateLimit-Remaining: 89
X-RateLimit-Reset: 1705264800

{
  "status": "success",
  "message": "Threads retrieved successfully",
  "data": { ... }
}
```

### Rate Limit Exceeded

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 45
X-RateLimit-Limit: 90
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1705264800

{
  "status": "fail",
  "message": "Terlalu banyak permintaan. Silakan coba lagi nanti."
}
```

---

## Testing Rate Limiting

### 1. Manual Test (Curl)

```bash
# Make 91 requests rapidly to trigger limit
for i in {1..91}; do
  curl -s -w "Request $i: %{http_code}\n" \
    https://forum-api-production-5ea8.up.railway.app/threads
done

# Expected: First 90 = 200, Request 91 = 429
```

### 2. Check Headers

```bash
curl -i https://forum-api-production-5ea8.up.railway.app/threads

# Look for headers:
# X-RateLimit-Limit: 90
# X-RateLimit-Remaining: 89
# X-RateLimit-Reset: <timestamp>
```

### 3. Programmatic Test

```javascript
// Test script
const requestsPerSecond = 10;
const totalRequests = 100;
let successCount = 0;
let limitedCount = 0;

for (let i = 0; i < totalRequests; i++) {
  const response = await fetch('/threads');
  
  if (response.status === 429) {
    limitedCount++;
  } else if (response.status === 200) {
    successCount++;
  }
}

console.log(`Success: ${successCount}, Rate Limited: ${limitedCount}`);
// Expected: ~90 success, ~10 rate limited
```

---

## Monitoring

### Logs

Check application logs for rate limit events:

```bash
# In Railway logs
[RateLimiter] Rate limit exceeded for IP: 192.168.1.100

# In local Docker logs
docker-compose logs forum-api | grep RateLimiter
```

### Metrics

Rate limiter maintains:
- `store` - Map of IP addresses with request timestamps
- `maxRequests` - 90 (configurable)
- `windowMs` - 60000ms (1 minute)
- Cleanup timer - Runs every 5 minutes

---

## Configuration (If Needed)

### Change Rate Limit

Edit `src/Infrastructures/http/RateLimiter.js`:

```javascript
this.maxRequests = 90;      // Change this value
this.windowMs = 60 * 1000;  // 60 seconds window
```

Also update `nginx.conf`:

```nginx
rate=90r/m;  # Change 90 to desired limit
```

---

## Deployment Notes

### Railway.app (Current)
- Uses **application-level rate limiter** only
- NGINX config provided for local development/reference
- Rate limiting is enforced by Node.js middleware

### Local Development (Docker Compose)
- Uses **NGINX rate limiting** when nginx container runs
- Falls back to application-level if NGINX not available
- Both layers work together for redundancy

### Production (Other Platforms)
- With NGINX/reverse proxy: Use NGINX config
- Without NGINX: Use application-level limiter
- Can combine both for defense-in-depth

---

## Files Modified

1. **src/Infrastructures/http/RateLimiter.js**
   - Changed `maxRequests` from 10 to 90
   - Already has proper Hapi integration
   - Tracks per-IP with sliding window

2. **nginx.conf**
   - Added `limit_req_zone` definition
   - Added `/threads` location with rate limiting
   - Proper proxy configuration

---

## Troubleshooting

### Rate Limiting Not Working

**Check 1:** Verify RateLimiter is initialized

```javascript
// In createServer.js
const rateLimiter = new RateLimiter();
server.ext('onRequest', rateLimiter.createHapiHandler());
```

**Check 2:** Verify application logs

```bash
# Should see:
# [RateLimiter] Rate limit exceeded for IP: XXX.XXX.XXX.XXX
```

**Check 3:** Verify request path

- Only `/threads` and child routes are limited
- Other paths bypass rate limiter
- Check with: `curl -i /threads`

### Getting 429 Too Quickly

**Cause:** Using same IP for multiple requests in rapid succession

**Solution:**
1. Wait 1 minute for window reset
2. Check `Retry-After` header for exact time
3. Distribute requests across time

### Headers Not Appearing

**Check:**
- NGINX not forwarding headers (update config)
- Application-level headers should always appear
- Check with: `curl -i` (not just `curl`)

---

## References

- **NGINX Rate Limiting:** https://nginx.org/en/docs/http/ngx_http_limit_req_module.html
- **HTTP 429 Status:** https://httpwg.org/specs/rfc6585.html#status.429
- **Rate Limiting Patterns:** https://en.wikipedia.org/wiki/Rate_limiting

---

**Status:** ✅ Rate limiting configured for 90 requests per minute on `/threads` endpoints
