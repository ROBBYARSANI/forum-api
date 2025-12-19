const { Pool } = require('pg');
const config = require('../../../Commons/config');

const createPool = () => {
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

  const pool = new Pool(poolConfig);

  // Test connection
  pool.on('connect', () => {
    console.log('Database connected successfully');
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  return pool;
};

module.exports = createPool;
