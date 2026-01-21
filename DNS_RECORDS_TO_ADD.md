# DNS Records to Add

## 📋 Add These DNS A Records

**In your DNS provider, click "Add new record" and add these:**

### 1. API Subdomain
- **Type:** `A`
- **Host/Name:** `api`
- **Value/IP Address:** `157.245.231.224`
- **TTL:** `3600`

### 2. Admin PWA Subdomain
- **Type:** `A`
- **Host/Name:** `admin`
- **Value/IP Address:** `157.245.231.224`
- **TTL:** `3600`

### 3. Driver PWA Subdomain
- **Type:** `A`
- **Host/Name:** `driver`
- **Value/IP Address:** `157.245.231.224`
- **TTL:** `3600`

### 4. Rider PWA Subdomain
- **Type:** `A`
- **Host/Name:** `rider`
- **Value/IP Address:** `157.245.231.224`
- **TTL:** `3600`

---

## ✅ After Adding DNS Records

**Wait 5-10 minutes for DNS to propagate, then verify:**

```bash
# Check each subdomain resolves
nslookup api.fairfaretransportation.app
nslookup admin.fairfaretransportation.app
nslookup driver.fairfaretransportation.app
nslookup rider.fairfaretransportation.app
```

**All should return:** `157.245.231.224`

---

## 🚀 Next Steps After DNS is Ready

1. ✅ Add DNS records (above)
2. ✅ Wait for DNS propagation
3. ✅ Get SSL certificates for all subdomains
4. ✅ Update Nginx config with all subdomains
5. ✅ Deploy PWAs to their subdomains

---

**Add all 4 DNS records, then we'll get SSL certificates and update Nginx!** 🎯

