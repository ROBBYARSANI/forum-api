class HealthHandler {
  constructor() {
    this.getHealthHandler = this.getHealthHandler.bind(this);
  }

  async getHealthHandler(request, h) {
    return {
      status: 'success',
      message: 'Server is healthy',
    };
  }
}

module.exports = HealthHandler;
