# Update Nginx Configuration for api.fairfaretransportation.app

## 📋 What's Changed

1. ✅ **Fixed root domain config** - Now preserves `/api` path correctly
2. ✅ **Added `api.fairfaretransportation.app` subdomain** - New server block
3. ✅ **SSL configured** - Uses existing certificate for api subdomain
4. ✅ **Health check endpoints** - Added for both domains

---

## 🔧 Step-by-Step Update Instructions

### Step 1: Backup Current Config

```bash
# Create backup
sudo cp /etc/nginx/sites-available/fairfaretransportation.app /etc/nginx/sites-available/fairfaretransportation.app.backup
```

### Step 2: Update the Config File

**Option A: Edit directly on server**
```bash
sudo nano /etc/nginx/sites-available/fairfaretransportation.app
# Copy the contents from nginx-fairfaretransportation-updated.conf
```

**Option B: Copy from local file**
```bash
# On your local machine, copy the updated config
# Then on server, edit and paste:
sudo nano /etc/nginx/sites-available/fairfaretransportation.app
```

### Step 3: Test Nginx Configuration

```bash
# Test syntax
sudo nginx -t
```

**Expected output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Step 4: Reload Nginx

```bash
# Reload Nginx (doesn't drop connections)
sudo systemctl reload nginx

# Or restart (drops connections)
sudo systemctl restart nginx
```

---

## ✅ Verification Steps

### 1. Check SSL Certificate Exists

```bash
# Verify SSL cert for api subdomain exists
sudo ls -la /etc/letsencrypt/live/api.fairfaretransportation.app/
```

**If certificate doesn't exist, get it:**
```bash
sudo certbot --nginx -d api.fairfaretransportation.app
```

### 2. Test Backend is Running

```bash
# Test backend directly
curl http://127.0.0.1:8001/api/health

# Should return JSON response
```

### 3. Test Root Domain API

```bash
# Test root domain API (should preserve /api path)
curl https://fairfaretransportation.app/api/health

# Test registration endpoint
curl -X POST https://fairfaretransportation.app/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'
```

### 4. Test API Subdomain

```bash
# Test API subdomain (no /api in URL needed)
curl https://api.fairfaretransportation.app/health

# Test registration endpoint (note: no /api prefix)
curl -X POST https://api.fairfaretransportation.app/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test2@example.com","password":"password123"}'
```

### 5. Test HTTP Redirects

```bash
# Test HTTP -> HTTPS redirect for root domain
curl -I http://fairfaretransportation.app/api/health

# Test HTTP -> HTTPS redirect for API subdomain
curl -I http://api.fairfaretransportation.app/health
```

---

## 🐛 Troubleshooting

### Issue 1: SSL Certificate Not Found

**Error:** `SSL_CTX_use_certificate_file() failed`

**Fix:**
```bash
# Get SSL certificate for api subdomain
sudo certbot --nginx -d api.fairfaretransportation.app

# Then reload Nginx
sudo systemctl reload nginx
```

### Issue 2: 502 Bad Gateway

**Error:** `502 Bad Gateway` when accessing API

**Check:**
```bash
# Verify backend is running
sudo systemctl status rideapp-backend
# or
ps aux | grep gunicorn

# Test backend directly
curl http://127.0.0.1:8001/api/health
```

**Fix:**
```bash
# Start backend if not running
sudo systemctl start rideapp-backend
```

### Issue 3: 404 Not Found

**Error:** `404 Not Found` on API endpoints

**Check:**
- Verify backend endpoints start with `/api`
- Check Nginx logs: `sudo tail -f /var/log/nginx/api-fairfaretransportation-error.log`

### Issue 4: Nginx Test Fails

**Error:** `nginx: configuration file test failed`

**Fix:**
```bash
# Check what's wrong
sudo nginx -T 2>&1 | grep -A 5 "error"

# Restore backup if needed
sudo cp /etc/nginx/sites-available/fairfaretransportation.app.backup /etc/nginx/sites-available/fairfaretransportation.app
sudo nginx -t
```

---

## 📝 Quick Test Checklist

Run these commands after updating:

```bash
# 1. Test Nginx syntax
sudo nginx -t

# 2. Check SSL cert exists
sudo ls -la /etc/letsencrypt/live/api.fairfaretransportation.app/

# 3. Test backend directly
curl http://127.0.0.1:8001/api/health

# 4. Test root domain API
curl https://fairfaretransportation.app/api/health

# 5. Test API subdomain
curl https://api.fairfaretransportation.app/health

# 6. Check Nginx status
sudo systemctl status nginx
```

---

## 🎯 Expected Behavior

### Root Domain (`fairfaretransportation.app`)
- `https://fairfaretransportation.app/api/users/register` → `http://127.0.0.1:8001/api/users/register` ✅

### API Subdomain (`api.fairfaretransportation.app`)
- `https://api.fairfaretransportation.app/users/register` → `http://127.0.0.1:8001/api/users/register` ✅
- `https://api.fairfaretransportation.app/health` → `http://127.0.0.1:8001/api/health` ✅

---

## 🚀 Next Steps (After Verification)

1. ✅ Update backend CORS (already done in `app.py`)
2. ✅ Deploy backend code to droplet
3. ✅ Test all endpoints
4. ✅ Update frontend PWAs with production API URL (`https://api.fairfaretransportation.app`)
5. ⏳ Add PWA subdomains later (rider, driver, admin)

---

**Ready to update! Follow the steps above and let me know if you encounter any issues.** 🎯

