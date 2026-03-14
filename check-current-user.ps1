# Check current logged in user
Write-Host "Checking current user session..." -ForegroundColor Cyan
Write-Host ""

# Check localStorage for dev_user (old mock auth)
Write-Host "Checking for old mock auth..." -ForegroundColor Yellow
Write-Host "If you see 'dev_user' in localStorage, that's the problem!"
Write-Host ""

Write-Host "Please open browser console and run:" -ForegroundColor Green
Write-Host "localStorage.getItem('dev_user')" -ForegroundColor White
Write-Host ""
Write-Host "If it returns a value, run this to clear it:" -ForegroundColor Green
Write-Host "localStorage.clear()" -ForegroundColor White
Write-Host ""
Write-Host "Then refresh the page and login again with Google." -ForegroundColor Yellow
