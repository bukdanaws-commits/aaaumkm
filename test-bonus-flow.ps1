# Test Bonus Registration Flow
# This script tests the bonus registration API

Write-Host "Testing Bonus Registration API..." -ForegroundColor Cyan
Write-Host ""

# Test 1: New user registration bonus
Write-Host "Test 1: New User Registration" -ForegroundColor Yellow
$newUserId = "test-user-$(Get-Date -Format 'yyyyMMddHHmmss')"
$body = @{
    userId = $newUserId
    email = "test-$newUserId@example.com"
    name = "Test User $newUserId"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/credits/bonus-registration" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

Write-Host "Response:" -ForegroundColor Green
$response | ConvertTo-Json -Depth 3
Write-Host ""

# Test 2: Check balance
Write-Host "Test 2: Check Balance for New User" -ForegroundColor Yellow
$balanceBody = @{
    userId = $newUserId
} | ConvertTo-Json

$balanceResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/credits/balance" `
    -Method POST `
    -Body $balanceBody `
    -ContentType "application/json"

Write-Host "Balance Response:" -ForegroundColor Green
$balanceResponse | ConvertTo-Json -Depth 3
Write-Host ""

# Test 3: Try to get bonus again (should fail)
Write-Host "Test 3: Try to Get Bonus Again (Should Fail)" -ForegroundColor Yellow
$response2 = Invoke-RestMethod -Uri "http://localhost:3000/api/credits/bonus-registration" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

Write-Host "Response:" -ForegroundColor Green
$response2 | ConvertTo-Json -Depth 3
Write-Host ""

Write-Host "All tests completed!" -ForegroundColor Cyan
