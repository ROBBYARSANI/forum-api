class HealthHandler {
  constructor() {
    this.getHealthHandler = this.getHealthHandler.bind(this);
  }

  getHealthHandler() {
    return {
      status: 'ok',
      message: 'Forum API is healthy',
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = HealthHandler;
