# Script untuk push ke GitHub dengan Personal Access Token
# 
# LANGKAH-LANGKAH:
# 1. Buat Personal Access Token di: https://github.com/settings/tokens
#    - Klik "Generate new token (classic)"
#    - Pilih scope: repo (full control of private repositories)
#    - Copy token yang dihasilkan
#
# 2. Jalankan script ini dan masukkan token saat diminta
#
# 3. Script akan otomatis push ke GitHub

Write-Host "=== Push Project ke GitHub ===" -ForegroundColor Cyan
Write-Host ""

# Cek apakah sudah ada commit
$hasCommit = git log --oneline -1 2>$null
if (-not $hasCommit) {
    Write-Host "Error: Belum ada commit. Jalankan git commit terlebih dahulu." -ForegroundColor Red
    exit 1
}

Write-Host "Current branch: " -NoNewline
git branch --show-current
Write-Host ""

Write-Host "Last commit: " -NoNewline
git log --oneline -1
Write-Host ""

# Minta username dan token
Write-Host "Masukkan GitHub username Anda: " -NoNewline -ForegroundColor Yellow
$username = Read-Host

Write-Host "Masukkan Personal Access Token Anda: " -NoNewline -ForegroundColor Yellow
$token = Read-Host -AsSecureString
$tokenPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
)

Write-Host ""
Write-Host "Setting up remote URL..." -ForegroundColor Cyan

# Set remote URL dengan token
$remoteUrl = "https://${username}:${tokenPlain}@github.com/bukdan/nextumkm.git"
git remote set-url origin $remoteUrl

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
Write-Host ""

# Push ke GitHub
$branch = git branch --show-current
git push -u origin $branch

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Push berhasil!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Branch '$branch' sudah di-push ke GitHub." -ForegroundColor Green
    Write-Host "URL: https://github.com/bukdan/nextumkm/tree/$branch" -ForegroundColor Cyan
    
    # Reset remote URL untuk keamanan (hapus token dari config)
    Write-Host ""
    Write-Host "Membersihkan token dari git config..." -ForegroundColor Cyan
    git remote set-url origin "https://github.com/bukdan/nextumkm.git"
    Write-Host "✓ Token dihapus dari git config" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✗ Push gagal. Periksa username dan token Anda." -ForegroundColor Red
    
    # Reset remote URL
    git remote set-url origin "https://github.com/bukdan/nextumkm.git"
}
