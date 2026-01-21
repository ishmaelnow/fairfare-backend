# Restore Original Nginx Config

## 🔄 Restore Your Original Config

**Copy and paste this into `/etc/nginx/sites-available/fairfaretransportation.app`:**

```nginx
# ============================================================
# fairfaretransportation.app - FairFare Backend (API)
# ============================================================

# 1) HTTP -> HTTPS
server {
    if ($host = www.fairfaretransportation.app) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = fairfaretransportation.app) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    listen [::]:80;

    server_name fairfaretransportation.app www.fairfaretransportation.app;

    return 301 https://$host$request_uri;




}

# 2) HTTPS - API reverse proxy
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name fairfaretransportation.app www.fairfaretransportation.app;

    # TEMP cert so nginx can reload cleanly.
    # We will replace this with the real fairfaretransportation.app cert after certbot runs.
    ssl_certificate /etc/letsencrypt/live/fairfaretransportation.app/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/fairfaretransportation.app/privkey.pem; # managed by Certbot
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;

        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # convenience endpoint (optional)
    location = /health {
        proxy_pass http://127.0.0.1:8001/api/v1/health;
        proxy_http_version 1.1;

        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }


}
```

---

## 📝 Steps to Restore

**On your Droplet:**

```bash
# 1. Edit the config file
sudo nano /etc/nginx/sites-available/fairfaretransportation.app

# 2. Delete all content (Ctrl+K repeatedly or Ctrl+A then Delete)

# 3. Paste the original config above

# 4. Save and exit (Ctrl+X, then Y, then Enter)

# 5. Test the config
sudo nginx -t

# 6. Reload Nginx
sudo systemctl reload nginx
```

---

## ✅ Verify It Works

```bash
# Test Nginx config
sudo nginx -t

# Should show: "syntax is ok" and "test is successful"

# Reload Nginx
sudo systemctl reload nginx

# Test endpoint
curl https://fairfaretransportation.app/api/health
```

---

**This will restore your working config!** ✅

