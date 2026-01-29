# 🔒 Safe Droplet Decoupling Plan

## Current State Analysis

### What's Running on Droplet:
1. **Nginx** - Serving static files (landing page, PWAs)
2. **Python Flask Backend** - Port 8001 (likely redundant now)
3. **SSL Certificates** - Let's Encrypt (via Certbot)
4. **Domain DNS** - Points to droplet IP

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
# Find backend code
find ~ -name "*.py" -path "*/app.py" -o -name "requirements.txt" | head -10
ls -la ~/fairfare-pwas/
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

# Backup backend code (if exists)
cp -r ~/fairfare-pwas/backend ./ 2>/dev/null || true

# Create documentation file
cat > README.txt << EOF
Droplet Backup - $(date)
IP: 157.245.231.224
Backup created before decoupling from FairFare PWAs

Services that were running:
- Nginx (serving static files)
- Python Flask backend (port 8001) - if found

To restore:
1. Restore nginx configs from nginx-backup/
2. Restore backend code if needed
3. Restart services: sudo systemctl restart nginx
EOF
```

---

### Phase 2: Stop Services (SAFELY)

**1. Stop Flask Backend (if running):**
```bash
# Find and stop Flask process
sudo pkill -f "flask\|gunicorn\|python.*app.py"

# Or if using systemd service:
sudo systemctl stop fairfare-backend 2>/dev/null || true
sudo systemctl disable fairfare-backend 2>/dev/null || true
```

**2. Stop Nginx (optional - can keep running for other purposes):**
```bash
# Option A: Stop nginx completely
sudo systemctl stop nginx
sudo systemctl disable nginx

# Option B: Keep nginx running but remove site configs (safer)
# This keeps nginx available for future use
sudo rm /etc/nginx/sites-enabled/default
sudo rm /etc/nginx/sites-enabled/fairfare* 2>/dev/null || true
sudo nginx -t  # Test config
sudo systemctl reload nginx
```

**3. Verify services stopped:**
```bash
# Check nothing is listening on port 80, 443, 8001
sudo netstat -tlnp | grep -E ":(80|443|8001)"
```

---

### Phase 3: Update DNS (Point to Netlify)

**Before doing this, make sure all Netlify sites are working!**

**1. Get Netlify URLs:**
- Landing PWA: `landing-pwa-xyz.netlify.app`
- Rider PWA: `rider-pwa.netlify.app`
- Driver PWA: `driver-pwa.netlify.app`
- Admin PWA: `admin-pwas.netlify.app`

**2. Update DNS Records:**

Go to your domain registrar (where you bought `fairfaretransportation.app`):

**Option A: Point main domain to landing page**
```
Type: CNAME
Name: @ (or fairfaretransportation.app)
Value: landing-pwa-xyz.netlify.app
TTL: 3600
```

**Option B: Point subdomains to respective PWAs**
```
Type: CNAME
Name: rider
Value: rider-pwa.netlify.app
TTL: 3600

Type: CNAME
Name: driver
Value: driver-pwa.netlify.app
TTL: 3600

Type: CNAME
Name: admin
Value: admin-pwas.netlify.app
TTL: 3600
```

**3. Configure in Netlify:**
- Go to each Netlify site → Domain settings
- Add custom domain
- Netlify will provide DNS records if needed

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

