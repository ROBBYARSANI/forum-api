/* eslint-disable max-classes-per-file */
class DomainError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

class NotFoundError extends DomainError {
  constructor(message) {
    super(message, 404);
  }
}

class AuthorizationError extends DomainError {
  constructor(message) {
    super(message, 403);
  }
}

class ValidationError extends DomainError {
  constructor(message) {
    super(message, 400);
  }
}

module.exports = {
  DomainError,
  NotFoundError,
  AuthorizationError,
  ValidationError,
};
