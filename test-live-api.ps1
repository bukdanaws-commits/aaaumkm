# Test API /api/auth/check-role
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🧪 TESTING LIVE API ENDPOINT" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Testing: http://localhost:3000/api/auth/check-role" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/check-role" -Method GET -UseBasicParsing
    
    Write-Host "✅ API Response:" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor White
    Write-Host ""
    Write-Host "Response Body:" -ForegroundColor White
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    if ($statusCode -eq 401) {
        Write-Host "❌ 401 Unauthorized" -ForegroundColor Red
        Write-Host ""
        Write-Host "This means:" -ForegroundColor Yellow
        Write-Host "- You are NOT logged in" -ForegroundColor Yellow
        Write-Host "- Or your session has expired" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Solution:" -ForegroundColor Cyan
        Write-Host "1. Open browser: http://localhost:3000" -ForegroundColor White
        Write-Host "2. Login with: itarizvsn@gmail.com" -ForegroundColor White
        Write-Host "3. After login, run this script again" -ForegroundColor White
    } else {
        Write-Host "❌ Error: $statusCode" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "📝 INSTRUCTIONS" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you got 401 Unauthorized:" -ForegroundColor Yellow
Write-Host "1. Open browser and go to: http://localhost:3000/auth" -ForegroundColor White
Write-Host "2. Login with: itarizvsn@gmail.com" -ForegroundColor White
Write-Host "3. After successful login, you should see dashboard" -ForegroundColor White
Write-Host "4. Look for 'Admin Panel' card on the dashboard" -ForegroundColor White
Write-Host "5. Click 'Buka Admin Panel' button" -ForegroundColor White
Write-Host ""
Write-Host "If Admin Panel card is NOT showing:" -ForegroundColor Yellow
Write-Host "1. Open browser DevTools (F12)" -ForegroundColor White
Write-Host "2. Go to Console tab" -ForegroundColor White
Write-Host "3. Run this command:" -ForegroundColor White
Write-Host "   fetch('/api/auth/check-role').then(r => r.json()).then(console.log)" -ForegroundColor Cyan
Write-Host "4. Check if isAdmin is true or false" -ForegroundColor White
Write-Host ""
Write-Host "If isAdmin is FALSE:" -ForegroundColor Yellow
Write-Host "1. Logout completely" -ForegroundColor White
Write-Host "2. Clear browser cache and cookies" -ForegroundColor White
Write-Host "3. Close all browser tabs" -ForegroundColor White
Write-Host "4. Open new browser window" -ForegroundColor White
Write-Host "5. Login again with: itarizvsn@gmail.com" -ForegroundColor White
Write-Host ""
