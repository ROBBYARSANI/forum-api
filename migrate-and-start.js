#!/usr/bin/env node
/* istanbul ignore file */

require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

/**
 * Run migrations before starting the application
 * This ensures database schema is up-to-date in production
 */

console.log('[MIGRATION] Starting database migrations...');

const migrateProcess = spawn('node-pg-migrate', ['up'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    // Use standard DATABASE_URL if available (Railway)
    // or fall back to test config for local dev
  },
});

migrateProcess.on('close', (code) => {
  if (code === 0 || code === null) {
    // Code 0 = success, null = no migrations needed
    console.log('[MIGRATION] Migrations completed successfully. Starting application...');
    
    // Now start the application
    require('./src/app.js');
  } else {
    console.error(`[MIGRATION] Migration failed with exit code ${code}`);
    // Still try to start app - it might work even without migrations
    console.log('[MIGRATION] Attempting to start application anyway...');
    require('./src/app.js');
  }
});

migrateProcess.on('error', (err) => {
  console.error('[MIGRATION] Migration process error:', err.message);
  console.log('[MIGRATION] Attempting to start application anyway...');
  require('./src/app.js');
});
