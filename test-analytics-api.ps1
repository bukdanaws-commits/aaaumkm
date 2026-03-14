# Test Analytics API
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🧪 TESTING ANALYTICS API" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Testing: http://localhost:3000/api/admin/analytics" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/analytics" -Method GET -UseBasicParsing
    
    Write-Host "✅ API Response:" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor White
    Write-Host ""
    Write-Host "Response Body:" -ForegroundColor White
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host ""
    Write-Host "📊 STATS:" -ForegroundColor Cyan
    Write-Host "  Total Users: $($data.stats.totalUsers)" -ForegroundColor White
    Write-Host "  Total Listings: $($data.stats.totalListings)" -ForegroundColor White
    Write-Host "  Active Listings: $($data.stats.activeListings)" -ForegroundColor White
    Write-Host "  Total Orders: $($data.stats.totalOrders)" -ForegroundColor White
    Write-Host "  Completed Orders: $($data.stats.completedOrders)" -ForegroundColor White
    Write-Host "  Total Revenue: Rp $($data.stats.totalRevenue)" -ForegroundColor White
    Write-Host "  Total Views: $($data.stats.totalViews)" -ForegroundColor White
    Write-Host "  Conversion Rate: $($data.stats.conversionRate)%" -ForegroundColor White
    
    Write-Host ""
    Write-Host "📈 CHARTS:" -ForegroundColor Cyan
    Write-Host "  Daily Views: $($data.charts.dailyViews.Count) days" -ForegroundColor White
    Write-Host "  Daily Orders: $($data.charts.dailyOrders.Count) days" -ForegroundColor White
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    if ($statusCode -eq 401) {
        Write-Host "❌ 401 Unauthorized" -ForegroundColor Red
        Write-Host ""
        Write-Host "You are NOT logged in or session expired" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Solution:" -ForegroundColor Cyan
        Write-Host "1. Open browser: http://localhost:3000/auth" -ForegroundColor White
        Write-Host "2. Login with Google: itarizvsn@gmail.com" -ForegroundColor White
        Write-Host "3. After login, run this script again" -ForegroundColor White
    } elseif ($statusCode -eq 403) {
        Write-Host "❌ 403 Forbidden" -ForegroundColor Red
        Write-Host ""
        Write-Host "You don't have admin access" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Solution:" -ForegroundColor Cyan
        Write-Host "1. Make sure you're logged in with admin account" -ForegroundColor White
        Write-Host "2. Run: npx tsx check-google-auth-user.ts" -ForegroundColor White
    } else {
        Write-Host "❌ Error: $statusCode" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
