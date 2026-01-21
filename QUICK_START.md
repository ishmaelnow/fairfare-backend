# Quick Start Guide

Get your backend running in 5 minutes!

## Prerequisites Check

- [ ] Python 3.8+ installed (`python --version`)
- [ ] PostgreSQL installed and running
- [ ] pip installed

## Step-by-Step Setup

### 1. Navigate to Backend Directory

```bash
cd C:\Users\koshi\cursor-apps\react-frontend-backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # macOS/Linux
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set Up Database

#### Option A: Using PowerShell Script (Windows)

```powershell
.\setup_db.ps1
```

#### Option B: Using Bash Script (macOS/Linux)

```bash
chmod +x setup_db.sh
./setup_db.sh
```

#### Option C: Manual Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ride_app_db;

# Exit
\q
```

### 5. Configure Environment Variables

```bash
# Copy example file
copy .env.example .env  # Windows
# or
cp .env.example .env    # macOS/Linux
```

Edit `.env` and update your PostgreSQL password:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ride_app_db
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
```

### 6. Run the Backend

**IMPORTANT:** Make sure your virtual environment is activated before running!

#### Option A: Use the helper script (Recommended)

**Windows PowerShell:**
```powershell
.\run.ps1
```

**Windows Command Prompt:**
```cmd
run.bat
```

#### Option B: Manual activation

```bash
# Activate virtual environment first
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # macOS/Linux

# Then run the app
python app.py
```

**Note:** If you see `ModuleNotFoundError: No module named 'flask'`, it means the virtual environment is not activated. Make sure you see `(venv)` in your terminal prompt before running `python app.py`.

You should see:
```
Database tables created successfully!
 * Running on http://0.0.0.0:8001
```

### 7. Test the API

Open another terminal and test:

```bash
# Health check
curl http://localhost:8001/api/health

# Register a user
curl -X POST http://localhost:8001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

## Connect Frontend

Update your React frontend `.env` file:

```env
REACT_APP_API_BASE_URL=http://localhost:8001
```

Then start your React app:

```bash
cd C:\Users\koshi\cursor-apps\react-frontend
npm start
```

## Troubleshooting

### Port 8001 Already in Use

Change the port in `app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=8002)
```

### Database Connection Error

1. Check PostgreSQL is running:
   ```bash
   # Windows
   Get-Service postgresql*
   
   # macOS/Linux
   sudo systemctl status postgresql
   ```

2. Verify database exists:
   ```bash
   psql -U postgres -l
   ```

3. Check `.env` file has correct credentials

### Module Not Found Error

Make sure virtual environment is activated and dependencies are installed:
```bash
pip install -r requirements.txt
```

## Next Steps

1. ✅ Backend is running
2. ✅ Frontend is connected
3. 📝 Test user registration and login
4. 📝 Test ride booking
5. 📝 Test driver signup

## API Endpoints Reference

- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login user
- `POST /api/rides` - Book a ride (requires auth)
- `GET /api/users/rides` - Get user rides (requires auth)
- `POST /api/users/become-driver` - Apply as driver (requires auth)
- `GET /api/drivers` - List all drivers
- `GET /api/health` - Health check

See `README.md` for full API documentation.

