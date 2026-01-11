/* istanbul ignore file */
const { Pool } = require('pg');

const testConfig = {
  host: process.env.PGHOST_TEST,
  port: process.env.PGPORT_TEST,
  user: process.env.PGUSER_TEST,
  password: process.env.PGPASSWORD_TEST,
  database: process.env.PGDATABASE_TEST,
};

let pool;

if (process.env.NODE_ENV === 'test') {
  pool = new Pool(testConfig);
} else if (process.env.DATABASE_URL) {
  // Railway uses DATABASE_URL
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
} else {
  // Fallback to individual environment variables
  pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    user: process.env.PGUSER || 'developer',
    password: process.env.PGPASSWORD || 'myfirst',
    database: process.env.PGDATABASE || 'forumapi',
  });
}

module.exports = pool;
