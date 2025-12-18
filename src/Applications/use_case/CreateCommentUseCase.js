const BaseUseCase = require('../../Core/BaseUseCase');
const CommentCreator = require('../../Domains/comments/entities/CommentCreator');
const CreatedComment = require('../../Domains/comments/entities/CreatedComment');
const { NotFoundError } = require('../../Core/DomainError');

class CreateCommentUseCase extends BaseUseCase {
  constructor({ threadRepository, commentRepository }) {
    super();
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async validate(payload) {
    const thread = await this._threadRepository.findById(payload.threadId);
    if (!thread) {
      throw new NotFoundError('Thread tidak ditemukan');
    }
  }

  async _process(payload) {
    const commentCreator = new CommentCreator({
      content: payload.content,
      threadId: payload.threadId,
      userId: payload.userId,
    });

    const createdComment = await this._commentRepository.create(commentCreator);
    return new CreatedComment(createdComment);
  }
}

module.exports = CreateCommentUseCase;
