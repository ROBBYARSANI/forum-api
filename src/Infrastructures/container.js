const { createContainer } = require('instances-container');

// external agency
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const Jwt = require('@hapi/jwt');
const pool = require('./database/postgres/pool');

// service (repository, helper, cache, etc)
const UserRepositoryPostgres = require('./repository/UserRepositoryPostgres');
const AuthenticationRepositoryPostgres = require('./repository/AuthenticationRepositoryPostgres');
const ThreadRepositoryPostgres = require('./repository/ThreadRepositoryPostgres');
const CommentRepositoryPostgres = require('./repository/CommentRepositoryPostgres');
const ReplyRepositoryPostgres = require('./repository/ReplyRepositoryPostgres');
const LikeRepositoryPostgres = require('./repository/LikeRepositoryPostgres');

const BcryptPasswordHash = require('./security/BcryptPasswordHash');
const JwtTokenManager = require('./security/JwtTokenManager');

// use case
const AddUserUseCase = require('../Applications/use_case/AddUserUseCase');
const LoginUserUseCase = require('../Applications/use_case/LoginUserUseCase');
const LogoutUserUseCase = require('../Applications/use_case/LogoutUserUseCase');
const RefreshAuthenticationUseCase = require('../Applications/use_case/RefreshAuthenticationUseCase');
const AddThreadUseCase = require('../Applications/use_case/AddThreadUseCase');
const GetThreadUseCase = require('../Applications/use_case/GetThreadUseCase');
const AddCommentUseCase = require('../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../Applications/use_case/DeleteCommentUseCase');
const AddReplyUseCase = require('../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../Applications/use_case/DeleteReplyUseCase');
const LikeUnlikeUseCase = require('../Applications/use_case/LikeUnlikeUseCase');

// creating container
const container = createContainer();

// registering services and repository
container.register([
  {
    key: 'pool',
    Class: pool,
  },
  {
    key: 'nanoid',
    Class: nanoid,
  },
  {
    key: 'bcrypt',
    Class: bcrypt,
  },
  {
    key: 'jwt',
    Class: Jwt,
  },
  {
    key: 'UserRepository',
    Class: UserRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
      ],
    },
  },
  {
    key: 'AuthenticationRepository',
    Class: AuthenticationRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
      ],
    },
  },
  {
    key: 'ThreadRepository',
    Class: ThreadRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
        {
          concrete: nanoid,
        },
      ],
    },
  },
  {
    key: 'CommentRepository',
    Class: CommentRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
        {
          concrete: nanoid,
        },
      ],
    },
  },
  {
    key: 'ReplyRepository',
    Class: ReplyRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
        {
          concrete: nanoid,
        },
      ],
    },
  },
  {
    key: 'LikeRepository',
    Class: LikeRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
        {
          concrete: nanoid,
        },
      ],
    },
  },
  {
    key: 'PasswordHash',
    Class: BcryptPasswordHash,
    parameter: {
      dependencies: [
        {
          concrete: bcrypt,
        },
      ],
    },
  },
  {
    key: 'AuthenticationTokenManager',
    Class: JwtTokenManager,
    parameter: {
      dependencies: [
        {
          concrete: Jwt,
        },
      ],
    },
  },
]);

// registering use cases
container.register([
  {
    key: AddUserUseCase.name,
    Class: AddUserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'userRepository',
          internal: 'UserRepository',
        },
        {
          name: 'passwordHash',
          internal: 'PasswordHash',
        },
      ],
    },
  },
  {
    key: LoginUserUseCase.name,
    Class: LoginUserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'userRepository',
          internal: 'UserRepository',
        },
        {
          name: 'authenticationRepository',
          internal: 'AuthenticationRepository',
        },
        {
          name: 'authenticationTokenManager',
          internal: 'AuthenticationTokenManager',
        },
        {
          name: 'passwordHash',
          internal: 'PasswordHash',
        },
      ],
    },
  },
  {
    key: LogoutUserUseCase.name,
    Class: LogoutUserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'authenticationRepository',
          internal: 'AuthenticationRepository',
        },
      ],
    },
  },
  {
    key: RefreshAuthenticationUseCase.name,
    Class: RefreshAuthenticationUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'authenticationRepository',
          internal: 'AuthenticationRepository',
        },
        {
          name: 'authenticationTokenManager',
          internal: 'AuthenticationTokenManager',
        },
      ],
    },
  },
  {
    key: AddThreadUseCase.name,
    Class: AddThreadUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: 'ThreadRepository',
        },
      ],
    },
  },
  {
    key: GetThreadUseCase.name,
    Class: GetThreadUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: 'ThreadRepository',
        },
        {
          name: 'commentRepository',
          internal: 'CommentRepository',
        },
        {
          name: 'replyRepository',
          internal: 'ReplyRepository',
        },
        {
          name: 'likeRepository',
          internal: 'LikeRepository',
        },
      ],
    },
  },
  {
    key: AddCommentUseCase.name,
    Class: AddCommentUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: 'ThreadRepository',
        },
        {
          name: 'commentRepository',
          internal: 'CommentRepository',
        },
      ],
    },
  },
  {
    key: DeleteCommentUseCase.name,
    Class: DeleteCommentUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: 'ThreadRepository',
        },
        {
          name: 'commentRepository',
          internal: 'CommentRepository',
        },
      ],
    },
  },
  {
    key: AddReplyUseCase.name,
    Class: AddReplyUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: 'ThreadRepository',
        },
        {
          name: 'commentRepository',
          internal: 'CommentRepository',
        },
        {
          name: 'replyRepository',
          internal: 'ReplyRepository',
        },
      ],
    },
  },
  {
    key: DeleteReplyUseCase.name,
    Class: DeleteReplyUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: 'ThreadRepository',
        },
        {
          name: 'commentRepository',
          internal: 'CommentRepository',
        },
        {
          name: 'replyRepository',
          internal: 'ReplyRepository',
        },
      ],
    },
  },
  {
    key: LikeUnlikeUseCase.name,
    Class: LikeUnlikeUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: 'ThreadRepository',
        },
        {
          name: 'commentRepository',
          internal: 'CommentRepository',
        },
        {
          name: 'likeRepository',
          internal: 'LikeRepository',
        },
      ],
    },
  },
]);

module.exports = container;
