# Fix Redirect Cycle Error

## ❌ Error

```
rewrite or internal redirection cycle while internally redirecting to "/index.html"
```

**Cause:** Nginx can't serve `/index.html` from the `root` directory.

---

## 🔍 Step 1: Check Current Nginx Config

**Check what paths are actually configured:**

```bash
# Check what root paths are configured
sudo grep -A 5 "root" /etc/nginx/sites-available/fairfaretransportation.app | grep -E "root|server_name"
```

---

## 🔍 Step 2: Check What Directories Exist

**Check what directories actually exist:**

```bash
# Check if directories exist
sudo ls -la /var/www/fairfare/admin 2>/dev/null && echo "✓ /var/www/fairfare/admin exists" || echo "✗ /var/www/fairfare/admin missing"
sudo ls -la /var/www/fairfare/driver 2>/dev/null && echo "✓ /var/www/fairfare/driver exists" || echo "✗ /var/www/fairfare/driver missing"
sudo ls -la /var/www/fairfare/rider 2>/dev/null && echo "✓ /var/www/fairfare/rider exists" || echo "✗ /var/www/fairfare/rider missing"

# Also check the paths from our config
sudo ls -la /var/www/admin-pwa/dist 2>/dev/null && echo "✓ /var/www/admin-pwa/dist exists" || echo "✗ /var/www/admin-pwa/dist missing"
sudo ls -la /var/www/driver-pwa/dist 2>/dev/null && echo "✓ /var/www/driver-pwa/dist exists" || echo "✗ /var/www/driver-pwa/dist missing"
sudo ls -la /var/www/rider-pwa/dist 2>/dev/null && echo "✓ /var/www/rider-pwa/dist exists" || echo "✗ /var/www/rider-pwa/dist missing"
```

---

## ✅ Solution Option 1: Create Missing Directories and Files

**If directories don't exist, create them:**

```bash
# Create directories (use whichever path your config has)
sudo mkdir -p /var/www/fairfare/admin
sudo mkdir -p /var/www/fairfare/driver
sudo mkdir -p /var/www/fairfare/rider

# Create index.html files
sudo tee /var/www/fairfare/admin/index.html > /dev/null <<EOF
<!DOCTYPE html>
<html>
<head><title>Admin PWA</title></head>
<body><h1>Admin PWA - Coming Soon</h1></body>
</html>
EOF

sudo tee /var/www/fairfare/driver/index.html > /dev/null <<EOF
<!DOCTYPE html>
<html>
<head><title>Driver PWA</title></head>
<body><h1>Driver PWA - Coming Soon</h1></body>
</html>
EOF

sudo tee /var/www/fairfare/rider/index.html > /dev/null <<EOF
<!DOCTYPE html>
<html>
<head><title>Rider PWA</title></head>
<body><h1>Rider PWA - Coming Soon</h1></body>
</html>
EOF

# Set permissions
sudo chown -R www-data:www-data /var/www/fairfare
sudo chmod -R 755 /var/www/fairfare
```

---

## ✅ Solution Option 2: Update Nginx Config to Match Existing Paths

**If directories exist but config points elsewhere, update the config:**

```bash
# Edit config
sudo nano /etc/nginx/sites-available/fairfaretransportation.app

# Find and update root paths to match existing directories
# Change:
#   root /var/www/admin-pwa/dist;
# To:
#   root /var/www/fairfare/admin;
```

---

## ✅ Solution Option 3: Create Both Sets of Directories

**Create directories for both path options:**

```bash
# Create /var/www/fairfare paths
sudo mkdir -p /var/www/fairfare/{admin,driver,rider}
sudo tee /var/www/fairfare/admin/index.html > /dev/null <<EOF
<!DOCTYPE html>
<html><head><title>Admin</title></head><body><h1>Admin PWA</h1></body></html>
EOF
sudo tee /var/www/fairfare/driver/index.html > /dev/null <<EOF
<!DOCTYPE html>
<html><head><title>Driver</title></head><body><h1>Driver PWA</h1></body></html>
EOF
sudo tee /var/www/fairfare/rider/index.html > /dev/null <<EOF
<!DOCTYPE html>
<html><head><title>Rider</title></head><body><h1>Rider PWA</h1></body></html>
EOF

# Also create /var/www/admin-pwa/dist paths
sudo mkdir -p /var/www/admin-pwa/dist
sudo mkdir -p /var/www/driver-pwa/dist
sudo mkdir -p /var/www/rider-pwa/dist
sudo tee /var/www/admin-pwa/dist/index.html > /dev/null <<EOF
<!DOCTYPE html>
<html><head><title>Admin</title></head><body><h1>Admin PWA</h1></body></html>
EOF
sudo tee /var/www/driver-pwa/dist/index.html > /dev/null <<EOF
<!DOCTYPE html>
<html><head><title>Driver</title></head><body><h1>Driver PWA</h1></body></html>
EOF
sudo tee /var/www/rider-pwa/dist/index.html > /dev/null <<EOF
<!DOCTYPE html>
<html><head><title>Rider</title></head><body><h1>Rider PWA</h1></body></html>
EOF

# Set permissions
sudo chown -R www-data:www-data /var/www/
sudo chmod -R 755 /var/www/

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔍 Step 3: Verify Fix

**After fixing, test:**

```bash
# Test each subdomain
curl -I https://admin.fairfaretransportation.app
curl -I https://driver.fairfaretransportation.app
curl -I https://rider.fairfaretransportation.app

# Check error logs
sudo tail -20 /var/log/nginx/error.log
```

---

**Run the check commands first to see what paths are configured and what exists!** 🔍

