# Update Nginx Config Now

## ✅ SSL Certificates Obtained!

All certificates are ready. Now update Nginx config.

---

## 📝 Step 1: Backup Current Config

```bash
sudo cp /etc/nginx/sites-available/fairfaretransportation.app /etc/nginx/sites-available/fairfaretransportation.app.backup
```

---

## 📝 Step 2: Update Nginx Config

**Edit the config file:**
```bash
sudo nano /etc/nginx/sites-available/fairfaretransportation.app
```

**Delete ALL existing content** (Ctrl+A, Delete)

**Paste the complete config from `nginx-ALL-SUBDOMAINS-COMPLETE.conf`**

**Save and exit:** Ctrl+X, Y, Enter

---

## 📝 Step 3: Test Configuration

```bash
sudo nginx -t
```

**Should show:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

---

## 📝 Step 4: Reload Nginx

```bash
sudo systemctl reload nginx
```

---

## ✅ Step 5: Verify Everything Works

```bash
# Test API subdomain
curl https://api.fairfaretransportation.app/health

# Test Admin PWA (will show 404 until deployed)
curl -I https://admin.fairfaretransportation.app

# Test Driver PWA (will show 404 until deployed)
curl -I https://driver.fairfaretransportation.app

# Test Rider PWA (will show 404 until deployed)
curl -I https://rider.fairfaretransportation.app
```

---

## 🎯 What to Expect

- ✅ `api.fairfaretransportation.app` - Should work (backend API)
- ⚠️ `admin.fairfaretransportation.app` - Will show 404 until PWA is deployed
- ⚠️ `driver.fairfaretransportation.app` - Will show 404 until PWA is deployed
- ⚠️ `rider.fairfaretransportation.app` - Will show 404 until PWA is deployed

---

**Update the Nginx config now!** 🚀

