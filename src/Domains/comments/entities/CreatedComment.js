const Entity = require('../../../Core/Entity');
const { ValidationError } = require('../../../Core/DomainError');

class CreatedComment extends Entity {
  constructor(payload) {
    super(payload);
    this.id = payload.id;
    this.content = payload.content;
    this.owner = payload.owner;
  }

  _validatePayload({ id, content, owner }) {
    if (!id || !content || !owner) {
      throw new ValidationError('CREATED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof content !== 'string' || typeof owner !== 'string') {
      throw new ValidationError('CREATED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CreatedComment;
