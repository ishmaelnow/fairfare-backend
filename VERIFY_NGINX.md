# Verify Nginx Configuration for api.fairfaretransportation.app

## 🔍 How to Check Your Current Nginx Config

### Step 1: SSH into Your Droplet

```bash
ssh ishmael@YOUR_DROPLET_IP
```

### Step 2: Check Existing Nginx Configuration

```bash
# List all Nginx sites
ls -la /etc/nginx/sites-available/
ls -la /etc/nginx/sites-enabled/

# Check if api.fairfaretransportation.app config exists
cat /etc/nginx/sites-available/api-fairfaretransportation
# or
cat /etc/nginx/sites-available/fairfaretransportation-api
# or check all configs
grep -r "api.fairfaretransportation.app" /etc/nginx/
```

### Step 3: Test Nginx Configuration

```bash
# Test Nginx syntax
sudo nginx -t

# If errors, check what's wrong
sudo nginx -T | grep -A 20 "api.fairfaretransportation"
```

### Step 4: Check if Site is Enabled

```bash
# Check enabled sites
ls -la /etc/nginx/sites-enabled/ | grep api

# If not enabled, enable it:
sudo ln -s /etc/nginx/sites-available/api-fairfaretransportation /etc/nginx/sites-enabled/
```

---

## ✅ What the Config Should Look Like

### Required Configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name api.fairfaretransportation.app;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/api.fairfaretransportation.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.fairfaretransportation.app/privkey.pem;

    # Proxy to backend
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Key Points to Verify:

1. ✅ **Server name** matches `api.fairfaretransportation.app`
2. ✅ **Proxy pass** points to `http://127.0.0.1:8001` (where backend runs)
3. ✅ **SSL certificates** are configured
4. ✅ **Location block** is `/api` (not `/`)
5. ✅ **Proxy headers** are set correctly

---

## 🔧 If Config Needs to be Created/Updated

### Option 1: Create New Config File

```bash
# Create config file
sudo nano /etc/nginx/sites-available/api-fairfaretransportation

# Paste the configuration from nginx-api-config.conf
# (Copy from the file I created)

# Enable the site
sudo ln -s /etc/nginx/sites-available/api-fairfaretransportation /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Option 2: Update Existing Config

```bash
# Edit existing config
sudo nano /etc/nginx/sites-available/YOUR_EXISTING_CONFIG

# Update server_name and proxy_pass
# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🧪 Test the Configuration

### From Your Droplet:

```bash
# Test backend is running
curl http://127.0.0.1:8001/api/health

# Test through Nginx (if SSL is set up)
curl https://api.fairfaretransportation.app/api/health

# Test from outside (HTTP redirect)
curl -I http://api.fairfaretransportation.app/api/health
```

### From Your Local Machine:

```bash
# Test API endpoint
curl https://api.fairfaretransportation.app/api/health

# Test registration
curl -X POST https://api.fairfaretransportation.app/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'
```

---

## 🔍 Common Issues to Check

### Issue 1: 502 Bad Gateway
**Cause:** Backend not running on port 8001
**Fix:**
```bash
# Check if backend is running
sudo systemctl status rideapp-backend
# or
ps aux | grep gunicorn

# Start backend if not running
sudo systemctl start rideapp-backend
```

### Issue 2: SSL Certificate Error
**Cause:** SSL not configured yet
**Fix:**
```bash
# Get SSL certificate
sudo certbot --nginx -d api.fairfaretransportation.app
```

### Issue 3: CORS Errors
**Cause:** CORS not configured in backend
**Fix:** Update CORS in `app.py` (I'll do this next)

### Issue 4: 404 Not Found
**Cause:** Wrong location path in Nginx
**Fix:** Make sure location is `/api` not `/`

---

## 📋 Verification Checklist

Run these commands on your Droplet:

```bash
# 1. Check Nginx config exists
ls -la /etc/nginx/sites-available/ | grep api

# 2. Check if enabled
ls -la /etc/nginx/sites-enabled/ | grep api

# 3. Test Nginx syntax
sudo nginx -t

# 4. Check Nginx is running
sudo systemctl status nginx

# 5. Check backend is running
sudo systemctl status rideapp-backend
# or
curl http://127.0.0.1:8001/api/health

# 6. Check DNS resolution
nslookup api.fairfaretransportation.app

# 7. Test SSL (if configured)
openssl s_client -connect api.fairfaretransportation.app:443
```

---

## 🚀 Next Steps After Verification

1. ✅ Verify Nginx config is correct
2. ✅ Update backend CORS to include `https://api.fairfaretransportation.app`
3. ✅ Deploy backend code
4. ✅ Test endpoints
5. ✅ Update frontend PWAs with production API URL

---

**Run the verification commands and let me know what you find!** 🔍

