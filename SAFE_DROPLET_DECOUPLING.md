# 🔒 Safe Droplet Decoupling Plan

## Current State Analysis

### What's Running on Droplet:
1. **Nginx** - Serving static files (landing page, PWAs)
2. **TWO Python Backends Found:**
   - **Port 8000**: `globapp-backend` (uvicorn) - `/home/ishmael/globapp-backend/.venv/bin/python -m uvicorn app:app --host 127.0.0.1 --port 8000`
   - **Port 8001**: `fairfare-backend` (gunicorn) - `/opt/fairfare-backend/venv/bin/python3 /opt/fairfare-backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:8001 app:app`
3. **PostgreSQL** - Port 5432 (local database)
4. **SSL Certificates** - Let's Encrypt (via Certbot)
5. **Domain DNS** - Points to droplet IP

**Note:** The nginx config shown is for `globapp.app`. We need to check the config for `fairfaretransportation.app`.

### Nginx Configuration Found:
- **Active Config**: `/etc/nginx/sites-enabled/fairfaretransportation.app` → `/etc/nginx/sites-available/fairfaretransportation.app`
- **Backend Proxy**: All `/api/` requests → `http://127.0.0.1:8001` (fairfare-backend)
- **Static Files**: Served from `/var/www/fairfare/` directories:
  - Landing: `/var/www/fairfare/landing`
  - Admin: `/var/www/fairfare/admin`
  - Driver: `/var/www/fairfare/driver`
  - Rider: `/var/www/fairfare/rider`
- **Domains Configured**:
  - `fairfaretransportation.app` (landing + API)
  - `www.fairfaretransportation.app` (landing + API)
  - `api.fairfaretransportation.app` (API only)
  - `admin.fairfaretransportation.app` (Admin PWA)
  - `driver.fairfaretransportation.app` (Driver PWA)
  - `rider.fairfaretransportation.app` (Rider PWA)

### Backend Locations:
- **fairfare-backend**: `/opt/fairfare-backend/` (Gunicorn on port 8001) - **THIS IS REDUNDANT NOW**
- **globapp-backend**: `/home/ishmael/globapp-backend/` (Uvicorn on port 8000) - Different project, leave alone

### What's Now on Netlify:
- ✅ Landing PWA
- ✅ Rider PWA  
- ✅ Driver PWA
- ✅ Admin PWA

### What's Now on Supabase:
- ✅ Database
- ✅ Authentication
- ✅ Backend API (Edge Functions)
- ✅ Real-time subscriptions

---

## 🛡️ SAFE DECOUPLING STEPS

### Phase 1: Document Current State (DO THIS FIRST!)

**SSH into droplet:**
```bash
ssh ishmael@157.245.231.224
```

**1. Check running services:**
```bash
# Check what's running
sudo systemctl list-units --type=service --state=running | grep -E "(nginx|flask|python|gunicorn)"

# Check nginx status
sudo systemctl status nginx

# Check if Flask backend is running
sudo netstat -tlnp | grep 8001
ps aux | grep -E "(flask|python|gunicorn)"
```

**2. Document nginx configuration:**
```bash
# Backup nginx config
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d)
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%Y%m%d)

# View current config
cat /etc/nginx/sites-available/default
```

**3. Document backend location:**
```bash
# FairFare backend location (confirmed)
ls -la /opt/fairfare-backend/
cat /opt/fairfare-backend/app.py 2>/dev/null | head -20
cat /opt/fairfare-backend/requirements.txt 2>/dev/null || echo "No requirements.txt"

# Check for any other FairFare-related code
ls -la ~/fairfare-pwas/ 2>/dev/null || echo "No ~/fairfare-pwas directory"
```

**4. Create backup of important files:**
```bash
# Create backup directory
mkdir -p ~/droplet-backup-$(date +%Y%m%d)
cd ~/droplet-backup-$(date +%Y%m%d)

# Backup nginx configs
sudo cp -r /etc/nginx/ ./nginx-backup/

# Backup any environment files
cp ~/fairfare-pwas/.env* ./ 2>/dev/null || true

# Backup FairFare backend code (confirmed location)
sudo cp -r /opt/fairfare-backend ./fairfare-backend-backup 2>/dev/null || echo "Backend backup failed"

# Backup static files (if you want to keep them)
sudo cp -r /var/www/fairfare ./static-files-backup 2>/dev/null || echo "Static files backup failed"

# Create documentation file
cat > README.txt << EOF
Droplet Backup - $(date)
IP: 157.245.231.224
Backup created before decoupling from FairFare PWAs

Services that were running:
- Nginx (serving static files from /var/www/fairfare/)
- FairFare Backend: Gunicorn on port 8001 (/opt/fairfare-backend/)
- Static files locations:
  - Landing: /var/www/fairfare/landing
  - Admin: /var/www/fairfare/admin
  - Driver: /var/www/fairfare/driver
  - Rider: /var/www/fairfare/rider

To restore:
1. Restore nginx configs from nginx-backup/
2. Restore backend code if needed
3. Restart services: sudo systemctl restart nginx
EOF
```

---

### Phase 2: Stop Services (SAFELY)

**1. Stop FairFare Backend (Port 8001) - Gunicorn:**
```bash
# Find the gunicorn process for fairfare-backend
ps aux | grep "fairfare-backend.*gunicorn" | grep -v grep

# Stop gunicorn processes (they're running under /opt/fairfare-backend/)
sudo pkill -f "/opt/fairfare-backend.*gunicorn"

# Verify it's stopped
sudo ss -tlnp | grep 8001
# Should show nothing (or only other services)

# Check if there's a systemd service
sudo systemctl list-units --all | grep fairfare
sudo systemctl stop fairfare-backend 2>/dev/null || true
sudo systemctl disable fairfare-backend 2>/dev/null || true
```

**⚠️ IMPORTANT:** Do NOT stop the globapp-backend (port 8000) - that's a different project!

**2. Disable FairFare Nginx Configs (Keep Nginx Running for globapp):**
```bash
# Option A: Disable only FairFare configs (RECOMMENDED - keeps globapp running)
# This keeps nginx available for globapp.app
sudo rm /etc/nginx/sites-enabled/fairfaretransportation.app
sudo rm /etc/nginx/sites-enabled/fairfare-backend 2>/dev/null || true
sudo nginx -t  # Test config (should still work for globapp)
sudo systemctl reload nginx

# Option B: Stop nginx completely (only if you don't need globapp either)
# sudo systemctl stop nginx
# sudo systemctl disable nginx
```

**⚠️ IMPORTANT:** Option A is safer - it keeps globapp.app working while disabling FairFare.

**3. Verify services stopped:**
```bash
# Check nothing is listening on port 80, 443, 8001
sudo netstat -tlnp | grep -E ":(80|443|8001)"
```

---

### Phase 3: Update DNS (Point to Netlify)

**⚠️ IMPORTANT:** Before starting, ensure all Netlify sites are deployed and working!

---

#### Step 1: Find Your Netlify Site URLs

Go to [Netlify Dashboard](https://app.netlify.com) and note the **default Netlify URLs** for each site:

1. **Landing PWA**: `https://[your-site-name].netlify.app`
2. **Rider PWA**: `https://[your-site-name].netlify.app`
3. **Driver PWA**: `https://[your-site-name].netlify.app`
4. **Admin PWA**: `https://[your-site-name].netlify.app`

**Write these down - you'll need them!**

---

#### Step 2: Configure Custom Domains in Netlify

For **each** Netlify site, add custom domains:

**A. Landing PWA Site:**
1. Go to Site Settings → Domain management
2. Click "Add custom domain"
3. Enter: `fairfaretransportation.app`
4. Enter: `www.fairfaretransportation.app`
5. Netlify will show you DNS records (save them!)

**B. Rider PWA Site:**
1. Go to Site Settings → Domain management
2. Click "Add custom domain"
3. Enter: `rider.fairfaretransportation.app`
4. Netlify will show DNS records

**C. Driver PWA Site:**
1. Go to Site Settings → Domain management
2. Click "Add custom domain"
3. Enter: `driver.fairfaretransportation.app`
4. Netlify will show DNS records

**D. Admin PWA Site:**
1. Go to Site Settings → Domain management
2. Click "Add custom domain"
3. Enter: `admin.fairfaretransportation.app`
4. Netlify will show DNS records

**⚠️ Note:** Netlify will show DNS records like:
```
Type: CNAME
Name: @ (or subdomain name)
Value: [site-name].netlify.app
```

---

#### Step 3: Update DNS at Domain Registrar

Go to your domain registrar (where you bought `fairfaretransportation.app`):

**Common registrars:** Namecheap, GoDaddy, Google Domains, Cloudflare, etc.

**Remove OLD DNS Records (if any):**
- Remove any A records pointing to droplet IP: `157.245.231.224`
- Remove any CNAME records pointing to droplet

**Add NEW DNS Records:**

**For Root Domain (fairfaretransportation.app):**
```
Type: CNAME
Name: @ (or leave blank, or "fairfaretransportation.app")
Value: [your-landing-pwa-site].netlify.app
TTL: 3600 (or Auto)
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: [your-landing-pwa-site].netlify.app
TTL: 3600
```

**For Rider subdomain:**
```
Type: CNAME
Name: rider
Value: [your-rider-pwa-site].netlify.app
TTL: 3600
```

**For Driver subdomain:**
```
Type: CNAME
Name: driver
Value: [your-driver-pwa-site].netlify.app
TTL: 3600
```

**For Admin subdomain:**
```
Type: CNAME
Name: admin
Value: [your-admin-pwa-site].netlify.app
TTL: 3600
```

**⚠️ Important Notes:**
- Some registrars don't allow CNAME on root domain (@). If so, use Netlify's A records instead (Netlify will provide these).
- DNS propagation takes 24-48 hours, but often works within minutes.
- You can check propagation with: `dig fairfaretransportation.app` or `nslookup fairfaretransportation.app`

---

#### Step 4: Verify DNS in Netlify

After adding DNS records:

1. Go back to each Netlify site → Domain settings
2. Netlify will show "DNS configuration detected" when it sees your DNS records
3. SSL certificates will be automatically provisioned (can take a few minutes)

---

#### Step 5: Update Supabase Redirect URLs

Go to [Supabase Dashboard](https://app.supabase.com) → Your Project → Authentication → URL Configuration:

**Add these Redirect URLs:**
```
https://fairfaretransportation.app
https://www.fairfaretransportation.app
https://rider.fairfaretransportation.app
https://driver.fairfaretransportation.app
https://admin.fairfaretransportation.app
```

**Add these Site URLs:**
```
https://fairfaretransportation.app
https://rider.fairfaretransportation.app
https://driver.fairfaretransportation.app
https://admin.fairfaretransportation.app
```

**Save changes!**

---

### Phase 4: Verify Everything Works

**1. Test Netlify sites directly:**
- Landing: `https://landing-pwa-xyz.netlify.app`
- Rider: `https://rider-pwa.netlify.app`
- Driver: `https://driver-pwa.netlify.app`
- Admin: `https://admin-pwas.netlify.app`

**2. After DNS propagates (24-48 hours):**
- Test: `https://fairfaretransportation.app`
- Test: `https://rider.fairfaretransportation.app`
- Test: `https://driver.fairfaretransportation.app`

**3. Verify Supabase redirect URLs:**
- Update Supabase → Authentication → URL Configuration
- Add all new Netlify URLs

---

### Phase 5: Keep Droplet Safe (For Repurposing)

**1. Create a simple "maintenance" page (optional):**
```bash
# Create a simple HTML page
sudo mkdir -p /var/www/maintenance
sudo tee /var/www/maintenance/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Maintenance Mode</title>
    <style>
        body { font-family: Arial; text-align: center; padding: 50px; }
    </style>
</head>
<body>
    <h1>Service Temporarily Unavailable</h1>
    <p>This server is being repurposed.</p>
    <p>Please visit our new location.</p>
</body>
</html>
EOF

# Update nginx to serve maintenance page
sudo tee /etc/nginx/sites-available/maintenance << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name _;
    root /var/www/maintenance;
    index index.html;
}
EOF

sudo ln -sf /etc/nginx/sites-available/maintenance /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

**2. Document droplet state:**
```bash
# Create a README on the droplet
cat > ~/DROPLET_STATUS.txt << EOF
Droplet Status: DECOUPLED
Date: $(date)
IP: 157.245.231.224

Services Status:
- Nginx: STOPPED/DISABLED (or serving maintenance page)
- Flask Backend: STOPPED
- SSL Certificates: PRESERVED (can be reused)

Backup Location: ~/droplet-backup-$(date +%Y%m%d)

To repurpose:
1. Restore from backup if needed
2. Install new services
3. Update DNS if using this IP
EOF
```

---

## ✅ Safety Checklist

Before decoupling:
- [ ] All PWAs working on Netlify
- [ ] All features tested (auth, booking, payments)
- [ ] Backup created on droplet
- [ ] DNS records documented
- [ ] Supabase URLs updated

During decoupling:
- [ ] Services stopped (not deleted)
- [ ] Configs backed up
- [ ] DNS updated to point to Netlify
- [ ] Droplet left running (for repurposing)

After decoupling:
- [ ] All sites accessible via Netlify URLs
- [ ] DNS propagated (check with `dig` or `nslookup`)
- [ ] Custom domains working
- [ ] Droplet can be repurposed later

---

## 🎯 Final State

**Active:**
- ✅ Netlify (all PWAs)
- ✅ Supabase (backend)
- ✅ Stripe (payments)

**Inactive but Preserved:**
- 🔒 Droplet (running but not serving traffic)
- 🔒 Old backend code (backed up)
- 🔒 Nginx configs (backed up)

**Result:**
- 💰 Save $6-12/month on droplet
- 🚀 Simpler architecture
- 🔄 Can repurpose droplet anytime

---

## 🆘 Rollback Plan (If Needed)

If something goes wrong:

1. **Restore nginx config:**
   ```bash
   sudo cp /etc/nginx/sites-available/default.backup.* /etc/nginx/sites-available/default
   sudo systemctl restart nginx
   ```

2. **Restart backend (if needed):**
   ```bash
   cd ~/fairfare-pwas/backend
   # Restart Flask/gunicorn
   ```

3. **Revert DNS:**
   - Point back to droplet IP in domain registrar

---

**Ready to proceed? Start with Phase 1 (Document Current State)!**

---

## ✅ Phase 1 & 2 COMPLETED (2026-01-30)

**Phase 1 - Documentation:**
- ✅ Backup created: `~/droplet-backup-20260130/`
- ✅ Backend code backed up: `fairfare-backend-backup/`
- ✅ Nginx configs backed up: `fairfare-nginx-config`, `fairfare-backend-nginx-config`
- ✅ README.txt created with restoration instructions

**Phase 2 - Services Stopped:**
- ✅ FairFare backend (port 8001) stopped
- ✅ FairFare nginx configs disabled (symlinks removed)
- ✅ Nginx still running (for globapp.app)
- ✅ globapp-backend still running (port 8000) - untouched

**Current State:**
- 🔴 FairFare services: **STOPPED**
- 🟢 globapp services: **RUNNING** (untouched)
- 🟢 Droplet: **PRESERVED** (ready for repurposing)

**Next Steps:**
- Phase 3: Update DNS to point to Netlify (when ready)
- Phase 4: Verify Netlify sites work with custom domains

