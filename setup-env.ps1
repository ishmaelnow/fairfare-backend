# Setup Environment Variables for All PWAs
# Run this script after getting your Supabase Anon Key

param(
    [Parameter(Mandatory=$true)]
    [string]$AnonKey
)

$supabaseUrl = "https://zademtsktedahwgehttw.supabase.co"
$pwas = @("rider-pwa", "driver-pwa", "admin-pwa")

foreach ($pwa in $pwas) {
    $envFile = Join-Path $PSScriptRoot $pwa ".env"
    $envContent = @"
VITE_SUPABASE_URL=$supabaseUrl
VITE_SUPABASE_ANON_KEY=$AnonKey
"@
    
    Write-Host "Creating .env for $pwa..." -ForegroundColor Green
    $envContent | Out-File -FilePath $envFile -Encoding utf8 -NoNewline
    Write-Host "✅ Created $envFile" -ForegroundColor Green
}

Write-Host "`n✅ All environment files created!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Start each PWA with: npm run dev" -ForegroundColor Cyan
Write-Host "2. Test registration and login" -ForegroundColor Cyan
Write-Host "3. Test booking a ride (rider) and accepting (driver)" -ForegroundColor Cyan


