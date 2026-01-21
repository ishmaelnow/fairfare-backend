# Fix Missing SSL Certificates

## ❌ Error You're Seeing

```
cannot load certificate "/etc/letsencrypt/live/admin.fairfaretransportation.app/fullchain.pem": 
No such file or directory
```

---

## ✅ Step 1: Check Which Certificates Actually Exist

**On your Droplet, run:**

```bash
# List all certificate directories
sudo ls -la /etc/letsencrypt/live/

# Check each subdomain
sudo ls -la /etc/letsencrypt/live/api.fairfaretransportation.app/ 2>/dev/null && echo "✓ API cert exists" || echo "✗ API cert missing"
sudo ls -la /etc/letsencrypt/live/admin.fairfaretransportation.app/ 2>/dev/null && echo "✓ Admin cert exists" || echo "✗ Admin cert missing"
sudo ls -la /etc/letsencrypt/live/driver.fairfaretransportation.app/ 2>/dev/null && echo "✓ Driver cert exists" || echo "✗ Driver cert missing"
sudo ls -la /etc/letsencrypt/live/rider.fairfaretransportation.app/ 2>/dev/null && echo "✓ Rider cert exists" || echo "✗ Rider cert missing"
```

---

## 🔧 Step 2: Get Missing Certificates

**If any certificates are missing, get them:**

```bash
# Stop Nginx
sudo systemctl stop nginx

# Get missing certificates (replace with actual missing ones)
sudo certbot certonly --standalone -d admin.fairfaretransportation.app
sudo certbot certonly --standalone -d driver.fairfaretransportation.app
sudo certbot certonly --standalone -d rider.fairfaretransportation.app

# Start Nginx
sudo systemctl start nginx
```

---

## 🔍 Step 3: Check Certbot Logs

**See what certbot actually created:**

```bash
# Check certbot logs
sudo cat /var/log/letsencrypt/letsencrypt.log | tail -50

# Or check recent certificate requests
sudo certbot certificates
```

---

## 🎯 Quick Fix: Get All Certificates Again

**If certificates are missing, get them all:**

```bash
sudo systemctl stop nginx

# Get all certificates
sudo certbot certonly --standalone \
  -d api.fairfaretransportation.app \
  -d admin.fairfaretransportation.app \
  -d driver.fairfaretransportation.app \
  -d rider.fairfaretransportation.app

sudo systemctl start nginx

# Verify all exist
sudo ls -la /etc/letsencrypt/live/*.fairfaretransportation.app/
```

---

## 📝 Step 4: After Certificates Are Fixed

**Then test Nginx:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

**Run the check commands first to see which certificates are actually missing!** 🔍

