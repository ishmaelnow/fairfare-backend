# Nginx Configuration Analysis

## 📋 Current Configuration Analysis

### What's Currently Configured:

1. **Root Domain Setup:**
   - `fairfaretransportation.app` and `www.fairfaretransportation.app`
   - HTTP (port 80) → HTTPS redirect
   - HTTPS (port 443) with SSL certificates
   - Location `/api/` proxies to `http://127.0.0.1:8001`

2. **Current API Routing:**
   - `fairfaretransportation.app/api/*` → `http://127.0.0.1:8001/*`
   - Health check: `/health` → `http://127.0.0.1:8001/api/v1/health`

### ⚠️ Potential Issue Found:

**Current config:**
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8001;
}
```

**This means:**
- Request: `fairfaretransportation.app/api/users/register`
- Proxies to: `http://127.0.0.1:8001/users/register` ❌ (missing `/api` prefix)

**But our Flask backend expects:**
- `/api/users/register` ✅

**So the current config might not work correctly!**

---

## 🎯 What We Need to Add

### Option 1: Add `api.fairfaretransportation.app` as Separate Subdomain (Recommended)

**New server block for:**
- `api.fairfaretransportation.app`
- Proxy `/api` → `http://127.0.0.1:8001/api` (preserve path)
- Or proxy `/` → `http://127.0.0.1:8001/api` (cleaner)

### Option 2: Fix Existing Config + Add Subdomain

1. Fix the root domain config to preserve `/api` path
2. Add `api.fairfaretransportation.app` subdomain

---

## 📝 Proposed Changes

### 1. Fix Root Domain Config (if keeping it)

Change:
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8001;
}
```

To:
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8001/api/;  # Preserve /api path
}
```

### 2. Add New Server Block for `api.fairfaretransportation.app`

```nginx
# HTTP -> HTTPS redirect for api subdomain
server {
    listen 80;
    listen [::]:80;
    server_name api.fairfaretransportation.app;
    return 301 https://$server_name$request_uri;
}

# HTTPS - API subdomain
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.fairfaretransportation.app;

    # SSL certificates (need to get cert for api subdomain)
    ssl_certificate /etc/letsencrypt/live/api.fairfaretransportation.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.fairfaretransportation.app/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Proxy all requests to backend with /api prefix
    location / {
        proxy_pass http://127.0.0.1:8001/api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## ✅ Questions Before We Proceed

1. **Do you want to keep the root domain API routing?**
   - Keep `fairfaretransportation.app/api/*` working?
   - Or only use `api.fairfaretransportation.app`?

2. **SSL Certificate:**
   - Do you already have SSL cert for `api.fairfaretransportation.app`?
   - Or should we add instructions to get it via Certbot?

3. **Backend Path:**
   - Confirm backend runs on `http://127.0.0.1:8001`?
   - Confirm all endpoints start with `/api`?

---

## 🚀 Next Steps

Once you confirm:
1. ✅ I'll create the updated config file
2. ✅ Fix the path issue in existing config (if needed)
3. ✅ Add the new `api.fairfaretransportation.app` server block
4. ✅ Include Certbot instructions for SSL

**Ready to proceed when you confirm!** 🎯

