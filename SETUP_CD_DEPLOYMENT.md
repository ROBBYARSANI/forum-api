# Panduan Setup & Deploy CD ke Railway

Dokumen ini adalah step-by-step untuk men-setup deployment otomatis ke Railway dan memastikan GitHub Actions CD berjalan sukses.

## 📋 Prerequisites Checklist

- [ ] Railway Account (https://railway.app) sudah aktif
- [ ] GitHub Account dengan repo forum-api
- [ ] Git CLI installed di local machine
- [ ] Access ke Railway dashboard

---

## STEP 1️⃣ : Setup Railway & Ambil Token

### 1.1 Login ke Railway
1. Buka https://railway.app
2. Login dengan GitHub account Anda

### 1.2 Buat Project di Railway (jika belum)
1. Di dashboard, klik "New Project"
2. Pilih "Deploy from GitHub repo"
3. Authorize railway-app untuk akses GitHub
4. Pilih repository `ROBBYARSANI/forum-api`
5. Klik "Deploy Now"

### 1.3 Tambahkan PostgreSQL Service
1. Di project Railway, klik "Add Service"
2. Pilih "Add from Marketplace"
3. Cari & pilih "PostgreSQL"
4. Klik "Add"
5. Railway akan membuat PostgreSQL instance otomatis

### 1.4 Generate Railway Token
**Ini adalah langkah PENTING untuk deployment automation!**

1. Login ke Railway: https://railway.app
2. Klik **profile icon** (sudut kanan atas)
3. Pilih "Account Settings" atau "Settings"
4. Cari section "API Tokens" atau "Tokens"
5. Klik "Create New Token" atau "Generate Token"
6. **Copy token yang di-generate** (jangan paste di sini, simpan sementara)
7. Simpan token di notepad/password manager sementara untuk step 2

Catatan:
- Token hanya ditampilkan sekali. Jika hilang, generate token baru.
- Jangan share token dengan orang lain.
- Token ini akan Anda gunakan di GitHub Secrets.

### 1.5 Catat PostgreSQL Credentials (dari Railway)
Saat Anda menambahkan PostgreSQL service, Railway auto-generate credentials. Catat:

1. Di Railway, buka service PostgreSQL
2. Tab "Connect"
3. Catat atau copy:
   - **PGHOST** (contoh: `container.railway.app`)
   - **PGPORT** (biasanya `5432`)
   - **PGUSER** (biasanya `postgres`)
   - **PGPASSWORD** (string random yang di-generate Railway)
   - **PGDATABASE** (biasanya `railway`)

Atau Anda bisa lihat di tab "Variables" service PostgreSQL untuk melihat semua env vars yang Railway provide.

---

## STEP 2️⃣ : Tambahkan RAILWAY_TOKEN ke GitHub Secrets

GitHub Secrets adalah cara aman untuk store token tanpa commit ke repository.

### Opsi A: Gunakan GitHub Web UI (Recommended for Beginners)

1. Buka repository: https://github.com/ROBBYARSANI/forum-api
2. Klik **Settings** (tab di atas)
3. Pilih **Secrets and variables** → **Actions** (sidebar kiri)
4. Klik **New repository secret** (tombol hijau)
5. Isi form:
   - **Name**: `RAILWAY_TOKEN`
   - **Value**: (paste token dari step 1.4)
6. Klik **Add secret**
7. Done! ✓ Secret sudah tersimpan

### Opsi B: Gunakan GitHub CLI (gh)

Jika Anda sudah install `gh` dan login:

```bash
gh secret set RAILWAY_TOKEN --body "<PASTE_TOKEN_DARI_STEP_1.4>"
```

Ganti `<PASTE_TOKEN_DARI_STEP_1.4>` dengan token yang Anda catat di step 1.4.

---

## STEP 3️⃣ : Tambahkan Database Credentials ke GitHub Secrets

Workflow CD menjalankan `npm run migrate` sebelum deploy. Untuk itu, dia butuh DB credentials.

### Opsi A: Gunakan GitHub Web UI

Ulangi langkah 2 untuk tiap variable berikut:

1. Secret name: `PGHOST`
   Value: (dari step 1.5, contoh: `container.railway.app`)

2. Secret name: `PGPORT`
   Value: `5432` (atau yang Anda catat)

3. Secret name: `PGUSER`
   Value: `postgres` (atau yang Anda catat)

4. Secret name: `PGPASSWORD`
   Value: (password yang di-generate Railway di step 1.5)

5. Secret name: `PGDATABASE`
   Value: `railway` (atau sesuai yang Railway buat)

### Opsi B: Gunakan GitHub CLI (gh)

Jalankan perintah berikut (ganti nilai dengan milik Anda):

```bash
gh secret set PGHOST --body "container.railway.app"
gh secret set PGPORT --body "5432"
gh secret set PGUSER --body "postgres"
gh secret set PGPASSWORD --body "password-anda-dari-railway"
gh secret set PGDATABASE --body "railway"
```

### Verifikasi Secrets Sudah Tersimpan

Di GitHub web UI:
1. Settings → Secrets and variables → Actions
2. Harus ada daftar secrets: `RAILWAY_TOKEN`, `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
3. Semuanya harus tercantum (values tidak terlihat untuk security)

---

## STEP 4️⃣ : Merge ke Main untuk Trigger CD

Sekarang semua secrets sudah setup. Langkah terakhir adalah merge branch feature ke main agar workflow CD berjalan.

### Opsi A: Merge via GitHub Web UI

1. Buka repository di GitHub
2. Klik tab **Pull requests**
3. Cari PR dari `feature/complete-forum-api` ke `main` atau `master`
   - Jika belum ada PR, buat baru:
     - Klik **New pull request**
     - Base: `main` atau `master`
     - Compare: `feature/complete-forum-api`
     - Klik **Create pull request**
     - Isi title & description
4. Jika PR sudah ada, klik PR tersebut
5. Scroll ke bawah, klik **Merge pull request** (tombol hijau)
6. Pilih merge method (biasanya "Create a merge commit")
7. Klik **Confirm merge**
8. Done! Branch sudah merge ke main, workflow CD akan auto-trigger

### Opsi B: Merge via Git CLI

```bash
# Pindah ke branch main
git checkout main

# Pull latest dari remote
git pull origin main

# Merge feature branch ke main
git merge feature/complete-forum-api

# Push ke GitHub
git push origin main
```

Setelah push, GitHub akan auto-trigger workflow CD.

---

## STEP 5️⃣ : Monitor Deployment di GitHub Actions

Setelah merge, workflow CD akan mulai berjalan dalam hitungan detik.

### Cara Lihat Status Deployment

1. Buka repository di GitHub
2. Klik tab **Actions** (di top navigation)
3. Lihat list workflow runs
4. Cari run terbaru untuk branch `main` dengan nama workflow **"Continuous Deployment"**
5. Klik untuk membuka detail
6. Lihat step-step:
   - `test` job → harus PASS (all tests pass)
   - `deploy` job → harus PASS setelah `test` sukses
   - Di dalam `deploy` job, lihat steps:
     - ✓ Checkout
     - ✓ Setup Node.js
     - ✓ Install dependencies
     - ✓ Run database migrations
     - ✓ Install Railway CLI
     - ✓ **Deploy to Railway** ← ini yang penting, harus berhasil

### Jika Deploy Job PASS ✅

Berarti:
1. Semua tests sudah pass
2. Database migration berhasil
3. Railway CLI berhasil deploy aplikasi
4. **CD workflow sudah mencapai status SUKSES** (memenuhi kriteria "minimal satu proses CD yang sudah berhasil")

Anda bisa lihat live URL di Railway dashboard:
- Railway dashboard → service Node.js → "Domains" section
- URL akan seperti: `https://your-api.up.railway.app`
- Test dengan curl:
  ```bash
  curl https://your-api.up.railway.app/health
  ```

### Jika Deploy Job FAIL ❌

Lihat error message di step yang fail:
- **"Deploy to Railway" step fail**: Biasanya karena `RAILWAY_TOKEN` salah/expired. Cek secrets di GitHub.
- **"Run database migrations" fail**: Biasanya karena DB credentials salah. Verifikasi `PGHOST`, `PGPORT`, dll.
- **"Run tests" fail**: Ada test yang tidak pass. Periksa test logs di Actions.

Jika ada error, saya bisa bantu debug — share screenshot atau copy log error ke sini.

---

## ✅ Checklist Final untuk CD Success

Sebelum merge ke main, pastikan Anda sudah:

- [ ] Sudah login ke Railway (https://railway.app)
- [ ] Project di Railway sudah dibuat dan linked ke GitHub
- [ ] PostgreSQL service sudah di-add di Railway project
- [ ] Railway Token sudah generate dan di-copy
- [ ] DB credentials (PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE) sudah catat dari Railway
- [ ] Secret `RAILWAY_TOKEN` sudah di-add ke GitHub Secrets
- [ ] Semua 5 DB secrets sudah di-add ke GitHub Secrets
- [ ] Branch `feature/complete-forum-api` sudah di-push dengan latest code
- [ ] Merge ke `main` atau `master` (trigger CD workflow)
- [ ] Monitor tab Actions sampai workflow CD selesai
- [ ] Cek hasil deploy di Railway dashboard

---

## 🆘 Troubleshooting Umum

### Error: "RAILWAY_TOKEN not found" atau "Invalid token"
**Solusi**:
- Pastikan secret `RAILWAY_TOKEN` sudah di-add ke GitHub (Settings → Secrets → Actions)
- Jika token sudah lama, generate token baru di Railway dan update secret

### Error: "Cannot connect to database"
**Solusi**:
- Verifikasi DB credentials di Railway (tab PostgreSQL → Connect)
- Pastikan credentials di secrets benar (PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE)
- Pastikan PostgreSQL service sudah running di Railway

### Error: "Migration failed"
**Solusi**:
- Pastikan database sudah created di Railway PostgreSQL
- Check apakah migration files ada di `migrations/` folder
- Jalankan migration manual di local dulu untuk test: `npm run migrate`

### Workflow tidak jalan sama sekali setelah merge
**Solusi**:
- Refresh GitHub Actions tab beberapa kali
- Pastikan Anda merge ke branch yang benar (`main` atau `master`)
- Cek workflow trigger di `.github/workflows/cd.yml` (harus `on: push: branches: [main, master]`)

---

## 📞 Next Steps

1. Selesaikan Step 1-5 di atas
2. Laporkan status di Actions (success atau error)
3. Jika ada error, share screenshot / log untuk debugging
4. Setelah CD sukses, cek live API di Railway URL
5. Test endpoints dengan Postman atau curl

---

**Estimated time to complete**: ~15-20 menit

