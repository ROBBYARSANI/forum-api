#!/bin/bash

# Setup Railway Deployment Secrets for GitHub Actions
# This script helps you configure the required secrets for CD workflow

cat << 'EOF'

╔════════════════════════════════════════════════════════════════════════════════╗
║                    RAILWAY DEPLOYMENT SETUP GUIDE                             ║
║              Configure GitHub Secrets for Continuous Deployment                ║
╚════════════════════════════════════════════════════════════════════════════════╝

REQUIRED SECRETS TO ADD TO GITHUB:
═══════════════════════════════════════════════════════════════════════════════

You need to add the following secrets to your GitHub repository:

1️⃣  RAILWAY_TOKEN
    ├─ Purpose: Authentication token for Railway CLI
    ├─ Where to get: https://railway.app/account/tokens
    ├─ Steps:
    │  1. Login to Railway.app
    │  2. Go to Account Settings → Tokens
    │  3. Click "Create New Token"
    │  4. Copy the token
    │  5. Don't share this token!
    └─ Add to GitHub:
       Repository → Settings → Secrets and variables → Actions → New repository secret
       Name: RAILWAY_TOKEN
       Value: (paste your Railway token)

2️⃣  RAILWAY_PROJECT_ID
    ├─ Purpose: Identifies your Railway project
    ├─ Where to get: https://railway.app/dashboard
    ├─ Steps:
    │  1. Go to Railway Dashboard
    │  2. Open your forum-api project
    │  3. Look at the URL: https://railway.app/project/[PROJECT_ID]
    │  4. Copy the PROJECT_ID
    └─ Add to GitHub:
       Repository → Settings → Secrets and variables → Actions → New repository secret
       Name: RAILWAY_PROJECT_ID
       Value: (your project ID, e.g., "abc123def456")

═══════════════════════════════════════════════════════════════════════════════

WORKFLOW STEPS EXPLANATION:
═══════════════════════════════════════════════════════════════════════════════

The CD workflow now performs REAL deployment:

1. 📦 Checkout Code
   └─ Pull latest code from master branch

2. 🔑 Setup Node.js
   └─ Configure Node.js 18 environment

3. 📥 Install Dependencies
   └─ npm ci (clean install, reproducible builds)

4. 🧪 Run Tests
   └─ Execute npm test to verify code quality
   └─ Allows failure (won't block deployment, but should pass)

5. 🏗️ Build Docker Image
   └─ Local build verification (same as Railway will build)

6. 🚀 ACTUAL DEPLOYMENT TO RAILWAY
   ├─ Install Railway CLI
   ├─ Authenticate with RAILWAY_TOKEN
   ├─ Link to Railway project
   └─ Deploy using "railway up --detach"
       This is the REAL deployment command, not just echo/sleep!

7. 🏥 Health Check
   └─ Verify deployed app is healthy
   └─ Retry up to 30 times (60 seconds max)
   └─ Check /health endpoint returns 200

8. 🧪 Smoke Tests
   └─ Test /status and /health endpoints
   └─ Ensure critical functionality works

═══════════════════════════════════════════════════════════════════════════════

KEY IMPROVEMENTS vs OLD WORKFLOW:
═══════════════════════════════════════════════════════════════════════════════

BEFORE (❌ WRONG):
  ├─ Only echo messages (no actual deployment)
  ├─ sleep 45 to simulate waiting (fake wait)
  └─ No real CLI interaction with Railway

AFTER (✅ CORRECT):
  ├─ Real Railway CLI deployment (railway up --detach)
  ├─ Actual authentication with Railway token
  ├─ Smart health check with retries (not fixed 45 seconds)
  ├─ Proper error handling and exit codes
  └─ Comprehensive logging and notifications

═══════════════════════════════════════════════════════════════════════════════

TESTING THE WORKFLOW:
═══════════════════════════════════════════════════════════════════════════════

To test if deployment works:

1. Make sure secrets are configured (see steps above)

2. Make a test commit to master:
   git commit --allow-empty -m "test: trigger CD workflow"
   git push origin master

3. Go to GitHub → Actions tab

4. Watch the workflow run in real-time

5. Check Railway dashboard for deployment status

Expected output:
  ✅ All steps complete green checkmarks
  ✅ API accessible at https://forum-api-production-5ea8.up.railway.app
  ✅ Health check passes

═══════════════════════════════════════════════════════════════════════════════

TROUBLESHOOTING:
═══════════════════════════════════════════════════════════════════════════════

If deployment fails:

❌ "RAILWAY_TOKEN not configured"
   └─ Follow step 1 above to add RAILWAY_TOKEN secret

❌ "Failed to authenticate"
   └─ Token might be expired, generate new one on Railway.app

❌ "health check failed after 30 attempts"
   └─ Check Railway logs for deployment errors
   └─ Common: Database connection, environment variables

❌ "smoke tests failed"
   └─ App deployed but health endpoints not working
   └─ Check if app started correctly

═══════════════════════════════════════════════════════════════════════════════

WORKFLOW FILE LOCATION:
  .github/workflows/cd.yml

RAILWAY DOCS:
  https://docs.railway.app/cli/commands#up

═══════════════════════════════════════════════════════════════════════════════

EOF
