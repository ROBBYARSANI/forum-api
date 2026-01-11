# Forum API - Production Ready

A comprehensive forum API built with Node.js, Hapi.js, PostgreSQL, and deployed on Railway with complete CI/CD pipeline.

## 🚀 Production Deployment

- **Live URL**: https://your-railway-project-name.up.railway.app
- **Platform**: Railway Cloud
- **Database**: PostgreSQL (managed)
- **SSL**: Automatic Let's Encrypt certificate

## ✅ CI/CD Pipeline

### Continuous Integration
- **Platform**: GitHub Actions
- **Trigger**: Pull request to `master` branch
- **Jobs**:
  - Test job: PostgreSQL + Jest testing ✅
  - Fail scenario: Demonstrates CI error handling ❌
- **Node.js**: Version 18.x with npm caching

### Continuous Deployment
- **Platform**: Railway
- **Trigger**: Push to `master` branch
- **Method**: Docker container deployment
- **Build**: Node.js 18 Alpine image
- **SSL**: Automatic certificate provisioning

## 🔧 Tech Stack

- **Runtime**: Node.js 18
- **Framework**: Hapi.js
- **Database**: PostgreSQL
- **Authentication**: JWT (Access + Refresh tokens)
- **Container**: Docker
- **Deployment**: Railway Cloud
- **Testing**: Jest
- **Rate Limiting**: hapi-rate-limiter

## 📊 API Endpoints

### Health & Monitoring
- `GET /health` - Application health check
- `GET /status` - System monitoring (uptime, memory, system info)

### Authentication
- `POST /users` - User registration
- `POST /authentications` - Login & get JWT tokens

### Threads (Rate Limited)
- `POST /threads` - Create discussion thread (90 req/min limit)
- `GET /threads` - List all threads
- `GET /threads/{threadId}` - Get thread details with comments
- `POST /threads/{threadId}/comments` - Add comment to thread
- `POST /threads/{threadId}/replies` - Add reply to comment

## 🧪 Testing

### Run Tests Locally
```bash
# Install dependencies
npm ci

# Run migrations
npm run migrate up

# Run tests
npm test

# Run tests with coverage
npm run test:watch
```

### CI/CD Testing
- **Unit Tests**: Jest framework (195+ tests)
- **Integration Tests**: PostgreSQL database testing
- **API Tests**: Endpoint validation with authentication
- **Rate Limiting Tests**: 90 req/min enforcement verification

## 🚦 Rate Limiting

- **Limit**: 90 requests per minute
- **Scope**: `/threads` endpoint and sub-routes
- **Implementation**: hapi-rate-limiter middleware
- **Response**: HTTP 429 (Too Many Requests) when exceeded

## 🔒 Security Features

- JWT authentication with secure token handling
- Password hashing with bcrypt
- Rate limiting protection
- CORS configuration
- Input validation with Joi
- SQL injection prevention

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   GitHub Actions │    │     Railway     │
│    CI Pipeline   │────│   CD Platform  │
│ • 2 Test Jobs    │    │ • Auto-deploy  │
│ • PostgreSQL     │    │ • Docker Build │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Forum API     │    │   PostgreSQL    │
│ • REST API      │    │ • Production DB │
│ • JWT Auth      │    │ • Railway Hosted│
│ • Rate Limiting │    │ • Auto-backup   │
│ • Health Checks │    │                 │
└─────────────────┘    └─────────────────┘
```

## 📋 Requirements Implementation

- ✅ **Continuous Integration**: GitHub Actions with 2 jobs
- ✅ **Continuous Deployment**: Railway auto-deploy
- ✅ **Rate Limiting**: 90 req/min on `/threads`
- ✅ **HTTPS Protocol**: SSL certificate from Railway

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Git

### Installation
```bash
# Clone repository
git clone https://github.com/ROBBYARSANI/forum-api.git
cd forum-api-main

# Install dependencies
npm ci

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Run migrations
npm run migrate up

# Start development server
npm run start:dev

# API will be available at http://localhost:5000
```

### Docker Deployment
```bash
# Build Docker image
docker build -t forum-api .

# Run container
docker run -p 5000:5000 forum-api
```

## 📈 Monitoring

### Health Checks
- **Endpoint**: `/health`
- **Response**: `{"status":"ok","message":"Forum API is healthy"}`

### System Status
- **Endpoint**: `/status`
- **Response**: System information (uptime, memory, etc.)

### Railway Dashboard
- **Deployments**: Monitor deployment status
- **Logs**: Real-time application logs
- **Metrics**: Resource usage monitoring

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Pull Request Process
- All PRs require CI checks to pass
- Code review required before merge
- Auto-deployment to Railway on merge to master

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🎯 Project Status

✅ **COMPLETED**: Production-ready forum API with complete CI/CD pipeline, security features, and comprehensive testing.

- **CI/CD Pipeline**: ✅ Implemented
- **Production Deployment**: ✅ Active
- **Security Features**: ✅ Enabled
- **API Documentation**: ✅ Complete
- **Testing Coverage**: ✅ Comprehensive
