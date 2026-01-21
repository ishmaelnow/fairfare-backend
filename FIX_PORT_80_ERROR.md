# Fix Port 80 Already in Use Error

## ❌ Error You're Seeing

```
Could not bind TCP port 80 because it is already in use by another process
```

**This means:** Nginx is still running and using port 80.

---

## ✅ Solution: Stop Nginx First

**Press `C` to cancel the current certbot command, then:**

```bash
# 1. Stop Nginx
sudo systemctl stop nginx

# 2. Verify Nginx is stopped
sudo systemctl status nginx

# 3. Now get the certificate
sudo certbot certonly --standalone -d api.fairfaretransportation.app

# 4. Start Nginx again
sudo systemctl start nginx

# 5. Verify certificate exists
sudo ls -la /etc/letsencrypt/live/api.fairfaretransportation.app/
```

---

## 📝 Complete Step-by-Step

**Run these commands in order:**

```bash
# Step 1: Stop Nginx
sudo systemctl stop nginx

# Step 2: Get SSL certificate
sudo certbot certonly --standalone -d api.fairfaretransportation.app

# Step 3: Start Nginx
sudo systemctl start nginx

# Step 4: Verify certificate
sudo ls -la /etc/letsencrypt/live/api.fairfaretransportation.app/

# Step 5: Update Nginx config (paste the complete config)
sudo nano /etc/nginx/sites-available/fairfaretransportation.app

# Step 6: Test config
sudo nginx -t

# Step 7: Reload Nginx
sudo systemctl reload nginx
```

---

## 🎯 Quick Fix Commands

**If certbot is still waiting for input, press `C` to cancel, then:**

```bash
sudo systemctl stop nginx && sudo certbot certonly --standalone -d api.fairfaretransportation.app && sudo systemctl start nginx
```

---

**Stop Nginx first, then run certbot!** 🚀

