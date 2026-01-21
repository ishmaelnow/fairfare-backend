# PowerShell script to set up PostgreSQL database for Windows

Write-Host "Setting up PostgreSQL database..." -ForegroundColor Green

# Database configuration
$DB_NAME = "ride_app_db"
$DB_USER = "postgres"
$DB_PASSWORD = "postgres"  # Change this to your PostgreSQL password

Write-Host "Creating database: $DB_NAME" -ForegroundColor Yellow

# Create database using psql
$env:PGPASSWORD = $DB_PASSWORD
psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;" 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database created successfully!" -ForegroundColor Green
} else {
    Write-Host "Database might already exist or there was an error." -ForegroundColor Yellow
    Write-Host "You can manually create it with: CREATE DATABASE $DB_NAME;" -ForegroundColor Yellow
}

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Copy .env.example to .env" -ForegroundColor White
Write-Host "2. Update DATABASE_URL in .env with your PostgreSQL credentials" -ForegroundColor White
Write-Host "3. Run: python app.py" -ForegroundColor White

