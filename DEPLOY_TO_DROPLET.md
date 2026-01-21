# Deploy Backend to DigitalOcean Droplet

Complete guide to deploy your Flask backend API to a DigitalOcean Droplet.

## 🎯 Prerequisites

- ✅ DigitalOcean Droplet (Ubuntu server)
- ✅ SSH access to your Droplet
- ✅ Domain name (optional, but recommended)
- ✅ PostgreSQL installed (or use SQLite for quick start)

---

## 📋 Step-by-Step Deployment

### Step 1: Prepare Your Code

**On your local machine:**

1. **Make sure code is committed:**
   ```bash
   cd C:\Users\koshi\cursor-apps\react-frontend-backend
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create production `.env` file** (don't commit this):
   ```env
   SECRET_KEY=your-production-secret-key-here-change-this
   JWT_SECRET_KEY=your-production-jwt-secret-key-here-change-this
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ride_app_db
   FLASK_ENV=production
   FLASK_DEBUG=False
   ```

---

### Step 2: SSH into Your Droplet

**From PowerShell:**

```bash
ssh root@YOUR_DROPLET_IP
# or
ssh ishmael@YOUR_DROPLET_IP
```

**Find your Droplet IP:**
1. Go to https://cloud.digitalocean.com
2. Click on your Droplet
3. Copy the IPv4 address

---

### Step 3: Install Required Software

**On your Droplet:**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3 and pip
sudo apt install python3 python3-pip python3-venv -y

# Install PostgreSQL (if not already installed)
sudo apt install postgresql postgresql-contrib -y

# Install Git (if not already installed)
sudo apt install git -y

# Install Nginx (for reverse proxy - optional but recommended)
sudo apt install nginx -y

# Install Gunicorn (production WSGI server)
pip3 install gunicorn
```

---

### Step 4: Clone/Pull Your Code

**On your Droplet:**

```bash
# Navigate to home directory
cd ~

# Clone repository (if first time)
git clone YOUR_GITHUB_REPO_URL react-frontend-backend
# OR if repository already exists:
cd react-frontend-backend
git pull origin main
```

**If you don't have a GitHub repo yet:**
```bash
# Create directory
mkdir -p ~/react-frontend-backend
cd ~/react-frontend-backend

# You'll need to upload files manually or set up Git repo
```

---

### Step 5: Set Up PostgreSQL Database

**On your Droplet:**

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database
CREATE DATABASE ride_app_db;

# Create user (optional, or use postgres user)
CREATE USER rideapp_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ride_app_db TO rideapp_user;

# Exit PostgreSQL
\q
```

---

### Step 6: Set Up Python Virtual Environment

**On your Droplet:**

```bash
cd ~/react-frontend-backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install gunicorn  # Production WSGI server
```

---

### Step 7: Configure Environment Variables

**On your Droplet:**

```bash
cd ~/react-frontend-backend

# Create .env file
nano .env
```

**Add these values:**
```env
SECRET_KEY=your-production-secret-key-change-this
JWT_SECRET_KEY=your-production-jwt-secret-key-change-this
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ride_app_db
FLASK_ENV=production
FLASK_DEBUG=False
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

**Generate secure keys:**
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
# Use output for SECRET_KEY and JWT_SECRET_KEY
```

---

### Step 8: Initialize Database

**On your Droplet:**

```bash
cd ~/react-frontend-backend
source venv/bin/activate

# Run Python to initialize database
python3 -c "from app import app; from database import db; app.app_context().push(); db.create_all(); print('Database initialized!')"
```

---

### Step 9: Test the Backend

**On your Droplet:**

```bash
cd ~/react-frontend-backend
source venv/bin/activate

# Test if backend runs
python3 app.py
```

**Expected:** Should see "Running on http://0.0.0.0:8001"

**Press Ctrl+C to stop**

---

### Step 10: Set Up Gunicorn (Production Server)

**On your Droplet:**

```bash
cd ~/react-frontend-backend
source venv/bin/activate

# Test Gunicorn
gunicorn -w 4 -b 0.0.0.0:8001 app:app
```

**Expected:** Backend should be running

**Press Ctrl+C to stop**

---

### Step 11: Create Systemd Service (Auto-start on Boot)

**On your Droplet:**

```bash
sudo nano /etc/systemd/system/rideapp-backend.service
```

**Add this content:**

```ini
[Unit]
Description=FairFare Ride App Backend
After=network.target postgresql.service

[Service]
User=root
Group=root
WorkingDirectory=/root/react-frontend-backend
Environment="PATH=/root/react-frontend-backend/venv/bin"
ExecStart=/root/react-frontend-backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:8001 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

**Adjust paths if your user is not `root`:**

If your user is `ishmael`:
- Change `/root/` to `/home/ishmael/`
- Change `User=root` to `User=ishmael`

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

**Enable and start service:**

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service (starts on boot)
sudo systemctl enable rideapp-backend

# Start service
sudo systemctl start rideapp-backend

# Check status
sudo systemctl status rideapp-backend
```

**Expected:** Should show "active (running)"

---

### Step 12: Configure Nginx (Reverse Proxy)

**On your Droplet:**

```bash
sudo nano /etc/nginx/sites-available/rideapp-backend
```

**Add this configuration:**

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN.com api.YOUR_DOMAIN.com;

    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        return 404;
    }
}
```

**Replace `YOUR_DOMAIN.com` with your actual domain**

**Enable the site:**

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/rideapp-backend /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

### Step 13: Set Up SSL Certificate (HTTPS)

**On your Droplet:**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d YOUR_DOMAIN.com -d api.YOUR_DOMAIN.com

# Follow prompts to enter email and agree to terms
```

**Auto-renewal is set up automatically**

---

### Step 14: Update CORS for Production

**On your Droplet:**

Edit `app.py` to include your production domains:

```python
CORS(app, origins=[
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "https://YOUR_DOMAIN.com",
    "https://rider.YOUR_DOMAIN.com",
    "https://driver.YOUR_DOMAIN.com",
    "https://admin.YOUR_DOMAIN.com"
])
```

**Then restart:**

```bash
sudo systemctl restart rideapp-backend
```

---

### Step 15: Test Your Deployment

**From your local machine:**

```bash
# Test health endpoint
curl https://YOUR_DOMAIN.com/api/health

# Test registration
curl -X POST https://YOUR_DOMAIN.com/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

---

## 🔧 Useful Commands

### Check Backend Status
```bash
sudo systemctl status rideapp-backend
```

### View Backend Logs
```bash
sudo journalctl -u rideapp-backend -f
```

### Restart Backend
```bash
sudo systemctl restart rideapp-backend
```

### Stop Backend
```bash
sudo systemctl stop rideapp-backend
```

### Check Nginx Status
```bash
sudo systemctl status nginx
```

### View Nginx Logs
```bash
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 Updating the Backend

**When you make changes:**

```bash
# SSH into Droplet
ssh root@YOUR_DROPLET_IP

# Navigate to project
cd ~/react-frontend-backend

# Pull latest code
git pull origin main

# Activate virtual environment
source venv/bin/activate

# Install new dependencies (if any)
pip install -r requirements.txt

# Restart backend
sudo systemctl restart rideapp-backend

# Check status
sudo systemctl status rideapp-backend
```

---

## 🐛 Troubleshooting

### Backend Not Starting

```bash
# Check logs
sudo journalctl -u rideapp-backend -n 50

# Check if port is in use
sudo netstat -tulpn | grep 8001

# Test manually
cd ~/react-frontend-backend
source venv/bin/activate
python3 app.py
```

### Database Connection Error

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
sudo -u postgres psql -d ride_app_db

# Check .env file has correct DATABASE_URL
cat ~/react-frontend-backend/.env
```

### Nginx 502 Bad Gateway

```bash
# Check backend is running
sudo systemctl status rideapp-backend

# Check backend logs
sudo journalctl -u rideapp-backend -n 50

# Test backend directly
curl http://127.0.0.1:8001/api/health
```

---

## ✅ Deployment Checklist

- [ ] Code pushed to Git
- [ ] SSH access to Droplet
- [ ] Python 3 and pip installed
- [ ] PostgreSQL installed and database created
- [ ] Virtual environment created
- [ ] Dependencies installed
- [ ] .env file configured
- [ ] Database initialized
- [ ] Gunicorn installed
- [ ] Systemd service created and enabled
- [ ] Nginx configured
- [ ] SSL certificate installed
- [ ] CORS updated for production domains
- [ ] Backend tested and running
- [ ] Frontend PWAs updated with production API URL

---

## 🚀 Quick Deployment Script

Save this as `deploy.sh` on your Droplet:

```bash
#!/bin/bash
cd ~/react-frontend-backend
source venv/bin/activate
git pull origin main
pip install -r requirements.txt
sudo systemctl restart rideapp-backend
echo "Deployment complete!"
```

**Make it executable:**
```bash
chmod +x deploy.sh
```

**Run it:**
```bash
./deploy.sh
```

---

## 📝 Next Steps After Deployment

1. **Update Frontend PWAs** - Change API URL to production
2. **Test All Endpoints** - Verify everything works
3. **Set Up Monitoring** - Monitor backend health
4. **Backup Database** - Set up regular backups
5. **Add Admin Authentication** - Secure admin endpoints

---

**Your backend will be live at:** `https://YOUR_DOMAIN.com/api`

🎉 **Ready to deploy!** 🎉

