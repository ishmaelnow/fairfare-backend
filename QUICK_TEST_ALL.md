# Quick Test - All Subdomains

## 🚀 Run This Quick Test

```bash
echo "=== Testing API Health ==="
curl https://api.fairfaretransportation.app/health
echo ""

echo "=== Testing PWA Subdomains (should return 200) ==="
echo -n "Admin: " && curl -s -o /dev/null -w "%{http_code}\n" https://admin.fairfaretransportation.app
echo -n "Driver: " && curl -s -o /dev/null -w "%{http_code}\n" https://driver.fairfaretransportation.app
echo -n "Rider: " && curl -s -o /dev/null -w "%{http_code}\n" https://rider.fairfaretransportation.app

echo ""
echo "=== Testing HTTP Redirects (should return 301) ==="
echo -n "API: " && curl -s -o /dev/null -w "%{http_code}\n" http://api.fairfaretransportation.app/health
echo -n "Admin: " && curl -s -o /dev/null -w "%{http_code}\n" http://admin.fairfaretransportation.app
echo -n "Driver: " && curl -s -o /dev/null -w "%{http_code}\n" http://driver.fairfaretransportation.app
echo -n "Rider: " && curl -s -o /dev/null -w "%{http_code}\n" http://rider.fairfaretransportation.app
```

---

## ✅ Expected Results

- **API Health:** JSON response with `{"status":"healthy",...}`
- **PWA Subdomains:** `200` status code
- **HTTP Redirects:** `301` status code

---

**Run this quick test and share the results!** 🎯

