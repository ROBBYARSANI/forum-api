const { Pool } = require('pg');
const config = require('../../../Commons/config');

class DatabasePool {
  constructor() {
    // Railway memberikan DATABASE_URL, jika tidak ada gunakan config lokal
    const connectionString = process.env.DATABASE_URL;

    const poolConfig = connectionString
      ? {
        connectionString,
        // Railway membutuhkan SSL di production
        ssl: process.env.NODE_ENV === 'production'
          ? {
            rejectUnauthorized: false,
            sslmode: 'require',
          }
          : false,
      }
      : {
        host: config.database.host,
        port: config.database.port,
        database: config.database.name,
        user: config.database.username,
        password: config.database.password,
      };

    this.pool = new Pool(poolConfig);

    // Test connection
    this.pool.on('connect', () => {
      console.log('Database connected successfully');
    });

    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  query(...args) {
    return this.pool.query(...args);
  }

  end() {
    return this.pool.end();
  }
}

module.exports = DatabasePool;
