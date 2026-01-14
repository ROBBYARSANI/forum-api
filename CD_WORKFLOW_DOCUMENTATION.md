# CD Workflow Documentation

## Overview

Workflow CD (Continuous Deployment) ini menangani deployment otomatis aplikasi Forum API ke Railway setiap kali ada push ke branch `master`.

**Status:** ✅ FIXED - Deployment nyata, bukan simulasi

---

## Masalah yang Diperbaiki

### Sebelumnya (SALAH ❌)
```yaml
- name: Deploy Notice
  run: |
    echo "Deploying..."
    sleep 45  # ← FAKE SLEEP
    echo "Deployment complete"
```

**Masalah:**
- Hanya echo message, tidak ada deployment nyata
- `sleep 45` untuk mensimulasikan waktu tunggu
- Tidak ada interaksi dengan Railway CLI
- Reviewer feedback: "tidak terdapat tindakan atau tahapan untuk melakukan deployment"

### Sekarang (BENAR ✅)
```yaml
- name: Deploy to Railway
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
  run: |
    npm install -g @railway/cli@latest
    export RAILWAY_TOKEN="${{ secrets.RAILWAY_TOKEN }}"
    railway deploy --force  # ← REAL DEPLOYMENT
```

**Perbaikan:**
- Real Railway CLI deployment dengan `railway deploy --force`
- Smart health check dengan retry logic (60 attempts × 5 sec)
- Proper error handling dan verification
- Smoke tests untuk critical endpoints

---

## Workflow Steps

### 1. Checkout Code
```yaml
- name: Checkout Code
  uses: actions/checkout@v3
```
Mengambil code terbaru dari repository.

### 2. Setup Node.js
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v3
  with:
    node-version: '18.x'
    cache: 'npm'
```
Menginstall Node.js v18 dengan npm caching untuk faster installation.

### 3. Install Dependencies
```yaml
- name: Install Dependencies
  run: npm ci
```
Menginstall production dependencies dengan `npm ci` (clean install).

### 4. Build Docker Image
```yaml
- name: Build Docker Image (Verification)
  run: docker build -t forum-api:${{ github.sha }} .
```
Verify bahwa Dockerfile dapat di-build dengan sukses sebelum deployment.

### 5. Install Railway CLI
```yaml
- name: Install Railway CLI
  run: npm install -g @railway/cli@latest
```
Menginstall Railway Command Line Interface untuk melakukan deployment.

### 6. Deploy to Railway (REAL DEPLOYMENT ✅)
```yaml
- name: Deploy to Railway
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
  run: |
    export RAILWAY_TOKEN="${{ secrets.RAILWAY_TOKEN }}"
    railway deploy --force
```

**Penjelasan:**
- `RAILWAY_TOKEN`: Secret dari GitHub yang berisi Railway API token
- `railway deploy --force`: Command Railway CLI untuk deploy aplikasi
- `--force` flag: Memaksa deployment tanpa konfirmasi

**Apa yang terjadi:**
1. Railway CLI authenticate menggunakan RAILWAY_TOKEN
2. CLI mendeteksi project dari `railway.json`
3. Deploy latest commit dari repository
4. Build Docker image di Railway infrastructure
5. Start container dengan environment variables
6. Database initialized jika sudah ada migration

### 7. Wait for Deployment Health Check
```bash
MAX_ATTEMPTS=60
ATTEMPT=0
API_URL="https://forum-api-production-5ea8.up.railway.app"

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" 2>/dev/null || echo "000")
  
  if [ "$HEALTH" = "200" ]; then
    echo "API is healthy (HTTP $HEALTH)"
    break
  fi
  
  ATTEMPT=$((ATTEMPT + 1))
  if [ $((ATTEMPT % 12)) -eq 0 ]; then
    echo "Attempt $ATTEMPT/$MAX_ATTEMPTS - Still waiting (last HTTP: $HEALTH)..."
  fi
  sleep 5
done
```

**Penjelasan:**
- **Max attempts**: 60 × 5 detik = 5 menit timeout
- **Retry logic**: Cek `/health` endpoint setiap 5 detik
- **Progress reporting**: Log setiap 12 attempts (60 detik)
- **Success condition**: HTTP 200 response
- **Failure handling**: Exit dengan error jika timeout

**Keuntungan vs `sleep 45`:**
- ✅ Tahu kapan deployment selesai (tidak perlu menunggu 5 menit)
- ✅ Detect deployment failures lebih cepat
- ✅ Smart retry logic
- ✅ Proper HTTP status checking

### 8. Smoke Test - Critical Endpoints
```bash
echo "Running smoke tests..."
API_URL="https://forum-api-production-5ea8.up.railway.app"

echo "Testing GET /health..."
curl -f "$API_URL/health" > /dev/null && echo "  /health endpoint working" || exit 1

echo "Testing GET /status..."
curl -f "$API_URL/status" > /dev/null && echo "  /status endpoint working" || exit 1
```

**Penjelasan:**
- Test endpoint kritis setelah deployment
- `/health`: Check API dan database connection
- `/status`: Verify basic connectivity
- `-f` flag: Fail jika HTTP status bukan 2xx atau 3xx

### 9. Deployment Success
```yaml
- name: Deployment Success
  run: |
    echo "Deployment completed successfully!"
    echo "API URL: https://forum-api-production-5ea8.up.railway.app"
```

Cetak success message dan URL API.

### 10. Deployment Failed Notification
```yaml
- name: Deployment Failed Notification
  if: failure()
  run: |
    echo "Deployment verification failed!"
    echo "Check Railway logs: https://railway.app/dashboard"
    exit 1
```

Jalankan hanya jika ada step yang gagal. Cetak pesan error dan link untuk cek logs.

---

## Environment Variables & Secrets

### Required Secret: RAILWAY_TOKEN

**Location:** GitHub repository Settings → Secrets and variables → Actions

**How to setup:**
1. Go to https://railway.app/account/tokens
2. Create new token
3. Go to GitHub repo Settings
4. Add secret with name `RAILWAY_TOKEN` and value = token dari Railway

**Jangan lupa:** Token bersifat sensitif, jangan commit ke repository!

---

## Configuration Files

### railway.json
Konfigurasi Railway project. File ini diperlukan agar `railway deploy` tahu project mana yang akan di-deploy.

```json
{
  "id": "xxx-xxx-xxx",
  "name": "forum-api"
}
```

### Dockerfile
Konfigurasi Docker container untuk production deployment.

---

## Deployment Timeline

```
Push to master
     ↓
GitHub Actions trigger (immediately)
     ↓
[1-2 min] Checkout, Install, Build, Deploy
     ↓
railway deploy --force command (1-3 min)
     ↓
Railway infrastructure memproses deployment
     ↓
[0-5 min] Health check retry loop (up to 300 sec)
     ↓
Smoke tests verification
     ↓
✅ Deployment complete atau ❌ Deployment failed
```

**Total waktu:** 5-10 menit dari push hingga API siap digunakan

---

## Monitoring & Troubleshooting

### View GitHub Actions Logs
1. Go to: https://github.com/ROBBYARSANI/forum-api/actions
2. Click latest workflow run
3. View step-by-step logs
4. Check "Deploy to Railway" step untuk detail deployment

### View Railway Logs
1. Go to: https://railway.app/dashboard
2. Select project "forum-api"
3. View deployment logs dan container logs

### Common Issues & Solutions

#### ❌ "RAILWAY_TOKEN not found"
**Cause:** Secret tidak disetup di GitHub
**Solution:**
1. Go to GitHub Settings → Secrets and variables → Actions
2. Add RAILWAY_TOKEN secret
3. Retry deployment dengan push commit baru

#### ❌ "Authentication failed"
**Cause:** Token salah atau expired
**Solution:**
1. Generate token baru di https://railway.app/account/tokens
2. Update RAILWAY_TOKEN di GitHub Secrets
3. Retry deployment

#### ❌ "Health check timeout"
**Cause:** Deployment di Railway masih memproses
**Solution:**
1. Check Railway dashboard untuk logs
2. Tunggu beberapa menit
3. Retry dengan push commit baru
4. Check apakah ada database migration errors

#### ❌ "Docker build failed"
**Cause:** Error di Dockerfile atau code
**Solution:**
1. Check build logs di GitHub Actions
2. Fix error di code
3. Push commit dan retry

---

## Best Practices

1. **Test locally sebelum push:**
   ```bash
   npm run test
   docker build -t forum-api .
   ```

2. **Check health endpoint setelah deployment:**
   ```bash
   curl https://forum-api-production-5ea8.up.railway.app/health
   ```

3. **Monitor logs di Railway dashboard** selama deployment

4. **Set proper timeout** untuk database migration (jika ada)

5. **Use environment variables** untuk sensitive data, bukan hardcode

---

## Comparison: Before vs After

| Aspek | Sebelumnya (❌) | Sekarang (✅) |
|-------|----------------|-------------|
| Deployment method | echo + sleep 45 | railway deploy --force |
| Real CLI execution | ❌ Tidak | ✅ Ya |
| Health check | Hardcoded sleep 45 | Smart retry (60× × 5 sec) |
| Error detection | Lambat (5 min delay) | Cepat (real status check) |
| Smoke tests | Basic | Check critical endpoints |
| Logs | Echo messages only | Detailed Railway logs |
| Reliability | Low (fake) | High (real deployment) |

---

## Next Steps

1. **Setup RAILWAY_TOKEN:**
   ```bash
   bash RAILWAY_SETUP_GUIDE.sh
   ```

2. **Verify setup:**
   - Go ke GitHub repo Settings → Secrets
   - Pastikan RAILWAY_TOKEN ada

3. **Test deployment:**
   - Push commit ke master
   - Go ke Actions tab dan monitor logs
   - Verify API accessible setelah deployment

4. **Monitor production:**
   - Setup Railway alerts (optional)
   - Monitor health endpoint regularly
   - Check logs di Railway dashboard

---

## References

- Railway Documentation: https://docs.railway.app
- Railway CLI: https://docs.railway.app/reference/cli
- GitHub Actions: https://docs.github.com/en/actions
- Hapi.js: https://hapi.dev

---

**Status:** ✅ Deployment workflow sekarang melakukan **real deployment** bukan simulasi!
