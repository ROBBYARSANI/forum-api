const BaseRepository = require('../../Core/BaseRepository');

class LikeRepositoryPostgres extends BaseRepository {
  constructor(pool, idGenerator) {
    super('likes', pool);
    this.idGenerator = idGenerator;
  }

  async checkIfUserHasLikedComment({ commentId, userId }) {
    const query = {
      text: 'SELECT id FROM likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await this.pool.query(query);
    return result.rows.length > 0;
  }

  async likeComment({ commentId, userId }) {
    const id = `like-${this.idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO likes(id, comment_id, user_id, date) VALUES($1, $2, $3, $4)',
      values: [id, commentId, userId, date],
    };

    await this.pool.query(query);
  }

  async unlikeComment({ commentId, userId }) {
    const query = {
      text: 'DELETE FROM likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    await this.pool.query(query);
  }

  async countCommentLikes(commentId) {
    const query = {
      text: 'SELECT COUNT(*) as count FROM likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await this.pool.query(query);
    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = LikeRepositoryPostgres;
