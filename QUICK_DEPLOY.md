# Quick Deploy Guide - Backend to Droplet

## 🚀 Fastest Way to Deploy

### Option 1: If You Already Have a Droplet Set Up

1. **SSH into Droplet:**
   ```bash
   ssh root@YOUR_DROPLET_IP
   ```

2. **Navigate to project (or clone if first time):**
   ```bash
   cd ~/react-frontend-backend
   # OR if first time:
   git clone YOUR_REPO_URL react-frontend-backend
   cd react-frontend-backend
   ```

3. **Set up environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   pip install gunicorn
   ```

4. **Create .env file:**
   ```bash
   nano .env
   ```
   Add:
   ```env
   SECRET_KEY=generate-with-python-secrets-token_hex-32
   JWT_SECRET_KEY=generate-different-key
   DATABASE_URL=postgresql://postgres:password@localhost:5432/ride_app_db
   FLASK_ENV=production
   FLASK_DEBUG=False
   ```

5. **Initialize database:**
   ```bash
   python3 -c "from app import app; from database import db; app.app_context().push(); db.create_all()"
   ```

6. **Create systemd service:**
   ```bash
   sudo nano /etc/systemd/system/rideapp-backend.service
   ```
   Paste:
   ```ini
   [Unit]
   Description=Ride App Backend
   After=network.target

   [Service]
   User=root
   WorkingDirectory=/root/react-frontend-backend
   Environment="PATH=/root/react-frontend-backend/venv/bin"
   ExecStart=/root/react-frontend-backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:8001 app:app
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

7. **Start service:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable rideapp-backend
   sudo systemctl start rideapp-backend
   sudo systemctl status rideapp-backend
   ```

8. **Configure Nginx:**
   ```bash
   sudo nano /etc/nginx/sites-available/rideapp-backend
   ```
   Paste:
   ```nginx
   server {
       listen 80;
       server_name YOUR_DOMAIN.com;

       location /api {
           proxy_pass http://127.0.0.1:8001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```
   ```bash
   sudo ln -s /etc/nginx/sites-available/rideapp-backend /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. **Done!** Backend should be running.

---

### Option 2: First Time Setup

Follow the complete guide in `DEPLOY_TO_DROPLET.md`

---

## 🔍 Quick Checks

```bash
# Is backend running?
sudo systemctl status rideapp-backend

# View logs
sudo journalctl -u rideapp-backend -f

# Test endpoint
curl http://localhost:8001/api/health

# Restart if needed
sudo systemctl restart rideapp-backend
```

---

## 📝 Important Notes

- **Change paths** if your user is not `root` (use `/home/username/` instead)
- **Update CORS** in `app.py` with your production domains
- **Use PostgreSQL** in production (not SQLite)
- **Set strong SECRET_KEY** and JWT_SECRET_KEY
- **Enable SSL** with Certbot for HTTPS

See `DEPLOY_TO_DROPLET.md` for complete detailed guide!

