#!/usr/bin/env node
/* istanbul ignore file */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

/**
 * Initialize database tables if they don't exist
 * Run once before starting the application
 */

async function initializeDatabase() {
  console.log('[DB_INIT] Checking and initializing database...');

  // Create pool directly with DATABASE_URL
  let pool;
  
  if (process.env.DATABASE_URL) {
    const dbUrl = process.env.DATABASE_URL;
    
    // Handle Railway's incomplete DATABASE_URL
    if (dbUrl.startsWith('postgresql://:')) {
      const passwordMatch = dbUrl.match(/postgresql:\/\/:([^@]+)@/);
      const password = passwordMatch ? passwordMatch[1] : 'password';

      pool = new Pool({
        host: 'postgres.railway.internal',
        port: 5432,
        user: 'postgres',
        password: password,
        database: 'railway',
        ssl: { rejectUnauthorized: false },
      });
    } else {
      pool = new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false },
      });
    }
  } else {
    pool = new Pool({
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT || 5432,
      user: process.env.PGUSER || 'developer',
      password: process.env.PGPASSWORD || 'myfirst',
      database: process.env.PGDATABASE || 'forumapi',
    });
  }

  try {
    const client = await pool.connect();
    
    try {
      // Read and execute SQL initialization file
      const initSqlPath = path.join(__dirname, 'init-db.sql');
      const initSql = fs.readFileSync(initSqlPath, 'utf-8');
      
      console.log('[DB_INIT] Executing initialization SQL...');
      await client.query(initSql);
      console.log('[DB_INIT] SQL executed successfully');
      
      console.log('[DB_INIT] Database initialized successfully');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[DB_INIT] Error initializing database:', err.message);
    console.error('[DB_INIT] Error details:', err);
    // Don't fail startup, database might already be initialized
  } finally {
    await pool.end();
  }
}

// Initialize database then start app
initializeDatabase().then(() => {
  console.log('[DB_INIT] Starting application...');
  require('./src/app.js');
}).catch((err) => {
  console.error('[DB_INIT] Fatal error:', err);
  process.exit(1);
});
