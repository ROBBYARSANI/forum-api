# 🚀 Forum API - Railway Deployment - Step by Step

Panduan singkat dan mudah untuk deploy Forum API ke Railway.

## 📋 Prerequisites
- GitHub Account + Forum API Repository
- Railway Account (https://railway.app)
- Git & Node.js installed locally
- Postman (untuk testing)

---

## ✅ STEP 1: Persiapan GitHub Repository

### 1.1 Pastikan repo sudah siap
```bash
cd /home/robby/Documents/dev/FORUM-API

# Check git status
git status

# Ensure you have these files:
# - .github/workflows/ci.yml ✓
# - .github/workflows/cd.yml ✓ (sudah updated)
# - nginx.conf ✓ (sudah updated)
# - Procfile ✓ (baru dibuat)
# - .env.example ✓ (baru dibuat)
# - package.json ✓
```

### 1.2 Commit dan push semua changes
```bash
git add .
git commit -m "Add Railway deployment configuration and CI/CD setup"
git push origin feature/complete-forum-api
```

---

## ✅ STEP 2: Setup Railway Project

### 2.1 Buat akun Railway
1. Buka https://railway.app
2. Klik "Sign Up"
3. Pilih "Continue with GitHub"
4. Authorize railway app
5. Done! ✓

### 2.2 Buat project baru di Railway
1. Di dashboard Railway, klik "New Project"
2. Pilih "Deploy from GitHub repo"
3. Authorize Railroad untuk GitHub
4. Cari dan pilih repository `ROBBYARSANI/forum-api`
5. Klik "Deploy Now"
6. Tunggu ~ 2-3 menit untuk proses initial setup

**Hasil**: Railway akan membuat Node.js service dan attempt deploy

---

## ✅ STEP 3: Setup PostgreSQL Database

### 3.1 Tambah PostgreSQL Service
1. Di Railway project, klik "Add Service"
2. Pilih "Add from Marketplace"
3. Cari "PostgreSQL"
4. Klik dan "Add"
5. Railway akan membuat PostgreSQL instance

### 3.2 Verifikasi PostgreSQL Connection
1. Klik service "Postgres" (atau sesuai nama)
2. Di tab "Connect", catat credentials:
   - PGHOST
   - PGPORT
   - PGUSER
   - PGPASSWORD
   - PGDATABASE

**Penting**: Credentials ini akan auto-tersedia di Node.js service via environment variables

---

## ✅ STEP 4: Configure Environment Variables

### 4.1 Setup di Railway Dashboard
1. Klik service Node.js/Forum-API Anda
2. Klik tab "Variables"
3. Tambahkan variables berikut:

```
HOST=0.0.0.0
PORT=3000
NODE_ENV=production

ACCESS_TOKEN_KEY=4e8ad93c6fd129818b80b51885c4d30f589ee97d646955f8cf8b6fd2a663703c
ACCESS_TOKEN_AGE=1800000
REFRESH_TOKEN_KEY=a29027ddcdaccf30d4dbfe0cb77d4cf58f4a954a5eae91d163c985d7dac2a0ce
REFRESH_TOKEN_AGE=86400000
```

### 4.2 Link PostgreSQL Variables
Railway akan otomatis provide PostgreSQL variables. Tapi verifikasi:
1. Di Variables tab, scroll down
2. Harus ada: `DATABASE_URL` atau individual variables:
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`

Jika tidak ada, click "Add from PostgreSQL service" atau setup manual.

---

## ✅ STEP 5: Database Migration

### 5.1 Connect ke Railway PostgreSQL (Lokal)
```bash
# Dari local machine, koneksi ke Railway PostgreSQL
PGHOST=your-railway-host \
PGPORT=5432 \
PGUSER=postgres \
PGPASSWORD=your-password \
PGDATABASE=railway \
npm run migrate
```

**Catatan**: Ganti YOUR-RAILWAY-HOST dan PASSWORD dengan nilai sebenarnya dari Railway

### 5.2 Alternative: Jalankan Migration di Railway Console
1. Di Railway, buka Node.js service
2. Klik "Open Canvas" atau "Terminal" (jika available)
3. Jalankan:
```bash
npm run migrate
```

**Hasil**: Database tables akan ter-create di Railway PostgreSQL

---

## ✅ STEP 6: Setup GitHub Secrets untuk CD

### 6.1 Generate Railway Token
1. Login ke Railway: https://railway.app
2. Klik profile icon (atas kanan)
3. Pilih "Account Settings" atau "Settings"
4. Cari "API Tokens" atau "Generate Token"
5. Klik "Create Token"
6. Copy token

### 6.2 Add Secret ke GitHub
1. Buka repository: https://github.com/ROBBYARSANI/forum-api
2. Settings → Secrets and variables → Actions
3. Klik "New repository secret"
4. Name: `RAILWAY_TOKEN`
5. Value: Paste token dari 6.1
6. Klik "Add secret"

**Hasil**: GitHub Actions CD dapat deploy ke Railway

---

## ✅ STEP 7: Trigger CI/CD Pipeline

### 7.1 Test CI dengan Pull Request (Force Test Failure)
```bash
# Buat feature branch untuk test
git checkout -b feature/test-ci-failure

# Edit file untuk buat error, misal di src/app.js
# Tambahkan syntax error atau lint error

# Commit dan push
git add .
git commit -m "Test: force CI failure"
git push origin feature/test-ci-failure

# Buat Pull Request ke main/master
# - Buka GitHub
# - Click "Create Pull Request"
# - GitHub Actions akan run CI
# - Lihat CI FAIL ✓
```

### 7.2 Revert dan Trigger CI dengan Test Success
```bash
# Revert changes
git checkout feature/complete-forum-api

# Atau fix the error
git add .
git commit -m "Fix: resolve linting errors"
git push origin feature/test-ci-failure

# Update PR atau create new commit
# GitHub Actions akan run CI lagi
# Lihat CI PASS ✓
```

### 7.3 Merge PR dan Trigger CD
```bash
# Merge PR ke main/master
# - Atau dari GitHub UI, click "Merge Pull Request"
# - Atau dari CLI:

git checkout master
git merge feature/test-ci-failure
git push origin master

# GitHub Actions akan:
# 1. Run tests (CI)
# 2. Jika pass, deploy ke Railway (CD)
# 3. Lihat deployment status di Railway dashboard
```

---

## ✅ STEP 8: Get Your Live URL

### 8.1 Domain dari Railway
1. Di Railway, buka Node.js service
2. Tab "Settings"
3. Cari "Domains" atau "Public URL"
4. Railway akan generate URL: `https://forum-api-production-xxxx.up.railway.app`
5. Ini sudah HTTPS ✓

### 8.2 Custom Domain (Optional)
Jika mau subdomain dcdg.xyz atau custom domain:
1. Di Railway, tab "Domains"
2. Click "Add custom domain"
3. Input domain: `api.dcdg.xyz` atau `your-api.yourdomain.com`
4. Railway kasih DNS instructions
5. Update DNS di registrar
6. Tunggu propagation (bisa 24 jam)

---

## ✅ STEP 9: Test Aplikasi

### 9.1 Health Check
```bash
curl https://your-api.up.railway.app/health
```

Expected response:
```json
{
  "status": "success"
}
```

### 9.2 Create User
```bash
curl -X POST https://your-api.up.railway.app/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "securepassword",
    "fullname": "Test User"
  }'
```

### 9.3 Test Rate Limiting
```bash
# Buat 100 requests dalam 60 detik ke /threads
# Setelah 90 requests, harus dapat 429 Too Many Requests

for i in {1..100}; do
  curl https://your-api.up.railway.app/threads
  echo "Request $i"
done
```

### 9.4 Postman Testing
1. Buka Postman
2. Import Forum API collection
3. Set environment base URL: `https://your-api.up.railway.app`
4. Run collection
5. Semua tests harus PASS ✓

---

## ✅ STEP 10: Setup Monitoring (Optional)

### 10.1 Enable Monitoring di Railway
1. Di Railway, klik Node.js service
2. Tab "Logs" - untuk lihat real-time logs
3. Tab "Metrics" - untuk CPU, Memory usage
4. Setup email notifications (untuk downtime alerts)

---

## 🎯 Checklist Final

- [ ] Repository setup dengan CI/CD workflows
- [ ] Railway project created
- [ ] PostgreSQL service running
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] RAILWAY_TOKEN added ke GitHub Secrets
- [ ] CI tested dengan failure scenario ✓
- [ ] CI tested dengan success scenario ✓
- [ ] CD triggered dan deployed successfully ✓
- [ ] Live URL accessible via HTTPS ✓
- [ ] All endpoints tested dan working ✓
- [ ] Rate limiting tested ✓

---

## 🔗 Important URLs

| Item | URL/Command |
|------|---|
| Railway Dashboard | https://railway.app/dashboard |
| GitHub Repository | https://github.com/ROBBYARSANI/forum-api |
| Live API | https://your-api.up.railway.app |
| Postman Collection | [Upload ke Postman] |

---

## 🐛 Troubleshooting Quick Fixes

### App Crashes
```bash
# Check logs di Railway
# Settings → Logs → Lihat error message
```

### Database Connection Error
```bash
# Verify environment variables
# Settings → Variables → Check PGHOST, PGPORT, etc.
```

### Deployment Fails
```bash
# Check GitHub Actions logs
# Repository → Actions → Lihat workflow yang fail
# Biasanya: missing dependencies, syntax error, atau linting error
```

### HTTPS Not Working
```bash
# Railway auto-handles HTTPS
# Jika custom domain, tunggu DNS propagation
# Clear browser cache
```

---

## 📞 Need Help?

1. Check Railway Docs: https://docs.railway.app
2. Check GitHub Actions Docs: https://docs.github.com/en/actions
3. Check logs: Railway dashboard → Logs tab
4. Test locally first: `npm test`

---

**Selamat! 🎉 Forum API Anda sekarang live di Railway dengan CI/CD automated!**

Next steps:
1. Monitor aplikasi via Railway dashboard
2. Update documentation dengan live URL
3. Backup database secara berkala
4. Setup monitoring & alerts

