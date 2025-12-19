# Forum API - Railway Deployment Guide

## Overview
Panduan lengkap untuk deployment Forum API ke Railway dengan CI/CD menggunakan GitHub Actions.

## Prerequisites
- GitHub Account dengan repository yang sudah ter-setup
- Railway Account (https://railway.app)
- Domain atau menggunakan domain bawaan Railway
- Git CLI

## Step 1: Setup Railway Account & Project

### 1.1 Buat Akun Railway
1. Kunjungi https://railway.app
2. Sign up menggunakan GitHub account
3. Authorize Railway untuk akses repository Anda

### 1.2 Buat Project di Railway
1. Di dashboard Railway, klik "New Project"
2. Pilih "Deploy from GitHub repo"
3. Authorize railway-app untuk akses GitHub Anda
4. Pilih repository `forum-api`
5. Klik "Deploy Now"

## Step 2: Setup PostgreSQL Service di Railway

### 2.1 Tambahkan PostgreSQL
1. Di project Railway, klik "Add Service"
2. Pilih "Database" → "PostgreSQL"
3. Klik "Create"
4. Railway akan otomatis membuat instance PostgreSQL

### 2.2 Catat Connection String
1. Buka service PostgreSQL
2. Catat credentials:
   - Host
   - Port
   - Username
   - Password
   - Database

Atau Anda bisa langsung lihat environment variables yang auto-generate.

## Step 3: Setup Railway Environment Variables

### 3.1 Konfigurasi di Railway Dashboard
1. Buka service Node.js (Forum API) Anda
2. Pergi ke tab "Variables"
3. Tambahkan environment variables:

```
HOST=0.0.0.0
PORT=3000
NODE_ENV=production

# PostgreSQL Connection (dari service PostgreSQL)
PGHOST=${{Postgres.PGHOST}}
PGPORT=${{Postgres.PGPORT}}
PGUSER=${{Postgres.PGUSER}}
PGPASSWORD=${{Postgres.PGPASSWORD}}
PGDATABASE=${{Postgres.PGDATABASE}}

# JWT Secret Keys (gunakan nilai yang sama seperti di .env)
ACCESS_TOKEN_KEY=4e8ad93c6fd129818b80b51885c4d30f589ee97d646955f8cf8b6fd2a663703c
ACCESS_TOKEN_AGE=1800000
REFRESH_TOKEN_KEY=a29027ddcdaccf30d4dbfe0cb77d4cf58f4a954a5eae91d163c985d7dac2a0ce
REFRESH_TOKEN_AGE=86400000
```

### 3.2 Alternatif: Menggunakan Railway CLI
Jika Anda prefer menggunakan CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login ke Railway
railway login

# Link ke project
railway link

# Set variables
railway variables set HOST=0.0.0.0 PORT=3000 NODE_ENV=production
```

## Step 4: Setup GitHub Actions untuk CD

### 4.1 Generate Railway Token
1. Login ke Railway (https://railway.app)
2. Pergi ke Account Settings (klik profile di sudut kanan atas)
3. Cari "API Tokens" atau "Tokens"
4. Klik "Create New Token"
5. Copy token tersebut

### 4.2 Setup GitHub Secret
1. Buka repository GitHub
2. Pergi ke Settings → Secrets and variables → Actions
3. Klik "New repository secret"
4. Name: `RAILWAY_TOKEN`
5. Value: Paste token dari step 4.1
6. Klik "Add secret"

### 4.3 Update CD Workflow File
File `.github/workflows/cd.yml` sudah ter-setup. Berikut adalah konfigurasi yang direkomendasikan:

```yaml
name: Continuous Deployment

on:
  push:
    branches: [ main, master ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test -- --coverage=false
      env:
        NODE_ENV: test
        PGHOST: postgres
        PGPORT: 5432
        PGUSER: postgres
        PGPASSWORD: postgres
        PGDATABASE: postgres

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: success()
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
    
    - name: Install Railway CLI
      run: npm i -g @railway/cli
    
    - name: Deploy to Railway
      run: railway up --detach
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## Step 5: Setup Domain dan HTTPS

### 5.1 Menggunakan Domain Railway Bawaan
1. Di Railway, buka service Node.js
2. Cari "Domains"
3. Klik "Generate Domain"
4. Railway akan memberikan URL seperti: `https://your-api.up.railway.app`
5. URL ini sudah otomatis HTTPS-enabled ✓

### 5.2 Menggunakan Custom Domain
Jika ingin menggunakan custom domain:

1. Di Railway, tab "Domains"
2. Klik "Add custom domain"
3. Masukkan domain Anda (misal: `api.yourdomain.com`)
4. Railway akan memberikan instruksi DNS
5. Update DNS records di registrar domain Anda
6. Tunggu hingga propagasi DNS selesai (bisa 24 jam)

### 5.3 Menggunakan Subdomain dcdg.xyz
1. Request subdomain ke dcdg.xyz (bisa via administrator/owner)
2. Setup seperti custom domain di atas
3. URL akan menjadi: `https://your-api.dcdg.xyz`

## Step 6: Database Migration

### 6.1 Manual Migration (First Time Setup)
Setelah PostgreSQL service di Railway sudah berjalan:

```bash
# Install dependencies
npm install

# Run migration
npm run migrate
```

### 6.2 Automasi Migration di CD
Anda bisa menambahkan migration step di GitHub Actions:

```yaml
- name: Run database migrations
  run: npm run migrate
  env:
    PGHOST: ${{ secrets.PGHOST }}
    PGPORT: ${{ secrets.PGPORT }}
    PGUSER: ${{ secrets.PGUSER }}
    PGPASSWORD: ${{ secrets.PGPASSWORD }}
    PGDATABASE: ${{ secrets.PGDATABASE }}
```

## Step 7: Configure NGINX (Optional - Local Development)

Untuk local development dengan NGINX untuk testing rate limiting:

```bash
# Install NGINX
sudo apt-get install nginx

# Copy config
sudo cp nginx.conf /etc/nginx/sites-available/forum-api

# Enable
sudo ln -s /etc/nginx/sites-available/forum-api /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Start NGINX
sudo systemctl start nginx
sudo systemctl enable nginx
```

Catatan: Railway sudah handle HTTPS dan reverse proxy secara otomatis, jadi NGINX hanya diperlukan untuk local development.

## Step 8: Verify Deployment

### 8.1 Check Rails Logs
1. Di Railway dashboard, buka service Node.js
2. Klik tab "Logs"
3. Verifikasi aplikasi start tanpa error

### 8.2 Test Endpoints
```bash
# Health check
curl https://your-api.up.railway.app/health

# Create user
curl -X POST https://your-api.up.railway.app/users \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password","fullname":"Test User"}'

# Login
curl -X POST https://your-api.up.railway.app/authentications \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password"}'
```

### 8.3 Postman Testing
1. Import collection di Postman
2. Setup environment dengan base URL: `https://your-api.up.railway.app`
3. Jalankan test suite
4. Semua endpoint harus return 200 atau expected status code

## Step 9: CI/CD Workflow Testing

### 9.1 Trigger CI pada Pull Request
1. Create feature branch: `git checkout -b feature/test-ci`
2. Make changes
3. Commit dan push: `git push origin feature/test-ci`
4. Buat Pull Request ke main/master
5. GitHub Actions akan otomatis run CI
6. Tunggu hingga semua tests pass

### 9.2 Trigger CD dengan Push ke Main
1. Merge PR ke main/master
2. GitHub Actions akan otomatis run CD
3. Jika tests pass, otomatis deploy ke Railway
4. Cek Railway logs untuk memastikan deployment sukses

## Troubleshooting

### Port Issues
- Railway menggunakan port yang di-assign otomatis
- Gunakan `process.env.PORT` di aplikasi
- Jangan hardcode port

### Database Connection
- Gunakan connection string dari Railway PostgreSQL
- Verifikasi credentials di Railway dashboard
- Test connection sebelum deploy

### HTTPS Issues
- Railway sudah handle HTTPS otomatis
- Jika custom domain, tunggu DNS propagation
- Clear browser cache jika ada issues

### Build Fails
- Check logs di Railway dashboard
- Pastikan `npm ci` dan build script work
- Verify Node.js version compatibility

## Security Best Practices

1. **Token Management**
   - Jangan commit `.env` file
   - Selalu gunakan GitHub Secrets untuk sensitive data
   - Rotate tokens secara berkala

2. **Database**
   - Railway PostgreSQL sudah dengan password
   - Jangan share connection string
   - Backup data secara berkala

3. **Environment Variables**
   - Berbeda untuk dev, test, production
   - Use `.env.example` untuk template
   - Document semua required variables

## Resources
- Railway Docs: https://docs.railway.app
- GitHub Actions: https://docs.github.com/en/actions
- Node.js on Railway: https://docs.railway.app/guides/nodejs
- HTTPS Best Practices: https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html

## Support
Jika ada masalah:
1. Check Railway logs
2. Check GitHub Actions logs
3. Verify environment variables
4. Test locally dulu sebelum push
5. Check documentation di Railway dan GitHub Actions

---

**Last Updated**: December 2024
**Tested with**: Node.js 16.x, PostgreSQL 13
