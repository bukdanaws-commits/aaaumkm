# Fix Prisma Generate - Force regenerate client
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🔧 FIX PRISMA GENERATE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Stopping any Node processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "Step 2: Cleaning temp files..." -ForegroundColor Yellow
Remove-Item -Path "node_modules\.pnpm\@prisma+client@*\node_modules\.prisma\client\*.tmp*" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

Write-Host "Step 3: Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "✅ DONE!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start dev server: npm run dev" -ForegroundColor White
Write-Host "2. Refresh browser" -ForegroundColor White
Write-Host ""
