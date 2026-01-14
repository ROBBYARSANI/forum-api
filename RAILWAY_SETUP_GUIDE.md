# Railway Deployment Setup Guide

## Prerequisites

Anda perlu setup secrets di GitHub untuk deployment berjalan dengan baik.

## Step 1: Dapatkan Railway Token

1. Login ke [Railway.app](https://railway.app)
2. Buka dashboard Anda
3. Klik **Settings** → **Tokens**
4. Click **New Token**
5. Copy token yang sudah dibuat

## Step 2: Dapatkan Project ID

1. Di Railway dashboard, pilih project Anda
2. Buka **Settings** → **Project ID**
3. Copy Project ID

## Step 3: Dapatkan Service Name

1. Di Railway project, lihat service yang ada
2. Biasanya service name adalah `forum-api` atau sesuai nama Anda

## Step 4: Setup GitHub Secrets

1. Buka repository Anda di GitHub
2. Klik **Settings** → **Secrets and variables** → **Actions**
3. Klik **New repository secret**

Tambahkan secrets berikut:

| Secret Name | Value |
|---|---|
| `RAILWAY_TOKEN` | (Token dari Step 1) |
| `RAILWAY_PROJECT_ID` | (Project ID dari Step 2) |

## Step 5: Verifikasi Workflow

Setelah menambahkan secrets:
1. Push code ke branch `master`
2. CD workflow akan berjalan otomatis
3. Monitor di **Actions** tab

## Troubleshooting

### "Project Token not found"
- Pastikan `RAILWAY_TOKEN` sudah diset di GitHub Secrets
- Verifikasi token masih valid (tidak expired)

### "Service not found"
- Ganti `forum-api` dengan nama service yang benar
- Cek di Railway dashboard untuk nama service yang tepat

### Deployment gagal
1. Check Railway logs di dashboard
2. Lihat GitHub Actions logs untuk error detail
3. Pastikan Dockerfile dan railway.json valid

## Manual Deployment (Local)

Jika ingin deploy manual:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login ke Railway
railway login

# Link ke project
railway link --project <PROJECT_ID>

# Deploy
railway up
```

## Railway Configuration (railway.json)

File `railway.json` harus ada di root project:

```json
{
  "buildCommand": "npm install",
  "startCommand": "npm start",
  "dockerfile": "Dockerfile",
  "port": 3000
}
```

Pastikan variabel environment sudah dikonfigurasi di Railway dashboard:
- `PORT`: 3000
- `NODE_ENV`: production
- Database credentials jika diperlukan
