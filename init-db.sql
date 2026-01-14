-- Drop existing tables if they exist (for clean reset)
DROP TABLE IF EXISTS user_comment_likes;
DROP TABLE IF EXISTS replies;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS threads;
DROP TABLE IF EXISTS authentications;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  fullname TEXT NOT NULL
);

-- Create authentications table
CREATE TABLE IF NOT EXISTS authentications (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL UNIQUE
);

-- Create threads table
CREATE TABLE IF NOT EXISTS threads (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  owner VARCHAR(50) NOT NULL,
  date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id VARCHAR(50) PRIMARY KEY,
  content TEXT NOT NULL,
  owner VARCHAR(50) NOT NULL,
  thread VARCHAR(50) NOT NULL,
  date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_delete BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (thread) REFERENCES threads(id) ON DELETE CASCADE
);

-- Create replies table
CREATE TABLE IF NOT EXISTS replies (
  id VARCHAR(50) PRIMARY KEY,
  content TEXT NOT NULL,
  owner VARCHAR(50) NOT NULL,
  comment VARCHAR(50) NOT NULL,
  date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_delete BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (comment) REFERENCES comments(id) ON DELETE CASCADE
);

-- Create user_comment_likes table
CREATE TABLE IF NOT EXISTS user_comment_likes (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  comment_id VARCHAR(50) NOT NULL,
  date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  UNIQUE(user_id, comment_id)
);

-- Create pgmigrations table if not exists (for node-pg-migrate)
CREATE TABLE IF NOT EXISTS pgmigrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  run_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name)
);
