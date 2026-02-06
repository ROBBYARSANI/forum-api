const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const ClientError = require('../../Commons/exceptions/ClientError');
const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');
const RateLimiter = require('./RateLimiter');
const users = require('../../Interfaces/http/api/users');
const authentications = require('../../Interfaces/http/api/authentications');
const threads = require('../../Interfaces/http/api/threads');
const comments = require('../../Interfaces/http/api/comments');
const replies = require('../../Interfaces/http/api/replies');
const likes = require('../../Interfaces/http/api/likes');
const health = require('../../Interfaces/http/api/health');
const status = require('../../Interfaces/http/api/status');
const serverInfo = require('../../Interfaces/http/api/serverInfo/routes');

const createServer = async (container) => {
  const server = Hapi.server({
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || 8080,
  });

  // Initialize rate limiter
  const rateLimiter = new RateLimiter();

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('forum_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  // Register rate limiter extension for /threads endpoints
  server.ext('onRequest', rateLimiter.createHapiHandler());

  // Add rate limit headers to all /threads responses
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    // Only add headers for /threads endpoints using strict regex
    if (/^\/threads(\/|$)/.test(request.path) && request.plugins.rateLimiter) {
      const { limit, remaining, reset } = request.plugins.rateLimiter;

      // Add headers to both successful and error responses
      if (response.isBoom) {
        response.output.headers['X-RateLimit-Limit'] = limit;
        response.output.headers['X-RateLimit-Remaining'] = remaining;
        response.output.headers['X-RateLimit-Reset'] = reset;
      } else if (typeof response.header === 'function') {
        response.header('X-RateLimit-Limit', limit);
        response.header('X-RateLimit-Remaining', remaining);
        response.header('X-RateLimit-Reset', reset);
      }
    }

    return h.continue;
  });

  await server.register([
    {
      plugin: users,
      options: { container },
    },
    {
      plugin: authentications,
      options: { container },
    },
    {
      plugin: threads,
      options: { container },
    },
    {
      plugin: comments,
      options: { container },
    },
    {
      plugin: replies,
      options: { container },
    },
    {
      plugin: likes,
      options: { container },
    },
    {
      plugin: health,
      options: { container },
    },
    {
      plugin: status,
      options: { container },
    },
  ]);

  // Register server info routes (static, no container needed)
  serverInfo(server);

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;

    if (response instanceof Error) {
      // Log error untuk debugging
      console.error('Server error:', {
        message: response.message,
        stack: response.stack,
        path: request.path,
        method: request.method,
      });

      // bila response tersebut error, tangani sesuai kebutuhan
      const translatedError = DomainErrorTranslator.translate(response);

      // penanganan client error secara internal.
      if (translatedError instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: translatedError.message,
        });
        newResponse.code(translatedError.statusCode);
        return newResponse;
      }

      // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
      if (!translatedError.isServer) {
        return h.continue;
      }

      // penanganan server error sesuai kebutuhan
      console.error('[SERVER ERROR]', {
        message: translatedError.message,
        stack: translatedError.stack,
        path: request.path,
        method: request.method,
      });

      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue;
  });

  return server;
};

module.exports = createServer;
