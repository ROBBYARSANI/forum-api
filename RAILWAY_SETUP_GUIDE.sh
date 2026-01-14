#!/bin/bash

# Railway Deployment Setup Guide
# ==============================
# 
# Panduan ini menjelaskan cara mengatur RAILWAY_TOKEN di GitHub Secrets
# sehingga CD workflow dapat melakukan deployment nyata ke Railway.
#

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║          Railway Deployment Setup Guide for GitHub Actions         ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Get Railway Token
echo "STEP 1: Get Railway Token"
echo "========================="
echo ""
echo "1. Go to: https://railway.app/account/tokens"
echo "2. Click 'Create Token' button"
echo "3. Enter token name (e.g., 'GitHub CI/CD')"
echo "4. Copy the generated token"
echo ""
echo "⚠️  PENTING: Simpan token ini dengan aman, Anda tidak bisa melihatnya lagi!"
echo ""

# Step 2: Add to GitHub
echo "STEP 2: Add RAILWAY_TOKEN to GitHub Secrets"
echo "============================================="
echo ""
echo "OPTION A: Via GitHub Web Interface"
echo "----------------------------------"
echo "1. Go to: https://github.com/ROBBYARSANI/forum-api"
echo "2. Click Settings tab"
echo "3. Click 'Secrets and variables' > 'Actions' (sidebar kiri)"
echo "4. Click 'New repository secret' button"
echo "5. Name: RAILWAY_TOKEN"
echo "6. Value: (paste token dari step 1)"
echo "7. Click 'Add secret'"
echo ""

echo "OPTION B: Via GitHub CLI (jika sudah terinstall)"
echo "-----------------------------------------------"
echo "gh secret set RAILWAY_TOKEN -b <your-token-here>"
echo ""

# Step 3: Verify
echo "STEP 3: Verify Setup"
echo "===================="
echo ""
echo "1. Go ke repository settings di GitHub"
echo "2. Masuk ke 'Secrets and variables' > 'Actions'"
echo "3. Cek apakah 'RAILWAY_TOKEN' sudah muncul di daftar"
echo "4. Seharusnya tertulis 'Updated recently' atau tanggal terakhir"
echo ""

# Step 4: Test Deployment
echo "STEP 4: Test Deployment"
echo "======================="
echo ""
echo "Setelah setup RAILWAY_TOKEN:"
echo "1. Push commit apapun ke branch 'master'"
echo "2. GitHub Actions akan otomatis trigger workflow CD"
echo "3. Lihat progress di: https://github.com/ROBBYARSANI/forum-api/actions"
echo "4. Tunggu sampai semua steps selesai (biasanya 5-10 menit)"
echo ""

# Step 5: Monitor
echo "STEP 5: Monitor Deployment"
echo "=========================="
echo ""
echo "Saat deployment berjalan:"
echo "1. GitHub Actions tab: https://github.com/ROBBYARSANI/forum-api/actions"
echo "   Lihat logs dari setiap step (Docker build, Railway deploy, health check)"
echo ""
echo "2. Railway Dashboard: https://railway.app/dashboard"
echo "   Lihat deployment logs lebih detail"
echo ""
echo "3. Test API setelah deployment selesai:"
echo "   curl https://forum-api-production-5ea8.up.railway.app/health"
echo ""
echo "   Response yang benar:"
echo "   {\"status\":\"ok\",\"database\":\"connected\"}"
echo ""

# Troubleshooting
echo "TROUBLESHOOTING"
echo "==============="
echo ""

echo "❌ Error: 'RAILWAY_TOKEN not found'"
echo "   → Token belum ditambahkan ke GitHub Secrets"
echo "   → Ulang STEP 2 di atas"
echo ""

echo "❌ Error: 'Invalid token'"
echo "   → Token sudah expired atau typo"
echo "   → Generate token baru di https://railway.app/account/tokens"
echo "   → Update di GitHub Secrets dengan token baru"
echo ""

echo "❌ Error: 'Authentication failed'"
echo "   → Pastikan RAILWAY_TOKEN ada di repository secrets"
echo "   → Bukan di organization secrets"
echo ""

echo "❌ Health check failed (timeout)"
echo "   → Railway deployment masih sedang berjalan"
echo "   → Cek Railway dashboard untuk melihat status deployment"
echo "   → Tunggu 2-5 menit dan trigger deployment lagi"
echo ""

echo "❌ Docker build failed"
echo "   → Ada error di Dockerfile atau code"
echo "   → Lihat Docker build logs di GitHub Actions"
echo "   → Fix error di code dan push lagi"
echo ""

# Final Instructions
echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                      DEPLOYMENT FLOW EXPLAINED                      ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

cat << 'EOF'
Setelah RAILWAY_TOKEN disetup, berikut flow deployment:

1. Anda push commit ke master branch
   $ git push origin master

2. GitHub Actions CI workflow dimulai:
   ✓ Checkout code
   ✓ Setup Node.js 18
   ✓ Install dependencies
   ✓ Build Docker image (verification)
   → Status: check di Actions tab

3. Setelah CI sukses, CD workflow dimulai:
   ✓ Checkout code
   ✓ Install Railway CLI
   ✓ Authenticate dengan RAILWAY_TOKEN
   ✓ Execute: railway deploy --force
   ✓ Wait for Railway deployment (up to 5 minutes)
   ✓ Health check: curl /health endpoint (60 attempts)
   ✓ Smoke tests: verify critical endpoints
   → Status: check di Actions tab

4. Deployment complete!
   ✓ API accessible di: https://forum-api-production-5ea8.up.railway.app
   ✓ Check logs di Railway dashboard
   ✓ Monitor health di /health endpoint

Dokumentasi Deployment:
- CD Workflow: .github/workflows/cd.yml
- Health Check: 60 attempts × 5 second intervals (5 min timeout)
- Smoke Tests: /health dan /status endpoints
- Error Handling: Automatic rollback jika health check gagal

EOF

echo ""
echo "✅ Setup complete! Silakan ikuti langkah di atas untuk mengaktifkan deployment."
