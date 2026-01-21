# Test Everything - Complete Verification

## ✅ Test All Subdomains

### Step 1: Test API Subdomain

```bash
# Test health endpoint
curl https://api.fairfaretransportation.app/health

# Test registration endpoint
curl -X POST https://api.fairfaretransportation.app/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Test login endpoint
curl -X POST https://api.fairfaretransportation.app/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

### Step 2: Test PWA Subdomains

```bash
# Test Admin PWA
curl -I https://admin.fairfaretransportation.app
curl https://admin.fairfaretransportation.app

# Test Driver PWA
curl -I https://driver.fairfaretransportation.app
curl https://driver.fairfaretransportation.app

# Test Rider PWA
curl -I https://rider.fairfaretransportation.app
curl https://rider.fairfaretransportation.app
```

---

### Step 3: Test Root Domain

```bash
# Test root domain API
curl https://fairfaretransportation.app/api/health

# Test root domain health endpoint
curl https://fairfaretransportation.app/health
```

---

### Step 4: Test HTTP Redirects

```bash
# Test HTTP -> HTTPS redirects
curl -I http://api.fairfaretransportation.app/health
curl -I http://admin.fairfaretransportation.app
curl -I http://driver.fairfaretransportation.app
curl -I http://rider.fairfaretransportation.app
```

**Should all return:** `301 Moved Permanently` with `Location: https://...`

---

### Step 5: Test SSL Certificates

```bash
# Test SSL for each subdomain
openssl s_client -connect api.fairfaretransportation.app:443 -servername api.fairfaretransportation.app < /dev/null | grep "Verify return code"
openssl s_client -connect admin.fairfaretransportation.app:443 -servername admin.fairfaretransportation.app < /dev/null | grep "Verify return code"
openssl s_client -connect driver.fairfaretransportation.app:443 -servername driver.fairfaretransportation.app < /dev/null | grep "Verify return code"
openssl s_client -connect rider.fairfaretransportation.app:443 -servername rider.fairfaretransportation.app < /dev/null | grep "Verify return code"
```

**Should all show:** `Verify return code: 0 (ok)`

---

## 📋 Quick Test Script

**Run this to test everything at once:**

```bash
echo "=== Testing API Subdomain ==="
curl -s https://api.fairfaretransportation.app/health && echo ""

echo "=== Testing PWA Subdomains ==="
echo "Admin:" && curl -s -o /dev/null -w "%{http_code}" https://admin.fairfaretransportation.app && echo ""
echo "Driver:" && curl -s -o /dev/null -w "%{http_code}" https://driver.fairfaretransportation.app && echo ""
echo "Rider:" && curl -s -o /dev/null -w "%{http_code}" https://rider.fairfaretransportation.app && echo ""

echo "=== Testing HTTP Redirects ==="
curl -s -o /dev/null -w "API: %{http_code}\n" http://api.fairfaretransportation.app/health
curl -s -o /dev/null -w "Admin: %{http_code}\n" http://admin.fairfaretransportation.app
curl -s -o /dev/null -w "Driver: %{http_code}\n" http://driver.fairfaretransportation.app
curl -s -o /dev/null -w "Rider: %{http_code}\n" http://rider.fairfaretransportation.app
```

---

## ✅ Expected Results

### API Subdomain
- ✅ `https://api.fairfaretransportation.app/health` → Returns JSON `{"status":"healthy",...}`
- ✅ `https://api.fairfaretransportation.app/users/register` → Returns success or validation error

### PWA Subdomains
- ✅ `https://admin.fairfaretransportation.app` → Returns HTML (200 OK)
- ✅ `https://driver.fairfaretransportation.app` → Returns HTML (200 OK)
- ✅ `https://rider.fairfaretransportation.app` → Returns HTML (200 OK)

### HTTP Redirects
- ✅ All HTTP requests → Return `301` redirect to HTTPS

### SSL Certificates
- ✅ All certificates valid → `Verify return code: 0 (ok)`

---

## 🎯 Test from Browser

**Open these URLs in your browser:**

1. `https://api.fairfaretransportation.app/health`
2. `https://admin.fairfaretransportation.app`
3. `https://driver.fairfaretransportation.app`
4. `https://rider.fairfaretransportation.app`

**Check:**
- ✅ No SSL warnings
- ✅ Pages load correctly
- ✅ HTTPS lock icon shows

---

**Run the tests above and let me know the results!** 🚀

