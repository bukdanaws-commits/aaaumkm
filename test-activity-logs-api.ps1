# Test Activity Logs API
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🧪 TESTING ACTIVITY LOGS API" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Testing: http://localhost:3000/api/admin/activity-logs" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/activity-logs?page=1&limit=20" -Method GET -UseBasicParsing
    
    Write-Host "✅ API Response:" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor White
    Write-Host ""
    Write-Host "Response Body:" -ForegroundColor White
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host ""
    Write-Host "📊 RESULT:" -ForegroundColor Cyan
    Write-Host "  Total Logs: $($data.pagination.total)" -ForegroundColor White
    Write-Host "  Page: $($data.pagination.page)" -ForegroundColor White
    Write-Host "  Total Pages: $($data.pagination.totalPages)" -ForegroundColor White
    Write-Host ""
    Write-Host "  Logs:" -ForegroundColor White
    foreach ($log in $data.logs) {
        Write-Host "    - $($log.action): $($log.description)" -ForegroundColor Gray
    }
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    Write-Host "❌ Error: $statusCode" -ForegroundColor Red
    Write-Host ""
    
    if ($statusCode -eq 401) {
        Write-Host "401 Unauthorized - Not logged in" -ForegroundColor Yellow
    } elseif ($statusCode -eq 403) {
        Write-Host "403 Forbidden - Not admin" -ForegroundColor Yellow
    } elseif ($statusCode -eq 500) {
        Write-Host "500 Internal Server Error" -ForegroundColor Yellow
        Write-Host "Check server logs for details" -ForegroundColor Yellow
    }
    
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    # Try to get response body
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "Response Body:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor Gray
    } catch {
        # Ignore
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
