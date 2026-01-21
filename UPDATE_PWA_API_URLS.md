# Update PWA API URLs - Step by Step

## 🎯 Goal
Update all PWA API configurations to use production URL: `https://api.fairfaretransportation.app`

---

## 📋 Files to Update

1. `pwa-apps/rider-pwa/src/config/api.js`
2. `pwa-apps/driver-pwa/src/config/api.js`
3. `pwa-apps/admin-pwa/src/config/api.js`

---

## Step 1: Update Rider PWA API URL

**File:** `C:\Users\koshi\cursor-apps\pwa-apps\rider-pwa\src\config\api.js`

**Change from:**
```javascript
export const API_BASE_URL = 'http://localhost:8001/api';
```

**Change to:**
```javascript
export const API_BASE_URL = 'https://api.fairfaretransportation.app';
```

---

## Step 2: Update Driver PWA API URL

**File:** `C:\Users\koshi\cursor-apps\pwa-apps\driver-pwa\src\config\api.js`

**Change from:**
```javascript
export const API_BASE_URL = 'http://localhost:8001/api';
```

**Change to:**
```javascript
export const API_BASE_URL = 'https://api.fairfaretransportation.app';
```

---

## Step 3: Update Admin PWA API URL

**File:** `C:\Users\koshi\cursor-apps\pwa-apps\admin-pwa\src\config\api.js`

**Change from:**
```javascript
export const API_BASE_URL = 'http://localhost:8001/api';
```

**Change to:**
```javascript
export const API_BASE_URL = 'https://api.fairfaretransportation.app';
```

---

## Step 4: Verify Changes

**After updating, verify each file:**

```bash
# Check rider-pwa
cat pwa-apps/rider-pwa/src/config/api.js | grep API_BASE_URL

# Check driver-pwa
cat pwa-apps/driver-pwa/src/config/api.js | grep API_BASE_URL

# Check admin-pwa
cat pwa-apps/admin-pwa/src/config/api.js | grep API_BASE_URL
```

**All should show:** `https://api.fairfaretransportation.app`

---

## Step 5: Rebuild PWAs

**After updating URLs, rebuild each PWA:**

```bash
# Build Rider PWA
cd pwa-apps/rider-pwa
npm run build

# Build Driver PWA
cd ../driver-pwa
npm run build

# Build Admin PWA
cd ../admin-pwa
npm run build
```

**Build output will be in:** `dist/` folder in each PWA directory

---

## Step 6: Deploy PWAs to Droplet

**Copy built files to droplet:**

```bash
# From your local machine (PowerShell)
# Copy Rider PWA
scp -r C:\Users\koshi\cursor-apps\pwa-apps\rider-pwa\dist\* ishmael@YOUR_DROPLET_IP:/var/www/fairfare/rider/

# Copy Driver PWA
scp -r C:\Users\koshi\cursor-apps\pwa-apps\driver-pwa\dist\* ishmael@YOUR_DROPLET_IP:/var/www/fairfare/driver/

# Copy Admin PWA
scp -r C:\Users\koshi\cursor-apps\pwa-apps\admin-pwa\dist\* ishmael@YOUR_DROPLET_IP:/var/www/fairfare/admin/
```

**Or on Droplet, create directories and copy:**

```bash
# On Droplet
sudo mkdir -p /var/www/fairfare/{rider,driver,admin}
sudo chown -R ishmael:ishmael /var/www/fairfare
```

---

## ✅ Checklist

- [ ] Updated rider-pwa API URL
- [ ] Updated driver-pwa API URL
- [ ] Updated admin-pwa API URL
- [ ] Verified all URLs point to `https://api.fairfaretransportation.app`
- [ ] Rebuilt all PWAs
- [ ] Deployed PWAs to droplet
- [ ] Tested PWAs in browser

---

**Start with Step 1 - update the API URLs!** 🚀

