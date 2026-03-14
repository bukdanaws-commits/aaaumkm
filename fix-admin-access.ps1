# Script untuk Fix Admin Access
# Jalankan: .\fix-admin-access.ps1

Write-Host ""
Write-Host "🔧 FIX ADMIN ACCESS SCRIPT" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify role in database
Write-Host "Step 1: Verifying role in database..." -ForegroundColor Yellow
npx ts-node check-user-role.ts
Write-Host ""

# Step 2: Test API logic
Write-Host "Step 2: Testing API logic..." -ForegroundColor Yellow
npx ts-node test-check-role-api.ts
Write-Host ""

# Step 3: Clear Next.js cache
Write-Host "Step 3: Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ .next folder deleted" -ForegroundColor Green
} else {
    Write-Host "⚠️  .next folder not found (already clean)" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Clear node_modules cache
Write-Host "Step 4: Clearing node_modules cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "✅ node_modules\.cache deleted" -ForegroundColor Green
} else {
    Write-Host "⚠️  node_modules\.cache not found (already clean)" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Start dev server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. In browser:" -ForegroundColor White
Write-Host "   - Clear ALL browsing data (Ctrl + Shift + Delete)" -ForegroundColor Cyan
Write-Host "   - Close ALL browser tabs" -ForegroundColor Cyan
Write-Host "   - Restart browser" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Fresh login:" -ForegroundColor White
Write-Host "   - Go to http://localhost:3000" -ForegroundColor Cyan
Write-Host "   - Logout (if logged in)" -ForegroundColor Cyan
Write-Host "   - Login with itarizvsn@gmail.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Test admin access:" -ForegroundColor White
Write-Host "   - Open DevTools (F12)" -ForegroundColor Cyan
Write-Host "   - Console tab, run:" -ForegroundColor Cyan
Write-Host "     fetch('/api/auth/check-role').then(r=>r.json()).then(console.log)" -ForegroundColor Gray
Write-Host "   - Should see: isAdmin: true" -ForegroundColor Cyan
Write-Host "   - Navigate to /admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
