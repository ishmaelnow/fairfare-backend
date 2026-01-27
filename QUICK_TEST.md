# 🚀 Quick Test Setup

## Step 1: Get Supabase Anon Key

1. Go to: https://supabase.com/dashboard
2. Select your project (or create one)
3. Go to **Settings** → **API**
4. Copy the **anon public** key (long string starting with `eyJ...`)

## Step 2: Create Environment Files

Run these commands in PowerShell (replace `YOUR_ANON_KEY` with your actual key):

```powershell
# Rider PWA
cd C:\Users\koshi\cursor-apps\pwa-apps\rider-pwa
@"
VITE_SUPABASE_URL=https://zademtsktedahwgehttw.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
"@ | Out-File -FilePath .env -Encoding utf8

# Driver PWA
cd C:\Users\koshi\cursor-apps\pwa-apps\driver-pwa
@"
VITE_SUPABASE_URL=https://zademtsktedahwgehttw.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
"@ | Out-File -FilePath .env -Encoding utf8

# Admin PWA
cd C:\Users\koshi\cursor-apps\pwa-apps\admin-pwa
@"
VITE_SUPABASE_URL=https://zademtsktedahwgehttw.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
"@ | Out-File -FilePath .env -Encoding utf8
```

## Step 3: Test Each PWA

### Test Rider PWA:
```powershell
cd C:\Users\koshi\cursor-apps\pwa-apps\rider-pwa
npm run dev
```
- Open browser to the URL shown (usually http://localhost:5173)
- Test registration, login, booking a ride

### Test Driver PWA:
```powershell
cd C:\Users\koshi\cursor-apps\pwa-apps\driver-pwa
npm run dev
```
- Open browser to the URL shown (usually http://localhost:5174)
- Test registration, driver signup, going online, accepting rides

### Test Admin PWA:
```powershell
cd C:\Users\koshi\cursor-apps\pwa-apps\admin-pwa
npm run dev
```
- Open browser to the URL shown (usually http://localhost:5175)
- Test login, viewing metrics, managing drivers

## Step 4: Test Complete Flow

1. **Create accounts:**
   - Register as Rider
   - Register as Driver
   - Complete driver signup

2. **Approve driver (Admin):**
   - Login as Admin
   - Go to Applications tab
   - Approve the driver

3. **Test ride flow:**
   - Driver: Go online
   - Rider: Book a ride
   - Driver: Accept ride
   - Driver: Update status (Arriving → Start → Complete)
   - Both: Test chat

## Troubleshooting

**Error: "Missing Supabase environment variables"**
- Make sure `.env` file exists in each PWA root
- Restart the dev server after creating `.env`

**Error: "CORS error"**
- Go to Supabase Dashboard → Settings → API
- Add your localhost URL to CORS origins (e.g., `http://localhost:5173`)

**Error: "Authentication failed"**
- Check Supabase Auth is enabled
- Verify RLS policies are set correctly

**Ride not appearing for driver:**
- Check driver is online (`is_available = true`)
- Check driver is active (`is_active = true`)
- Check driver has location set


