# Fix SSL Certificate Error

## ❌ Error You're Seeing

```
cannot load certificate "/etc/letsencrypt/live/api.fairfaretransportation.app/fullchain.pem": 
No such file or directory
```

**This means:** The SSL certificate for `api.fairfaretransportation.app` doesn't exist yet.

---

## ✅ Solution: Get SSL Certificate First

### Option 1: Get SSL Certificate Before Updating Config (Recommended)

**Step 1: Get the SSL certificate**
```bash
sudo certbot --nginx -d api.fairfaretransportation.app
```

**Step 2: Then update the Nginx config** (as we did before)

**Step 3: Test and reload**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### Option 2: Temporarily Comment Out SSL Lines (For Testing)

If you want to test the config first without SSL, temporarily comment out the SSL certificate lines:

**Edit the config:**
```bash
sudo nano /etc/nginx/sites-available/fairfaretransportation.app
```

**Comment out these lines in the `api.fairfaretransportation.app` HTTPS server block:**

```nginx
# Temporarily commented out - get cert first
# ssl_certificate /etc/letsencrypt/live/api.fairfaretransportation.app/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/api.fairfaretransportation.app/privkey.pem;
# include /etc/letsencrypt/options-ssl-nginx.conf;
# ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
```

**And change the listen directive:**
```nginx
listen 443 ssl http2;  # Change to: listen 80;
listen [::]:443 ssl http2;  # Change to: listen [::]:80;
```

**Then test:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

**After testing, uncomment and get the cert:**
```bash
sudo certbot --nginx -d api.fairfaretransportation.app
```

---

## 🚀 Recommended Approach: Get Certificate First

**Run this command:**
```bash
sudo certbot --nginx -d api.fairfaretransportation.app
```

**Certbot will:**
1. ✅ Generate SSL certificate for `api.fairfaretransportation.app`
2. ✅ Place it in `/etc/letsencrypt/live/api.fairfaretransportation.app/`
3. ✅ Automatically update your Nginx config (if you let it)

**After certbot runs:**
```bash
# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Verify certificate exists
sudo ls -la /etc/letsencrypt/live/api.fairfaretransportation.app/
```

---

## 🔍 Verify Certificate Exists

**Check if certificate directory exists:**
```bash
sudo ls -la /etc/letsencrypt/live/api.fairfaretransportation.app/
```

**You should see:**
- `fullchain.pem`
- `privkey.pem`
- `chain.pem`
- `cert.pem`

---

## 📝 Quick Fix Commands

**Run these in order:**

```bash
# 1. Get SSL certificate
sudo certbot --nginx -d api.fairfaretransportation.app

# 2. Verify certificate exists
sudo ls -la /etc/letsencrypt/live/api.fairfaretransportation.app/

# 3. Test Nginx config
sudo nginx -t

# 4. Reload Nginx
sudo systemctl reload nginx

# 5. Test the endpoint
curl https://api.fairfaretransportation.app/health
```

---

**Run `sudo certbot --nginx -d api.fairfaretransportation.app` first, then test again!** 🎯

