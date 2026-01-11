const pool = require('../../../../Infrastructures/database/postgres/pool');

class HealthHandler {
  constructor() {
    this.getHealthHandler = this.getHealthHandler.bind(this);
  }

  async getHealthHandler() {
    try {
      // Try to connect to database
      const client = await pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();

      return {
        status: 'ok',
        message: 'Forum API is healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Health check database error:', error.message);
      // Still return 200 but indicate database is down
      // This allows the app to start even if database is temporarily unavailable
      return {
        status: 'ok',
        message: 'Forum API is running',
        database: 'disconnected',
        databaseError: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

module.exports = HealthHandler;
