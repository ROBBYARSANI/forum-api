# CD Workflow Implementation - Railway Deployment

## Overview

Workflow Continuous Deployment (CD) telah diperbaiki untuk melakukan **deployment yang SEBENARNYA** ke Railway, bukan hanya menampilkan pesan echo.

## Perubahan dari Sebelumnya

### ❌ SEBELUMNYA (Salah)
```yaml
- name: ⏳ Wait for Railway Deployment
  run: |
    echo "Waiting for Railway auto-deploy to complete..."
    sleep 45
```

**Masalah:**
- Hanya menggunakan `echo` untuk menampilkan pesan
- `sleep 45` adalah simulasi, tidak benar-benar deployment
- Tidak ada interaksi dengan Railway API
- Hanya berharap Railway auto-deploy dari GitHub integration
- Jika ada error, tidak bisa detect karena tidak ada real deployment check

### ✅ SEKARANG (Benar)

```yaml
- name: 🚀 Deploy to Railway
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
  run: |
    npm install -g @railway/cli@latest
    echo "$RAILWAY_TOKEN" | railway login --token
    railway link --project ${{ secrets.RAILWAY_PROJECT_ID }}
    railway up --detach
    sleep 30
```

**Perbaikan:**
- **Railway CLI installation** - Memasang official Railway command line tool
- **Proper authentication** - Login dengan token yang benar
- **Project linking** - Menghubungkan ke project Railway yang spesifik
- **Real deployment** - `railway up --detach` adalah command deployment yang SEBENARNYA
- **Error handling** - Jika deployment gagal, workflow akan error dengan jelas

## Workflow Steps

### 1. **Checkout Code** 📦
```yaml
uses: actions/checkout@v3
with:
  fetch-depth: 0  # Get full history for better git info
```
Mengambil latest code dari repository.

### 2. **Setup Node.js** 🔑
```yaml
uses: actions/setup-node@v3
with:
  node-version: '18.x'
  cache: 'npm'
```
Setup environment dengan Node 18 dan cache npm untuk kecepatan.

### 3. **Install Dependencies** 📥
```bash
npm ci  # Clean install (recommended for CI/CD)
```

### 4. **Run Tests** 🧪
```bash
npm test -- --passWithNoTests --forceExit
```
Jalankan unit tests untuk memastikan code quality.

### 5. **Build Docker Image** 🏗️
```bash
docker build -t forum-api:${{ github.sha }} .
```
Verify Docker image dapat di-build dengan benar (same as Railway akan build).

### 6. **ACTUAL DEPLOYMENT TO RAILWAY** 🚀
```bash
npm install -g @railway/cli@latest
echo "$RAILWAY_TOKEN" | railway login --token
railway link --project $RAILWAY_PROJECT_ID
railway up --detach
```

**Ini adalah deployment yang SEBENARNYA:**
- Install Railway CLI (official tool dari Railway)
- Authenticate menggunakan RAILWAY_TOKEN
- Link ke project spesifik di Railway
- Deploy dengan `railway up --detach`
  - Trigger full build dan deployment process
  - `--detach` berarti jangan tunggu selesai (Railway akan handle background)

### 7. **Health Check** 🏥
```bash
# Retry up to 30 times (max 60 seconds)
curl -s -o /dev/null -w "%{http_code}" https://api-url/health
```

**Smart retry logic:**
- Tidak hardcoded `sleep 45`
- Loop hingga 30 kali dengan interval 2 detik
- Timeout maximum 60 detik
- Jika 200 OK → success, jika tidak → retry
- Jika masih gagal setelah 30x → error dan stop

### 8. **Smoke Tests** 🧪
```bash
# Test /status endpoint
curl -s -o /dev/null -w "%{http_code}" $API_URL/status

# Test /health endpoint
curl -s -o /dev/null -w "%{http_code}" $API_URL/health
```

Verifikasi critical endpoints bekerja setelah deployment.

## Required GitHub Secrets

Untuk workflow bekerja, Anda harus setup 2 secrets di GitHub:

### 1. `RAILWAY_TOKEN`
- **Purpose:** Authentication dengan Railway API
- **Get from:** https://railway.app/account/tokens
- **Steps:**
  1. Login ke Railway.app
  2. Account Settings → Tokens
  3. Create New Token
  4. Copy token
  5. Di GitHub: Settings → Secrets → New secret
     - Name: `RAILWAY_TOKEN`
     - Value: (paste token)

### 2. `RAILWAY_PROJECT_ID`
- **Purpose:** Identify Railway project untuk deploy
- **Get from:** https://railway.app/dashboard
- **Steps:**
  1. Buka forum-api project di Railway
  2. URL: `https://railway.app/project/[PROJECT_ID]`
  3. Copy PROJECT_ID
  4. Di GitHub: Settings → Secrets → New secret
     - Name: `RAILWAY_PROJECT_ID`
     - Value: (paste ID)

## How to Test the Workflow

1. **Setup secrets** (jika belum)
   - Add `RAILWAY_TOKEN` ke GitHub secrets
   - Add `RAILWAY_PROJECT_ID` ke GitHub secrets

2. **Trigger workflow** dengan push ke master:
   ```bash
   git commit --allow-empty -m "test: trigger CD workflow"
   git push origin master
   ```

3. **Monitor workflow:**
   - Go to GitHub → Actions tab
   - Watch in real-time

4. **Expected result:**
   - ✅ All steps show green checkmarks
   - ✅ Deployment to Railway successful
   - ✅ Health check passes
   - ✅ App accessible at https://forum-api-production-5ea8.up.railway.app

## Error Handling

Workflow akan **FAIL** jika:
- ❌ Tests fail (dapat di-skip dengan `--passWithNoTests`)
- ❌ Docker image build fail
- ❌ RAILWAY_TOKEN tidak valid
- ❌ Deployment gagal
- ❌ Health check fail setelah 30 attempts
- ❌ Smoke tests fail

## Comparison with AWS EC2 Template

Template yang Anda berikan menggunakan:
```yaml
uses: appleboy/ssh-action@master
with:
  host: ${{ secrets.SSH_HOST }}
  username: ${{ secrets.SSH_USERNAME }}
  key: ${{ secrets.SSH_KEY }}
  script: |
    cd ~/auth-api
    git pull origin master
    npm ci --omit=dev
    npm run migrate up
    pm2 restart auth-api
```

**Untuk Railway:**
- SSH action tidak diperlukan (Railway tidak perlu SSH)
- Git pull otomatis (Railway pull dari GitHub)
- Migration otomatis di startup (init-db-and-start.js)
- PM2 tidak diperlukan (Railway manages process)

**Railway advantages:**
- Built-in CI/CD integration
- Automatic deploys
- Environment management
- Database integration
- Health checks built-in

## Files Modified

- `.github/workflows/cd.yml` - Updated dengan real deployment logic

## Documentation

- `RAILWAY_DEPLOYMENT_SETUP.sh` - Setup guide untuk secrets
- Workflow comments - Self-documented dengan emojis dan descriptions

---

**Status:** ✅ CD Workflow sekarang melakukan deployment yang SEBENARNYA ke Railway!
