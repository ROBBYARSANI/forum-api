class Entity {
  constructor(payload) {
    this._validatePayload(payload);
  }

  _validatePayload(payload) {
    if (!payload) {
      throw new Error('ENTITY.NO_PAYLOAD_PROVIDED');
    }
  }
}

module.exports = Entity;
