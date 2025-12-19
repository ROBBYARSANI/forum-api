require('dotenv').config();

module.exports = {
  app: {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 5000,
  },
  database: {
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    name: process.env.PGDATABASE || 'forumapi',
    username: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'password',
  },
  jwt: {
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    accessTokenAge: process.env.ACCESS_TOKEN_AGE,
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
    refreshTokenAge: process.env.REFRESH_TOKEN_AGE,
  },
};
