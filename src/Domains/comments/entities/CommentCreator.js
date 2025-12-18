const Entity = require('../../../Core/Entity');
const Content = require('../../../Core/ValueObjects/Content');
const { ValidationError } = require('../../../Core/DomainError');

class CommentCreator extends Entity {
  constructor(payload) {
    super(payload);
    this.content = new Content(payload.content);
    this.threadId = payload.threadId;
    this.userId = payload.userId;
  }

  _validatePayload({ threadId, userId, content }) {
    if (!threadId || !userId || !content) {
      throw new ValidationError('COMMENT_CREATOR.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string' || typeof userId !== 'string') {
      throw new ValidationError('COMMENT_CREATOR.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentCreator;
