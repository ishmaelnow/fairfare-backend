# Final Steps: Test and Reload Nginx

## ✅ All Certificates Obtained!

All SSL certificates are now ready:
- ✓ API cert
- ✓ Admin cert
- ✓ Driver cert
- ✓ Rider cert

---

## 🚀 Final Steps

**Run these commands:**

```bash
# 1. Start Nginx
sudo systemctl start nginx

# 2. Verify all certificates exist
sudo ls -la /etc/letsencrypt/live/api.fairfaretransportation.app/ && echo "✓ API"
sudo ls -la /etc/letsencrypt/live/admin.fairfaretransportation.app/ && echo "✓ Admin"
sudo ls -la /etc/letsencrypt/live/driver.fairfaretransportation.app/ && echo "✓ Driver"
sudo ls -la /etc/letsencrypt/live/rider.fairfaretransportation.app/ && echo "✓ Rider"

# 3. Test Nginx configuration
sudo nginx -t

# 4. Reload Nginx
sudo systemctl reload nginx

# 5. Check Nginx status
sudo systemctl status nginx
```

---

## ✅ Verify Everything Works

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

**Run the commands above to complete the setup!** 🎯

