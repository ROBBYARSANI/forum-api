/**
 * Server Info Test
 * Tests for server info endpoint
 * This demonstrates CI with both passing and failing test scenarios
 */

const createServer = require('../../../Infrastructures/http/createServer');

describe('Server Info Endpoint', () => {
  let server;

  beforeAll(async () => {
    server = await createServer({
      jwt: {
        secret: 'secret',
      },
    });
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('GET /server-info', () => {
    it('should return server information with 200 status code', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/server-info',
      });

      expect(response.statusCode).toBe(200);
      expect(response.result.status).toBe('success');
      expect(response.result.data).toBeDefined();
      expect(response.result.data.status).toBe('operational');
      expect(response.result.data.version).toBe('1.0.0');
    });

    it('should return server info with timestamp', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/server-info',
      });

      expect(response.statusCode).toBe(200);
      expect(response.result.data.timestamp).toBeDefined();
      // Verify timestamp is valid ISO string
      expect(new Date(response.result.data.timestamp)).not.toBeNull();
    });

    it('should return uptime information', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/server-info',
      });

      expect(response.statusCode).toBe(200);
      expect(response.result.data.uptime).toBeDefined();
      expect(typeof response.result.data.uptime).toBe('number');
      expect(response.result.data.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return node version', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/server-info',
      });

      expect(response.statusCode).toBe(200);
      expect(response.result.data.nodeVersion).toBeDefined();
      expect(response.result.data.nodeVersion).toMatch(/v\d+\.\d+\.\d+/);
    });

    it('should return rate limit information', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/server-info',
      });

      expect(response.statusCode).toBe(200);
      expect(response.result.data.rateLimit).toBeDefined();
      expect(response.result.data.rateLimit.enabled).toBe(true);
      expect(response.result.data.rateLimit.limit).toContain('90');
      expect(response.result.data.rateLimit.endpoint).toBe('/threads');
    });

    it('should return list of available endpoints', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/server-info',
      });

      expect(response.statusCode).toBe(200);
      expect(response.result.data.endpoints).toBeDefined();
      expect(response.result.data.endpoints.users).toBe('/users');
      expect(response.result.data.endpoints.threads).toBe('/threads');
      expect(response.result.data.endpoints.health).toBe('/health');
    });

    it('should return database connection status', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/server-info',
      });

      expect(response.statusCode).toBe(200);
      expect(response.result.data.database).toBeDefined();
      expect(response.result.data.database.type).toBe('PostgreSQL');
    });

    // THIS TEST WILL FAIL TO DEMONSTRATE CI FAILURE SCENARIO
    it('should return HTTP 404 for invalid endpoint', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/server-info/invalid',
      });

      // This will fail in CI to show failure scenario
      expect(response.statusCode).toBe(404);
    });
  });
});
