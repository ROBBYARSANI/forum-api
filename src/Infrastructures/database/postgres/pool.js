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
  // Railway uses DATABASE_URL - handle incomplete connection strings
  const dbUrl = process.env.DATABASE_URL;

  // If DATABASE_URL is incomplete (missing username), construct proper connection
  if (dbUrl.startsWith('postgresql://:') || dbUrl.includes('postgresql://@/')) {
    // Use Railway internal defaults
    pool = new Pool({
      host: 'postgres.railway.internal',
      port: 5432,
      user: 'postgres', // Railway default
      password: dbUrl.split(':')[2]?.split('@')[0] || 'password', // Extract password
      database: 'railway', // Railway default database
      ssl: { rejectUnauthorized: false },
    });
  } else {
    // Use standard DATABASE_URL parsing
    pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
    });
  }
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
