# Nginx Verification Commands

Run these commands on your Droplet to verify Nginx configuration for `api.fairfaretransportation.app`.

## 🔍 Step 1: Check if Config Exists

```bash
# Check all Nginx config files
ls -la /etc/nginx/sites-available/

# Search for api.fairfaretransportation.app
grep -r "api.fairfaretransportation.app" /etc/nginx/sites-available/
grep -r "api.fairfaretransportation.app" /etc/nginx/sites-enabled/
```

## 🔍 Step 2: View Current Config (if exists)

```bash
# If config file exists, view it
cat /etc/nginx/sites-available/api-fairfaretransportation
# or
cat /etc/nginx/sites-available/fairfaretransportation-api
# or check main config
cat /etc/nginx/nginx.conf | grep -A 20 "api.fairfaretransportation"
```

## 🔍 Step 3: Test Nginx Syntax

```bash
# Test Nginx configuration syntax
sudo nginx -t

# If errors, see what's wrong
sudo nginx -T 2>&1 | grep -A 10 "api.fairfaretransportation"
```

## 🔍 Step 4: Check if Site is Enabled

```bash
# List enabled sites
ls -la /etc/nginx/sites-enabled/

# Check if symlink exists
ls -la /etc/nginx/sites-enabled/ | grep api
```

## 🔍 Step 5: Check Nginx Status

```bash
# Check if Nginx is running
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## 🔍 Step 6: Test Backend Connection

```bash
# Test if backend is running on port 8001
curl http://127.0.0.1:8001/api/health

# Test through Nginx (if HTTP is configured)
curl http://api.fairfaretransportation.app/api/health

# Test HTTPS (if SSL is configured)
curl https://api.fairfaretransportation.app/api/health
```

## 🔍 Step 7: Check DNS Resolution

```bash
# Check if domain resolves
nslookup api.fairfaretransportation.app
dig api.fairfaretransportation.app
```

## 🔍 Step 8: Check SSL Certificate (if configured)

```bash
# Check if SSL certificate exists
sudo ls -la /etc/letsencrypt/live/api.fairfaretransportation.app/

# Test SSL connection
openssl s_client -connect api.fairfaretransportation.app:443 -servername api.fairfaretransportation.app
```

---

## 📋 Copy-Paste All Commands

Run this block to check everything at once:

```bash
echo "=== Checking Nginx Config Files ==="
ls -la /etc/nginx/sites-available/ | grep -E "api|fairfare"
echo ""
echo "=== Searching for api.fairfaretransportation.app ==="
grep -r "api.fairfaretransportation.app" /etc/nginx/ 2>/dev/null
echo ""
echo "=== Testing Nginx Syntax ==="
sudo nginx -t
echo ""
echo "=== Checking Enabled Sites ==="
ls -la /etc/nginx/sites-enabled/
echo ""
echo "=== Testing Backend Connection ==="
curl -s http://127.0.0.1:8001/api/health || echo "Backend not running on port 8001"
echo ""
echo "=== Checking DNS ==="
nslookup api.fairfaretransportation.app
```

---

**Run these commands and share the output so I can help verify/update the configuration!** 🔍

