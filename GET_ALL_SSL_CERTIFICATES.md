# Get SSL Certificates for All Subdomains

## 📋 Certificates to Get

After DNS records are added and propagated, get SSL certificates for:

1. `api.fairfaretransportation.app`
2. `admin.fairfaretransportation.app`
3. `driver.fairfaretransportation.app`
4. `rider.fairfaretransportation.app`
# Get SSL Certificates for All Subdomains

## 📋 Certificates to Get

After DNS records are added and propagated, get SSL certificates for:

1. `api.fairfaretransportation.app`
2. `admin.fairfaretransportation.app`
3. `driver.fairfaretransportation.app`
4. `rider.fairfaretransportation.app`

---

## 🚀 Commands to Run

**On your Droplet:**

```bash
# Stop Nginx
sudo systemctl stop nginx

# Get all certificates at once (recommended)
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

## 🔄 Or Get Them One by One

**If you prefer to get them separately:**

```bash
sudo systemctl stop nginx

# API
sudo certbot certonly --standalone -d api.fairfaretransportation.app

# Admin
sudo certbot certonly --standalone -d admin.fairfaretransportation.app

# Driver
sudo certbot certonly --standalone -d driver.fairfaretransportation.app

# Rider
sudo certbot certonly --standalone -d rider.fairfaretransportation.app

sudo systemctl start nginx
```

---

## ⚠️ Important

**Make sure DNS records are added and propagated BEFORE running certbot!**

**Verify DNS first:**
```bash
nslookup api.fairfaretransportation.app
nslookup admin.fairfaretransportation.app
nslookup driver.fairfaretransportation.app
nslookup rider.fairfaretransportation.app
```

**All should return:** `157.245.231.224`

---

**After DNS is ready, run the certbot command above!** 🎯


---

## 🚀 Commands to Run

**On your Droplet:**

```bash
# Stop Nginx
sudo systemctl stop nginx

# Get all certificates at once (recommended)
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

## 🔄 Or Get Them One by One

**If you prefer to get them separately:**

```bash
sudo systemctl stop nginx

# API
sudo certbot certonly --standalone -d api.fairfaretransportation.app

# Admin
sudo certbot certonly --standalone -d admin.fairfaretransportation.app

# Driver
sudo certbot certonly --standalone -d driver.fairfaretransportation.app

# Rider
sudo certbot certonly --standalone -d rider.fairfaretransportation.app

sudo systemctl start nginx
```

---

## ⚠️ Important

**Make sure DNS records are added and propagated BEFORE running certbot!**

**Verify DNS first:**
```bash
nslookup api.fairfaretransportation.app
nslookup admin.fairfaretransportation.app
nslookup driver.fairfaretransportation.app
nslookup rider.fairfaretransportation.app
```

**All should return:** `157.245.231.224`

---

**After DNS is ready, run the certbot command above!** 🎯

