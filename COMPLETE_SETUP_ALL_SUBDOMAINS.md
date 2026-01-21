# Complete Setup: All Subdomains

## 📋 Step-by-Step Setup

### Step 1: Add DNS Records

**In your DNS provider, add these 4 A records:**

1. **API Subdomain**
   - Type: `A`
   - Host/Name: `api`
   - Value: `157.245.231.224`
   - TTL: `3600`

2. **Admin PWA**
   - Type: `A`
   - Host/Name: `admin`
   - Value: `157.245.231.224`
   - TTL: `3600`

3. **Driver PWA**
   - Type: `A`
   - Host/Name: `driver`
   - Value: `157.245.231.224`
   - TTL: `3600`

4. **Rider PWA**
   - Type: `A`
   - Host/Name: `rider`
   - Value: `157.245.231.224`
   - TTL: `3600`

---

### Step 2: Wait for DNS Propagation

**Wait 5-10 minutes, then verify DNS:**

```bash
nslookup api.fairfaretransportation.app
nslookup admin.fairfaretransportation.app
nslookup driver.fairfaretransportation.app
nslookup rider.fairfaretransportation.app
```

**All should return:** `157.245.231.224`

---

### Step 3: Get SSL Certificates

**On your Droplet:**

```bash
# Stop Nginx
sudo systemctl stop nginx

# Get all certificates at once
sudo certbot certonly --standalone \
  -d api.fairfaretransportation.app \
  -d admin.fairfaretransportation.app \
  -d driver.fairfaretransportation.app \
  -d rider.fairfaretransportation.app

# Start Nginx
sudo systemctl start nginx

# Verify all certificates exist
sudo ls -la /etc/letsencrypt/live/api.fairfaretransportation.app/
sudo ls -la /etc/letsencrypt/live/admin.fairfaretransportation.app/
sudo ls -la /etc/letsencrypt/live/driver.fairfaretransportation.app/
sudo ls -la /etc/letsencrypt/live/rider.fairfaretransportation.app/
```

---

### Step 4: Update Nginx Config

**Backup current config:**
```bash
sudo cp /etc/nginx/sites-available/fairfaretransportation.app /etc/nginx/sites-available/fairfaretransportation.app.backup
```

**Edit config:**
```bash
sudo nano /etc/nginx/sites-available/fairfaretransportation.app
```

**Replace ALL content with the complete config from `nginx-ALL-SUBDOMAINS-COMPLETE.conf`**

**Save and exit:** `Ctrl+X`, `Y`, `Enter`

---

### Step 5: Test and Reload Nginx

```bash
# Test configuration
sudo nginx -t

# Should show: "syntax is ok" and "test is successful"

# Reload Nginx
sudo systemctl reload nginx
```

---

### Step 6: Verify Everything Works

```bash
# Test API subdomain
curl https://api.fairfaretransportation.app/health

# Test Admin PWA (should show HTML or 404 until deployed)
curl -I https://admin.fairfaretransportation.app

# Test Driver PWA (should show HTML or 404 until deployed)
curl -I https://driver.fairfaretransportation.app

# Test Rider PWA (should show HTML or 404 until deployed)
curl -I https://rider.fairfaretransportation.app
```

---

## 📝 Notes

### PWA Directories

The config assumes PWAs will be deployed to:
- Admin: `/var/www/admin-pwa/dist`
- Driver: `/var/www/driver-pwa/dist`
- Rider: `/var/www/rider-pwa/dist`

**Update these paths in the config after deploying PWAs!**

---

## ✅ Checklist

- [ ] Add 4 DNS A records
- [ ] Wait for DNS propagation
- [ ] Verify DNS resolves
- [ ] Get SSL certificates for all 4 subdomains
- [ ] Update Nginx config
- [ ] Test Nginx config
- [ ] Reload Nginx
- [ ] Verify all subdomains work
- [ ] Deploy PWAs to their directories
- [ ] Update PWA paths in Nginx config if needed

---

**Follow these steps in order!** 🚀

