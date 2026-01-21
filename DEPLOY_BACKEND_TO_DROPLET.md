# Deploy Backend to Droplet - Step by Step

## 🎯 Goal
Deploy your local `react-frontend-backend` to the droplet's `fairfare-backend` directory.

---

## Step 1: Check Current Backend on Droplet

**On your Droplet, check what's currently there:**

```bash
# Check current backend directory
ls -la ~/fairfare-backend/

# Check if backend is running
ps aux | grep gunicorn
ps aux | grep python | grep app.py
sudo systemctl status rideapp-backend 2>/dev/null || echo "No systemd service found"
```

---

## Step 2: Choose Deployment Method

### Option A: Git (Recommended)

**If you have git repository:**

```bash
# On droplet
cd ~/fairfare-backend
git pull origin main
# or
git pull origin master
```

### Option B: Copy Files via SCP

**From your local machine (Windows PowerShell):**

```powershell
# Copy entire backend directory
scp -r C:\Users\koshi\cursor-apps\react-frontend-backend\* ishmael@YOUR_DROPLET_IP:~/fairfare-backend/

# Or copy specific files
scp C:\Users\koshi\cursor-apps\react-frontend-backend\app.py ishmael@YOUR_DROPLET_IP:~/fairfare-backend/
scp C:\Users\koshi\cursor-apps\react-frontend-backend\models.py ishmael@YOUR_DROPLET_IP:~/fairfare-backend/
scp C:\Users\koshi\cursor-apps\react-frontend-backend\database.py ishmael@YOUR_DROPLET_IP:~/fairfare-backend/
scp C:\Users\koshi\cursor-apps\react-frontend-backend\requirements.txt ishmael@YOUR_DROPLET_IP:~/fairfare-backend/
```

### Option C: Manual Edit on Droplet

**SSH into droplet and edit files directly:**

```bash
ssh ishmael@YOUR_DROPLET_IP
cd ~/fairfare-backend
nano app.py
# Make changes, save
```

---

## Step 3: Update .env File on Droplet

**On your Droplet, ensure .env has correct database URL:**

```bash
cd ~/fairfare-backend
nano .env
```

**Make sure it has:**

```env
DATABASE_URL=postgresql://fairfare_user:fairfare_pass@localhost:5432/fairfare_db
SECRET_KEY=your-production-secret-key-here
JWT_SECRET_KEY=your-production-jwt-secret-key-here
```

**Save and exit:** `Ctrl+X`, `Y`, `Enter`

---

## Step 4: Install/Update Dependencies

**On your Droplet:**

```bash
cd ~/fairfare-backend

# Activate virtual environment (if exists)
source venv/bin/activate
# or
. venv/bin/activate

# Install/update dependencies
pip install -r requirements.txt

# Or if no venv, create one:
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## Step 5: Test Backend Locally on Droplet

**Before starting service, test it:**

```bash
cd ~/fairfare-backend
source venv/bin/activate

# Test database connection
python3 -c "from app import app; from database import db; app.app_context().push(); print('Database connected!')"

# Test app starts
python3 app.py
# Press Ctrl+C to stop
```

---

## Step 6: Start Backend with Gunicorn

**On your Droplet:**

```bash
cd ~/fairfare-backend
source venv/bin/activate

# Start with Gunicorn
gunicorn -w 4 -b 127.0.0.1:8001 app:app

# Or create systemd service (recommended for production)
```

---

## Step 7: Create Systemd Service (Optional but Recommended)

**Create service file:**

```bash
sudo nano /etc/systemd/system/rideapp-backend.service
```

**Add this content:**

```ini
[Unit]
Description=FairFare Backend API
After=network.target postgresql.service

[Service]
User=ishmael
Group=ishmael
WorkingDirectory=/home/ishmael/fairfare-backend
Environment="PATH=/home/ishmael/fairfare-backend/venv/bin"
ExecStart=/home/ishmael/fairfare-backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:8001 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

**Enable and start service:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable rideapp-backend
sudo systemctl start rideapp-backend
sudo systemctl status rideapp-backend
```

---

## Step 8: Verify Backend is Running

**Test backend:**

```bash
# Test health endpoint
curl http://127.0.0.1:8001/api/health

# Test through Nginx
curl https://api.fairfaretransportation.app/health
```

---

## ✅ Checklist

- [ ] Backend files deployed to droplet
- [ ] .env file configured with correct DATABASE_URL
- [ ] Dependencies installed
- [ ] Backend tested locally
- [ ] Backend started with Gunicorn
- [ ] Systemd service created (optional)
- [ ] Backend accessible via API endpoint

---

**Start with Step 1 to check current state!** 🚀

