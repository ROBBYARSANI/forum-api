const Entity = require('../../../Core/Entity');

class ThreadCreator extends Entity {
  constructor(payload) {
    super(payload);
    this.title = payload.title;
    this.body = payload.body;
    this.owner = payload.owner;
  }

  _validatePayload({ title, body, owner }) {
    if (!title || !body || !owner) {
      throw new Error('THREAD_CREATOR.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof title !== 'string' || typeof body !== 'string' || typeof owner !== 'string') {
      throw new Error('THREAD_CREATOR.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ThreadCreator;
