# Testing Guide

## Local Testing

Sebelum push ke GitHub, jalankan tests lokal untuk memastikan semuanya working:

```bash
npm test
```

Expected output:
```
Test Suites: 57 passed, 57 total
Tests:       207 passed, 207 total
```

## GitHub Actions CI/CD

GitHub Actions workflow melakukan:
1. ✅ Checkout code
2. ✅ Install dependencies
3. ✅ Verify application structure
4. ✅ Lint check
5. ✅ Build Docker image
6. ✅ Deploy to Railway (if RAILWAY_TOKEN configured)
7. ✅ Health checks dan smoke tests

**Note:** Tests dijalankan secara lokal karena membutuhkan database PostgreSQL yang dikonfigurasi. 

## Running Tests Locally

### Prerequisites

Pastikan Anda sudah setup:
1. Node.js 18.x
2. PostgreSQL (local atau Docker)
3. Environment variables di `.env.test`

### Setup Database

```bash
# Install dependencies
npm install

# Setup test database
npm run migrate:test

# Run tests
npm test
```

### Test Coverage

```bash
npm run test:watch
```

## CI/CD Workflow

Setiap push ke `master` branch akan:
1. Trigger GitHub Actions
2. Install dan verify aplikasi
3. Build Docker image
4. Deploy ke Railway (jika secrets configured)
5. Run health checks

## Manual Deployment

Jika ingin deploy manual tanpa GitHub Actions:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

## Troubleshooting

### Tests gagal lokal
- Pastikan PostgreSQL running
- Check `.env.test` file exist dan benar
- Run `npm run migrate:test`

### Deployment gagal
- Check RAILWAY_TOKEN di GitHub Secrets
- Lihat logs di Railway dashboard
- Pastikan Dockerfile dan railway.json valid

### Docker build gagal
```bash
docker build -t forum-api .
```

Periksa error message untuk details.
