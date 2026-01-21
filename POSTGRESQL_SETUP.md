# PostgreSQL Setup Guide for Windows

## Option 1: Install PostgreSQL (Recommended)

### Download and Install

1. **Download PostgreSQL:**
   - Go to: https://www.postgresql.org/download/windows/
   - Or use the installer: https://www.postgresql.org/download/windows/installer/
   - Download PostgreSQL 15 or 16 (latest stable version)

2. **Run the Installer:**
   - Run the downloaded `.exe` file
   - Choose installation directory (default is fine)
   - **Important:** Remember the password you set for the `postgres` superuser!
   - Port: 5432 (default)
   - Locale: Default

3. **Verify Installation:**
   ```powershell
   # Check if PostgreSQL service is running
   Get-Service -Name "*postgres*"
   
   # Or check in Services app:
   # Win+R → services.msc → Look for "postgresql-x64-XX"
   ```

4. **Create Database:**
   ```powershell
   # Option A: Using pgAdmin (GUI tool installed with PostgreSQL)
   # Open pgAdmin → Connect to server → Right-click Databases → Create → Database
   # Name: ride_app_db
   
   # Option B: Using psql command line
   psql -U postgres
   CREATE DATABASE ride_app_db;
   \q
   ```

5. **Update .env file:**
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ride_app_db
   ```

### Start PostgreSQL Service

If PostgreSQL is installed but not running:

```powershell
# Start PostgreSQL service
Start-Service postgresql-x64-15  # Adjust version number if different

# Or use Services GUI:
# Win+R → services.msc → Find PostgreSQL → Right-click → Start
```

## Option 2: Use SQLite (Quick Start - No Installation)

If you want to get started quickly without installing PostgreSQL, you can use SQLite temporarily:

1. **Update `app.py`** - Change the database URL:
   ```python
   app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
       'DATABASE_URL',
       'sqlite:///ride_app.db'  # SQLite instead of PostgreSQL
   )
   ```

2. **Update `.env`**:
   ```env
   DATABASE_URL=sqlite:///ride_app.db
   ```

**Note:** SQLite is fine for development, but PostgreSQL is recommended for production.

## Option 3: Use Docker (Advanced)

If you have Docker installed:

```powershell
# Run PostgreSQL in Docker
docker run --name postgres-ride-app `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=ride_app_db `
  -p 5432:5432 `
  -d postgres:15

# Create .env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ride_app_db
```

## Troubleshooting

### "Connection refused" Error

1. **Check if PostgreSQL is running:**
   ```powershell
   Get-Service -Name "*postgres*"
   ```

2. **Start PostgreSQL service:**
   ```powershell
   Start-Service postgresql-x64-15
   ```

3. **Check if port 5432 is in use:**
   ```powershell
   netstat -an | findstr 5432
   ```

### "psql: command not found"

PostgreSQL bin directory is not in PATH. Add it:
```powershell
# Find PostgreSQL installation (usually):
# C:\Program Files\PostgreSQL\15\bin

# Add to PATH temporarily:
$env:Path += ";C:\Program Files\PostgreSQL\15\bin"
```

### "Authentication failed"

Check your `.env` file has the correct password:
```env
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/ride_app_db
```

### Can't connect to database

1. Make sure PostgreSQL service is running
2. Verify database exists: `psql -U postgres -l`
3. Check `.env` file has correct connection string
4. Try connecting manually: `psql -U postgres -d ride_app_db`

## Quick Test

After setup, test the connection:

```powershell
cd C:\Users\koshi\cursor-apps\react-frontend-backend
.\venv\Scripts\Activate.ps1
python -c "from app import app; from database import db; app.app_context().push(); db.create_all(); print('Database connected!')"
```

