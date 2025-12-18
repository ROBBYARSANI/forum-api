class BaseUseCase {
  constructor() {
    if (this.constructor === BaseUseCase) {
      throw new Error('Cannot instantiate abstract class');
    }
  }

  // eslint-disable-next-line no-unused-vars
  async validate(payload) {
    throw new Error('ABSTRACT_METHOD.NOT_IMPLEMENTED');
  }

  async execute(payload) {
    await this.validate(payload);
    return this._process(payload);
  }

  // eslint-disable-next-line no-unused-vars
  async _process(payload) {
    throw new Error('ABSTRACT_METHOD.NOT_IMPLEMENTED');
  }
}

module.exports = BaseUseCase;
