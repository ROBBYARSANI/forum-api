/**
 * Goodbye Endpoint Tests
 * Unit tests for the goodbye endpoint
 */

const createServer = require('../../../Infrastructures/http/createServer');

describe('/goodbye endpoint', () => {
  let server;

  beforeAll(async () => {
    server = await createServer({});
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('GET /goodbye', () => {
    it('should return 200 status code', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/goodbye',
      });

      expect(response.statusCode).toBe(200);
    });

    it('should return goodbye message', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/goodbye',
      });

      const responseJson = JSON.parse(response.payload);
      expect(responseJson.status).toBe('success');
      expect(responseJson.message).toContain('Goodbye');
    });

    it('should return timestamp', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/goodbye',
      });

      const responseJson = JSON.parse(response.payload);
      expect(responseJson.timestamp).toBeDefined();
      expect(typeof responseJson.timestamp).toBe('string');
    });

    it('should return available endpoints', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/goodbye',
      });

      const responseJson = JSON.parse(response.payload);
      expect(responseJson.endpoints).toBeDefined();
      expect(responseJson.endpoints.health).toBeDefined();
      expect(responseJson.endpoints.status).toBeDefined();
      expect(responseJson.endpoints['server-info']).toBeDefined();
    });
  });
});
