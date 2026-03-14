# Check if user bukdan1001@gmail.com exists in database
Write-Host "Checking user: bukdan1001@gmail.com" -ForegroundColor Cyan
Write-Host ""

# Get all users from admin API
Write-Host "Fetching users from database..." -ForegroundColor Yellow

try {
    # Use admin-001 as Bearer token (admin user)
    $headers = @{
        "Authorization" = "Bearer admin-001"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/users?search=bukdan1001" `
        -Method GET `
        -Headers $headers
    
    Write-Host "Response received!" -ForegroundColor Green
    Write-Host ""
    
    if ($response.users.Count -gt 0) {
        Write-Host "✅ USER DITEMUKAN!" -ForegroundColor Green
        Write-Host ""
        
        foreach ($user in $response.users) {
            if ($user.email -eq "bukdan1001@gmail.com") {
                Write-Host "📋 Detail User:" -ForegroundColor Cyan
                Write-Host "================================="
                Write-Host "User ID: $($user.id)"
                Write-Host "Email: $($user.email)"
                Write-Host "Nama: $($user.name)"
                Write-Host "Role: $($user.role)"
                Write-Host "Status: $($user.status)"
                Write-Host "KYC Status: $($user.kyc_status)"
                Write-Host "KYC Verified: $($user.is_kyc_verified)"
                Write-Host ""
                Write-Host "💰 Wallet & Kredit:" -ForegroundColor Cyan
                Write-Host "Wallet Balance: Rp $($user.wallet_balance)"
                Write-Host ""
                Write-Host "📦 Aktivitas:" -ForegroundColor Cyan
                Write-Host "Total Listings: $($user.total_listings)"
                Write-Host "Orders as Buyer: $($user.total_orders_as_buyer)"
                Write-Host "Orders as Seller: $($user.total_orders_as_seller)"
                Write-Host ""
                Write-Host "Created At: $($user.created_at)"
                Write-Host ""
                
                # Now check credits balance
                Write-Host "Checking credits balance..." -ForegroundColor Yellow
                $creditsBody = @{
                    userId = $user.id
                } | ConvertTo-Json
                
                $creditsResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/credits/balance" `
                    -Method POST `
                    -Body $creditsBody `
                    -ContentType "application/json"
                
                Write-Host "💳 Detail Kredit:" -ForegroundColor Cyan
                Write-Host "Balance: $($creditsResponse.credits.balance)"
                Write-Host "Total Bonus: $($creditsResponse.credits.totalBonus)"
                Write-Host "Total Purchased: $($creditsResponse.credits.totalPurchased)"
                Write-Host "Total Used: $($creditsResponse.credits.totalUsed)"
                Write-Host ""
                
                # Check if received registration bonus
                if ($creditsResponse.credits.totalBonus -gt 0) {
                    Write-Host "🎁 Status Bonus Registrasi: ✅ SUDAH MENERIMA" -ForegroundColor Green
                } else {
                    Write-Host "🎁 Status Bonus Registrasi: ❌ BELUM MENERIMA" -ForegroundColor Red
                }
            }
        }
    } else {
        Write-Host "❌ USER TIDAK DITEMUKAN" -ForegroundColor Red
        Write-Host ""
        Write-Host "User dengan email 'bukdan1001@gmail.com' tidak ada di database." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pastikan server running di http://localhost:3000" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Selesai!" -ForegroundColor Cyan
