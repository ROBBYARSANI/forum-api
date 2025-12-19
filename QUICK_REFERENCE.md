# 🚀 FORUM API CD - Quick Reference Card

## ⚡ 5-Minute Setup (Copy & Paste)

### Prerequisite
- Railway account dengan project + PostgreSQL service sudah buat
- Catat: `RAILWAY_TOKEN`, `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
- GitHub CLI (`gh`) sudah install

### Commands (Run in order)

```bash
# 1. Check gh installed
gh --version

# 2. Add RAILWAY_TOKEN (ganti <TOKEN> dengan nilai Anda)
gh secret set RAILWAY_TOKEN --body '<TOKEN>'

# 3. Add DB Credentials (ganti nilai sesuai Railway)
gh secret set PGHOST --body 'your-host'
gh secret set PGPORT --body '5432'
gh secret set PGUSER --body 'postgres'
gh secret set PGPASSWORD --body 'your-password'
gh secret set PGDATABASE --body 'railway'

# 4. Verify secrets
gh secret list

# 5. Push latest code
git add .
git commit -m "final: complete CD setup"
git push origin feature/complete-forum-api

# 6. Merge to main (trigger CD)
git checkout main
git pull origin main
git merge feature/complete-forum-api
git push origin main

# 7. Monitor (open in browser)
# https://github.com/ROBBYARSANI/forum-api/actions
```

### What Happens After Merge
1. GitHub Actions auto-run workflow "Continuous Deployment"
2. Run tests → Run migrations → Deploy to Railway
3. Status PASS = deployment sukses ✓

### Verify Live Deployment
```bash
# Get URL from Railway dashboard, then:
curl https://your-api.up.railway.app/health

# Expected response:
# {"status":"success",...}
```

---

## 🔧 Credentials Dari Railway

**Dimana catat?**
- Railway Dashboard → Service PostgreSQL → Tab "Connect"
- Atau Tab "Variables"

**Apa yang dicatat?**
| Var | Contoh Value |
|-----|---|
| PGHOST | container.railway.app |
| PGPORT | 5432 |
| PGUSER | postgres |
| PGPASSWORD | (random string dari Railway) |
| PGDATABASE | railway |

---

## ✅ Success Indicators

✓ GitHub Actions tab → Workflow "Continuous Deployment" PASS  
✓ Railway dashboard → Service logs show "Server running"  
✓ URL dari Railway respond dengan status 200  
✓ `/health` endpoint return `{"status":"success"}`

---

## ❌ Common Errors & Fix

| Error | Cause | Fix |
|-------|-------|-----|
| "RAILWAY_TOKEN not found" | Secret tidak di-add | `gh secret set RAILWAY_TOKEN ...` |
| "Cannot connect to database" | DB credentials salah | Verify PGHOST, PGPORT di Railway |
| "Migration failed" | Migration files error | Run `npm run migrate` locally first |
| Workflow not running | Wrong branch | Merge to `main` atau `master` |

---

## 📚 Full Docs

See `SETUP_CD_DEPLOYMENT.md` for detailed step-by-step guide.

---

**Last updated**: December 19, 2025  
**Status**: Ready for deployment ✅

