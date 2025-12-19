# Forum API - Complete Implementation

Forum API adalah REST API untuk forum discussion dengan fitur authentication, threads, comments, replies, dan like/unlike sistem.

## ✨ Features Implemented

### Core Features
- ✅ User Authentication (Login, Register, Refresh Token)
- ✅ Thread Management (Create, Read, Delete)
- ✅ Comments Management (Add, Delete)
- ✅ Replies Management (Add, Delete)
- ✅ Like/Unlike Comments (dengan likeCount display)
- ✅ Rate Limiting (90 req/min untuk /threads)
- ✅ JWT-based Authorization
- ✅ Password Hashing (bcrypt)

### DevOps & Deployment
- ✅ Continuous Integration (GitHub Actions)
  - Unit Tests
  - Integration Tests
  - Functional Tests
  - Linting (ESLint)
  - Code Coverage
- ✅ Continuous Deployment (Railway)
  - Auto-deploy on main branch push
  - PostgreSQL service
  - HTTPS enabled
  - Domain management
- ✅ NGINX Configuration
  - Rate limiting setup
  - Reverse proxy configuration
  - Static asset caching
- ✅ Environment Management
  - .env configuration
  - .env.example template
  - Production ready variables

## 🏗️ Project Structure

```
forum-api/
├── src/
│   ├── Applications/
│   │   ├── security/          # JWT & Password utilities
│   │   └── use_case/          # Business logic
│   ├── Commons/               # Shared utilities & exceptions
│   ├── Core/                  # Base classes for entities & repositories
│   ├── Domains/               # Domain entities & interfaces
│   ├── Infrastructures/       # Database & HTTP setup
│   └── Interfaces/            # API routes & handlers
├── migrations/                # Database migrations
├── tests/                     # Test helpers
├── .github/workflows/
│   ├── ci.yml                 # CI pipeline
│   └── cd.yml                 # CD pipeline
├── nginx.conf                 # NGINX configuration
├── Procfile                   # Railway startup command
├── package.json               # Node.js dependencies
├── .env.example               # Environment variables template
└── README.md                  # This file
```

## 🔧 Tech Stack

- **Runtime**: Node.js 16.x
- **Framework**: Hapi.js v20
- **Database**: PostgreSQL 13
- **Authentication**: JWT + @hapi/jwt
- **Password**: bcrypt
- **Testing**: Jest
- **Linting**: ESLint (airbnb-base)
- **DevOps**: GitHub Actions
- **Deployment**: Railway
- **Reverse Proxy**: NGINX

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env dengan database credentials lokal
```

### 3. Setup Database
```bash
# Create PostgreSQL database
createdb forumapi_development
createdb forumapi_test

# Run migrations
npm run migrate
npm run migrate:test
```

### 4. Run Application
```bash
# Development with auto-reload
npm run start:dev

# Production
npm start
```

### 5. Run Tests
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Specific test pattern
npm test -- --testPathPattern=unit
```

### 6. Linting
```bash
# Check code quality
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📚 API Endpoints

### Authentication
```
POST   /authentications              Create new authentication (login)
DELETE /authentications              Delete authentication (logout)
PUT    /authentications              Refresh access token
```

### Users
```
POST   /users                        Register new user
```

### Threads
```
GET    /threads                      Get all threads
POST   /threads                      Create new thread (authenticated)
GET    /threads/{threadId}           Get thread detail with comments & replies
DELETE /threads/{threadId}           Delete thread (authenticated, own only)
```

### Comments
```
POST   /threads/{threadId}/comments              Add comment (authenticated)
DELETE /threads/{threadId}/comments/{commentId}  Delete comment (authenticated, own only)
```

### Replies
```
POST   /threads/{threadId}/comments/{commentId}/replies              Add reply (authenticated)
DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}    Delete reply (authenticated, own only)
```

### Likes
```
PUT    /threads/{threadId}/comments/{commentId}/likes   Like/Unlike comment (authenticated)
```

### Health Check
```
GET    /health                       Check API health status
```

## 🔐 Authentication

### Login
```bash
curl -X POST http://localhost:5000/authentications \
  -H "Content-Type: application/json" \
  -d '{
    "username": "dicoding",
    "password": "secretpassword"
  }'
```

Response:
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### Protected Requests
```bash
curl -X POST http://localhost:5000/threads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{
    "title": "Thread Title",
    "body": "Thread body content"
  }'
```

## 📊 Rate Limiting

- **Endpoint**: `/threads` dan sub-paths
- **Limit**: 90 requests per minute per IP address
- **Burst**: 10 additional requests allowed
- **Response**: 429 Too Many Requests ketika exceeded

Testing:
```bash
# Send 100 requests in rapid succession
for i in {1..100}; do
  curl http://localhost:5000/threads
done
# After 90+ 10 requests = 429 status
```

## 🗄️ Database Schema

### Tables
- `users` - User accounts
- `authentications` - Token management
- `threads` - Forum discussions
- `comments` - Comments on threads
- `replies` - Replies to comments
- `likes` - Like records for comments

See `migrations/` folder untuk schema detail.

## 🧪 Testing Strategy

### Unit Tests
- Test individual functions dan methods
- Mock external dependencies
- Located in `_test/` folders

### Integration Tests
- Test database interactions
- Test repository layer
- Use test database (forumapi_test)

### Functional Tests
- End-to-end API testing
- Test complete request-response cycle
- Test error handling

### Running Tests
```bash
# All tests
npm test

# Unit tests only
npm test -- --testPathPattern=unit

# Integration tests only
npm test -- --testPathPattern=integration

# Functional tests only
npm test -- --testPathPattern=functional

# With coverage report
npm test -- --coverage

# Watch changes
npm run test:watch
```

## 📈 CI/CD Pipeline

### GitHub Actions - Continuous Integration
**Trigger**: Pull Request ke main/master

**Steps**:
1. Checkout code
2. Setup Node.js 16
3. Install dependencies
4. Run ESLint
5. Run unit tests
6. Run integration tests (with PostgreSQL service)
7. Run functional tests
8. Upload coverage report

**Status**: 
- ✅ Success - all tests & linting pass
- ❌ Failure - any test fails atau linting error

### GitHub Actions - Continuous Deployment
**Trigger**: Push ke main/master branch

**Steps**:
1. Checkout code
2. Setup Node.js 16
3. Install dependencies
4. Run all tests
5. Deploy ke Railway (jika tests pass)

**Status**:
- ✅ Success - deployed to production
- ❌ Failure - tests failed, no deployment

## 🚄 Deployment ke Railway

### Prerequisites
- GitHub account dengan forum-api repository
- Railway account (https://railway.app)
- Git CLI

### Quick Setup (lihat detailed guide)
Refer ke `RAILWAY_SETUP_STEP_BY_STEP.md` untuk lengkap step-by-step guide.

**Quick version**:
1. Create Railway project linked ke GitHub
2. Add PostgreSQL service
3. Setup environment variables
4. Generate Railway token
5. Add `RAILWAY_TOKEN` ke GitHub Secrets
6. Push code ke main/master → auto-deploy

### Environment Variables (Railway)
```
HOST=0.0.0.0
PORT=3000
NODE_ENV=production
ACCESS_TOKEN_KEY=<your-key>
ACCESS_TOKEN_AGE=1800000
REFRESH_TOKEN_KEY=<your-key>
REFRESH_TOKEN_AGE=86400000
PGHOST=<auto-from-postgres-service>
PGPORT=<auto-from-postgres-service>
PGUSER=<auto-from-postgres-service>
PGPASSWORD=<auto-from-postgres-service>
PGDATABASE=<auto-from-postgres-service>
```

## 🌐 HTTPS & Domain

### Railway Auto HTTPS
- Railway otomatis provides HTTPS untuk semua deployments
- URL format: `https://your-app.up.railway.app`
- SSL certificate automatically managed

### Custom Domain
1. Railway → Domain management
2. Add custom domain (misal: api.yourdomain.com)
3. Update DNS records di registrar
4. HTTPS automatically provisioned via Let's Encrypt

### dcdg.xyz Subdomain
- Request ke administrator untuk subdomain allocation
- Setup seperti custom domain
- URL: `https://your-api.dcdg.xyz`

## 🧹 Code Quality

### ESLint Configuration
- Base: airbnb-base
- Enforces consistent code style
- Auto-fixable with `npm run lint:fix`

### Testing Coverage
- Target: >80% code coverage
- Check: `npm test -- --coverage`
- Coverage report in `coverage/lcov-report/index.html`

## 🔒 Security Features

- ✅ Password hashing dengan bcrypt
- ✅ JWT token-based authentication
- ✅ Authorization checks (ownership verification)
- ✅ Rate limiting to prevent abuse
- ✅ HTTPS encryption in transit
- ✅ Input validation
- ✅ Error handling tanpa sensitive info leakage

## 📝 Configuration Files

### .env (Development)
```dotenv
HOST=localhost
PORT=5000
NODE_ENV=development
PGHOST=localhost
PGPORT=5432
PGDATABASE=forumapi_development
PGUSER=postgres
PGPASSWORD=password
ACCESS_TOKEN_KEY=your-secret-key
ACCESS_TOKEN_AGE=1800000
REFRESH_TOKEN_KEY=your-secret-key
REFRESH_TOKEN_AGE=86400000
```

### .env.example
Template untuk environment variables. Copy ke `.env` dan sesuaikan.

### nginx.conf
Konfigurasi reverse proxy & rate limiting untuk local development.

### Procfile
Start command untuk Railway deployment.

### railway.json
Railway-specific configuration.

### .github/workflows/ci.yml
GitHub Actions CI pipeline configuration.

### .github/workflows/cd.yml
GitHub Actions CD pipeline configuration untuk Railway deployment.

## 🚨 Troubleshooting

### Database Connection Error
- Verify PostgreSQL running
- Check PGHOST, PGPORT, PGUSER, PGPASSWORD
- Ensure database created

### Test Failures
- Check Node.js version (16.x recommended)
- Clear npm cache: `npm cache clean --force`
- Reinstall: `rm -rf node_modules && npm install`

### Deployment Fails
- Check GitHub Actions logs
- Verify RAILWAY_TOKEN is set
- Check Railway logs in dashboard
- Ensure tests passing locally

### Rate Limiting Not Working
- Verify NGINX running: `sudo systemctl status nginx`
- Check nginx.conf syntax: `sudo nginx -t`
- Restart NGINX: `sudo systemctl restart nginx`

## 📚 Documentation Files

- `README.md` - This file, project overview
- `RAILWAY_SETUP_STEP_BY_STEP.md` - Detailed Railway deployment guide
- `RAILWAY_DEPLOYMENT_GUIDE.md` - Comprehensive deployment documentation
- `.env.example` - Environment variables template
- `nginx.conf` - NGINX configuration with comments

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "feat: your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Create Pull Request
5. GitHub Actions CI will run automatically
6. After approval, merge to main
7. CD will auto-deploy

## 📦 Dependencies

Key dependencies:
- `@hapi/hapi` - Web framework
- `@hapi/jwt` - JWT authentication
- `pg` - PostgreSQL client
- `bcrypt` - Password hashing
- `nanoid` - ID generation
- `dotenv` - Environment management
- `jest` - Testing framework
- `eslint` - Code linting

See `package.json` untuk complete list.

## 📄 License

ISC License

## 👤 Author

ROBBY ARSANI

## 🔗 Links

- GitHub: https://github.com/ROBBYARSANI/forum-api
- Railway: https://railway.app
- Live API: [Your deployment URL]
- Postman Collection: [Link to collection]

## ⚡ Performance Tips

1. **Indexing**: Database columns are indexed for queries
2. **Pagination**: Implement pagination untuk large datasets
3. **Caching**: Consider Redis untuk session/cache layer
4. **CDN**: Use CDN untuk static assets (jika ada)
5. **Monitoring**: Monitor Railway metrics regularly

## 🎯 Next Steps

1. Deploy ke Railway ✓
2. Test dengan Postman ✓
3. Monitor aplikasi via Railway dashboard
4. Setup domain dengan HTTPS
5. Implement additional features sesuai requirement
6. Setup monitoring & alerts
7. Regular backups PostgreSQL

---

**Created**: December 2024  
**Last Updated**: December 19, 2024  
**Status**: Production Ready ✅

