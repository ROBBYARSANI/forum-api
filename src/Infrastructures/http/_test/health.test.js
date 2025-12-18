const HealthHandler = require('../../../Interfaces/http/api/health/handler');

describe('HealthHandler', () => {
  let healthHandler;

  beforeEach(() => {
    healthHandler = new HealthHandler();
  });

  describe('getHealthHandler', () => {
    it('should return success status and message', async () => {
      // Arrange
      const request = {};
      const h = {
        response: jest.fn().mockReturnThis(),
      };

      // Act
      const result = await healthHandler.getHealthHandler(request, h);

      // Assert
      expect(result).toEqual({
        status: 'success',
        message: 'Server is healthy',
      });
    });

    // Failing test for demonstration
    it('should fail intentionally', async () => {
      // This test will fail to demonstrate CI failure scenario
      expect(1 + 1).toBe(3); // This will fail
    });
  });
});
