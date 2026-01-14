const CommentLikeRepository = require('../../Domains/likes/CommentLikeRepository');

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(like) {
    const id = `like-${this._idGenerator()}`;
    const { commentId, owner } = like;

    const query = {
      text: 'INSERT INTO user_comment_likes (id, user_id, comment_id) VALUES ($1, $2, $3)',
      values: [id, owner, commentId],
    };

    await this._pool.query(query);
  }

  async getLikesByThreadId(threadId) {
    const query = {
      text: `SELECT user_comment_likes.* FROM user_comment_likes 
      LEFT JOIN comments ON comments.id = user_comment_likes.comment_id
      WHERE comments.thread = $1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deleteLike(like) {
    const { commentId, owner } = like;

    const query = {
      text: 'DELETE FROM user_comment_likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, owner],
    };

    await this._pool.query(query);
  }

  async verifyUserCommentLike(like) {
    const { commentId, owner } = like;

    const query = {
      text: 'SELECT 1 FROM user_comment_likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    return !!result.rowCount;
  }
}

module.exports = CommentLikeRepositoryPostgres;
