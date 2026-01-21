# Fix HTTP 500 Errors

## ❌ Current Issue

All subdomains are returning `HTTP/2 500 Internal Server Error`.

---

## 🔍 Step 1: Check Nginx Error Logs

**Check what's causing the errors:**

```bash
# Check Nginx error logs
sudo tail -50 /var/log/nginx/error.log

# Check specific subdomain logs
sudo tail -20 /var/log/nginx/api-fairfaretransportation-error.log
sudo tail -20 /var/log/nginx/admin-fairfaretransportation-error.log
sudo tail -20 /var/log/nginx/driver-fairfaretransportation-error.log
sudo tail -20 /var/log/nginx/rider-fairfaretransportation-error.log
```

---

## 🔍 Step 2: Check Backend (for API)

**For the API subdomain, check if backend is running:**

```bash
# Check if backend is running
sudo systemctl status rideapp-backend
# or
ps aux | grep gunicorn
# or
curl http://127.0.0.1:8001/api/health
```

**If backend is not running, start it:**
```bash
sudo systemctl start rideapp-backend
# or start manually if no service exists
```

---

## 🔍 Step 3: Check PWA Directories

**For PWAs, check if directories exist:**

```bash
# Check if PWA directories exist
sudo ls -la /var/www/admin-pwa/dist 2>/dev/null && echo "✓ Admin dir exists" || echo "✗ Admin dir missing"
sudo ls -la /var/www/driver-pwa/dist 2>/dev/null && echo "✓ Driver dir exists" || echo "✗ Driver dir missing"
sudo ls -la /var/www/rider-pwa/dist 2>/dev/null && echo "✓ Rider dir exists" || echo "✗ Rider dir missing"
```

**If directories don't exist, create them:**

```bash
# Create directories
sudo mkdir -p /var/www/admin-pwa/dist
sudo mkdir -p /var/www/driver-pwa/dist
sudo mkdir -p /var/www/rider-pwa/dist

# Create placeholder index.html files
sudo bash -c 'echo "<h1>Admin PWA - Coming Soon</h1>" > /var/www/admin-pwa/dist/index.html'
sudo bash -c 'echo "<h1>Driver PWA - Coming Soon</h1>" > /var/www/driver-pwa/dist/index.html'
sudo bash -c 'echo "<h1>Rider PWA - Coming Soon</h1>" > /var/www/rider-pwa/dist/index.html'

# Set permissions
sudo chown -R www-data:www-data /var/www/admin-pwa
sudo chown -R www-data:www-data /var/www/driver-pwa
sudo chown -R www-data:www-data /var/www/rider-pwa
```

---

## 🔍 Step 4: Check Permissions

**Ensure Nginx can read the files:**

```bash
# Check permissions
sudo ls -la /var/www/

# Fix permissions if needed
sudo chown -R www-data:www-data /var/www/
sudo chmod -R 755 /var/www/
```

---

## 🚀 Quick Fix: Create Placeholder Files

**Run this to create placeholder files for PWAs:**

```bash
# Create directories and placeholder files
sudo mkdir -p /var/www/admin-pwa/dist
sudo mkdir -p /var/www/driver-pwa/dist
sudo mkdir -p /var/www/rider-pwa/dist

# Create placeholder index.html files
sudo tee /var/www/admin-pwa/dist/index.html > /dev/null <<EOF
<!DOCTYPE html>
<html>
<head><title>Admin PWA</title></head>
<body><h1>Admin PWA - Coming Soon</h1></body>
</html>
EOF

sudo tee /var/www/driver-pwa/dist/index.html > /dev/null <<EOF
<!DOCTYPE html>
<html>
<head><title>Driver PWA</title></head>
<body><h1>Driver PWA - Coming Soon</h1></body>
</html>
EOF

sudo tee /var/www/rider-pwa/dist/index.html > /dev/null <<EOF
<!DOCTYPE html>
<html>
<head><title>Rider PWA</title></head>
<body><h1>Rider PWA - Coming Soon</h1></body>
</html>
EOF

# Set permissions
sudo chown -R www-data:www-data /var/www/
sudo chmod -R 755 /var/www/

# Reload Nginx
sudo systemctl reload nginx
```

---

## ✅ After Fixing

**Test again:**

```bash
curl https://api.fairfaretransportation.app/health
curl -I https://admin.fairfaretransportation.app
curl -I https://driver.fairfaretransportation.app
curl -I https://rider.fairfaretransportation.app
```

---

**Check the error logs first to see what's causing the 500 errors!** 🔍

