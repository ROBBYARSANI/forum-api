const { ValidationError } = require('../DomainError');

class Content {
  constructor(value) {
    this._validate(value);
    this.value = value;
  }

  _validate(value) {
    if (!value || typeof value !== 'string') {
      throw new ValidationError('INVALID_CONTENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (value.trim().length === 0) {
      throw new ValidationError('INVALID_CONTENT.CANNOT_BE_EMPTY');
    }
  }

  toString() {
    return this.value;
  }
}

module.exports = Content;
