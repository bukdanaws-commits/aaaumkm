# Test KYC Approval API
Write-Host "=== Testing KYC Approval API ===" -ForegroundColor Cyan

# Get KYC list first
Write-Host "`nFetching KYC requests..." -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/kyc" -Method GET -UseBasicParsing
$data = $response.Content | ConvertFrom-Json

Write-Host "Total KYC requests: $($data.total)" -ForegroundColor Green

if ($data.requests.Count -gt 0) {
    $firstKyc = $data.requests[0]
    Write-Host "`nFirst KYC Request:" -ForegroundColor Yellow
    Write-Host "ID: $($firstKyc.id)"
    Write-Host "User: $($firstKyc.profile.name) ($($firstKyc.profile.email))"
    Write-Host "Status: $($firstKyc.status)"
    
    # Try to approve
    Write-Host "`nAttempting to approve KYC..." -ForegroundColor Yellow
    
    $body = @{
        action = "approve"
    } | ConvertTo-Json
    
    try {
        $approveResponse = Invoke-WebRequest `
            -Uri "http://localhost:3000/api/admin/kyc/$($firstKyc.id)" `
            -Method PATCH `
            -Body $body `
            -ContentType "application/json" `
            -UseBasicParsing
        
        Write-Host "✅ Success!" -ForegroundColor Green
        Write-Host $approveResponse.Content
    } catch {
        Write-Host "❌ Error!" -ForegroundColor Red
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
        Write-Host "Error: $($_.Exception.Message)"
        
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body: $responseBody"
        }
    }
} else {
    Write-Host "No KYC requests found" -ForegroundColor Red
}
