class BaseRepository {
  constructor(tableName, pool) {
    this.tableName = tableName;
    this.pool = pool;
  }

  async findById(id) {
    const query = {
      text: `SELECT * FROM ${this.tableName} WHERE id = $1`,
      values: [id],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async delete(id) {
    const query = {
      text: `DELETE FROM ${this.tableName} WHERE id = $1`,
      values: [id],
    };

    await this.pool.query(query);
  }
}

module.exports = BaseRepository;
