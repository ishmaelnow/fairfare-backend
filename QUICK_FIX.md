# Quick Fix: Database Connection Error

## The Problem

You're seeing: `connection to server at "localhost" (::1), port 5432 failed: Connection refused`

This means PostgreSQL is not installed or not running.

## Quick Solution: Use SQLite (No Installation Needed)

The backend is now configured to use SQLite by default, which requires no installation!

### Steps:

1. **Make sure `.env` file exists:**
   ```powershell
   cd C:\Users\koshi\cursor-apps\react-frontend-backend
   # .env should already exist (I created it)
   ```

2. **Update `.env` to use SQLite:**
   ```env
   DATABASE_URL=sqlite:///ride_app.db
   ```

3. **Run the backend:**
   ```powershell
   .\venv\Scripts\Activate.ps1
   python app.py
   ```

That's it! The backend will create a `ride_app.db` file automatically.

## For Production: Install PostgreSQL

When you're ready for production, install PostgreSQL and update `.env`:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ride_app_db
```

See `POSTGRESQL_SETUP.md` for detailed PostgreSQL installation instructions.

## Current Status

✅ Backend configured for SQLite (works immediately)  
✅ `.env` file created  
✅ Database will auto-create on first run  

Just run `python app.py` and it should work!

