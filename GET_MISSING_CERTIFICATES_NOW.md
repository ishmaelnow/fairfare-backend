# Get Missing SSL Certificates

## ✅ Current Status

- ✓ API cert exists
- ✗ Admin cert missing
- ✗ Driver cert missing
- ✗ Rider cert missing

---

## 🚀 Get Missing Certificates

**Run these commands:**

```bash
# Stop Nginx
sudo systemctl stop nginx

# Get missing certificates
sudo certbot certonly --standalone -d admin.fairfaretransportation.app
sudo certbot certonly --standalone -d driver.fairfaretransportation.app
sudo certbot certonly --standalone -d rider.fairfaretransportation.app

# Start Nginx
sudo systemctl start nginx
```

---

## ✅ Verify All Certificates Exist

**After getting certificates, verify:**

```bash
sudo ls -la /etc/letsencrypt/live/api.fairfaretransportation.app/ && echo "✓ API"
sudo ls -la /etc/letsencrypt/live/admin.fairfaretransportation.app/ && echo "✓ Admin"
sudo ls -la /etc/letsencrypt/live/driver.fairfaretransportation.app/ && echo "✓ Driver"
sudo ls -la /etc/letsencrypt/live/rider.fairfaretransportation.app/ && echo "✓ Rider"
```

---

## 📝 Then Test Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

**Run the certbot commands above to get the 3 missing certificates!** 🎯

