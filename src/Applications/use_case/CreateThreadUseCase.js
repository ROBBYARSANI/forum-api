const BaseUseCase = require('../../Core/BaseUseCase');
const ThreadCreator = require('../../Domains/threads/entities/ThreadCreator');
const CreatedThread = require('../../Domains/threads/entities/CreatedThread');

class CreateThreadUseCase extends BaseUseCase {
  constructor({ threadRepository }) {
    super();
    this._threadRepository = threadRepository;
  }

  async validate(payload) {
    if (!payload.title || !payload.body || !payload.owner) {
      throw new Error('CREATE_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof payload.title !== 'string'
        || typeof payload.body !== 'string'
        || typeof payload.owner !== 'string') {
      throw new Error('CREATE_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  async _process(payload) {
    const threadCreator = new ThreadCreator(payload);
    const createdThread = await this._threadRepository.create(threadCreator);
    return new CreatedThread(createdThread);
  }
}

module.exports = CreateThreadUseCase;
