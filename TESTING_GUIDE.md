# 🧪 Testing Guide - Supabase Migration

## Prerequisites

### 1. Environment Variables

Each PWA needs a `.env` file in its root directory with:

```env
VITE_SUPABASE_URL=https://zademtsktedahwgehttw.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**To get your Supabase Anon Key:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **anon public** key

### 2. Create .env Files

Create `.env` files for each PWA:

```powershell
# Rider PWA
cd C:\Users\koshi\cursor-apps\pwa-apps\rider-pwa
echo "VITE_SUPABASE_URL=https://zademtsktedahwgehttw.supabase.co" > .env
echo "VITE_SUPABASE_ANON_KEY=your-key-here" >> .env

# Driver PWA
cd C:\Users\koshi\cursor-apps\pwa-apps\driver-pwa
echo "VITE_SUPABASE_URL=https://zademtsktedahwgehttw.supabase.co" > .env
echo "VITE_SUPABASE_ANON_KEY=your-key-here" >> .env

# Admin PWA
cd C:\Users\koshi\cursor-apps\pwa-apps\admin-pwa
echo "VITE_SUPABASE_URL=https://zademtsktedahwgehttw.supabase.co" > .env
echo "VITE_SUPABASE_ANON_KEY=your-key-here" >> .env
```

---

## Testing Rider PWA

### Start Dev Server:
```powershell
cd C:\Users\koshi\cursor-apps\pwa-apps\rider-pwa
npm run dev
```

### Test Flow:

1. **Registration**
   - Open http://localhost:5173 (or the port shown)
   - Click "Register"
   - Enter email, password, full name
   - Select "Rider" role
   - ✅ Should create account and redirect to dashboard

2. **Login**
   - Logout and login again
   - ✅ Should authenticate successfully

3. **Book a Ride**
   - Click "Book New Ride"
   - Enter pickup location (e.g., "Dallas, TX")
   - Enter dropoff location (e.g., "Fort Worth, TX")
   - ✅ Should show fare estimate
   - ✅ Should show distance
   - Click "Book Ride"
   - ✅ Should create ride and navigate to Active Ride page

4. **Active Ride Page**
   - ✅ Should show ride status ("Finding Your Driver")
   - ✅ Should show pickup/dropoff locations
   - ✅ Should show map with markers
   - ✅ Should show fare estimate

5. **Dashboard**
   - Navigate to Dashboard
   - ✅ Should show ride history
   - ✅ Should show ride status badges

---

## Testing Driver PWA

### Start Dev Server:
```powershell
cd C:\Users\koshi\cursor-apps\pwa-apps\driver-pwa
npm run dev
```

### Test Flow:

1. **Registration**
   - Open http://localhost:5174 (or the port shown)
   - Click "Register"
   - Enter email, password, full name
   - Select "Driver" role
   - ✅ Should create account

2. **Driver Signup/Onboarding**
   - Complete driver signup form
   - Enter vehicle information
   - ✅ Should create driver profile

3. **Driver Dashboard**
   - ✅ Should show driver stats (rating, trips)
   - ✅ Should show "Go Online" button
   - Click "Go Online"
   - ✅ Should toggle to "Go Offline"
   - ✅ Should request location permission

4. **Available Rides**
   - With a rider ride requested, check dashboard
   - ✅ Should show available rides list
   - ✅ Should show ride details (pickup, dropoff, fare)
   - ✅ Should show map preview
   - Click "Accept" on a ride
   - ✅ Should navigate to Active Ride page

5. **Active Driver Ride**
   - ✅ Should show ride status
   - ✅ Should show trip details
   - ✅ Should show navigation links
   - Click "Arriving at Pickup"
   - ✅ Should update status
   - Click "Start Trip"
   - ✅ Should update status
   - Click "Complete Trip"
   - ✅ Should show rating modal

---

## Testing Admin PWA

### Start Dev Server:
```powershell
cd C:\Users\koshi\cursor-apps\pwa-apps\admin-pwa
npm run dev
```

### Test Flow:

1. **Login**
   - Open http://localhost:5175 (or the port shown)
   - Login with admin account
   - ✅ Should show admin dashboard

2. **Overview Tab**
   - ✅ Should show metrics cards:
     - Total Rides
     - Completed Rides
     - Active Rides
     - Total Drivers
     - Online Drivers
     - Total Revenue
   - ✅ Should show active rides list
   - ✅ Should show completion rate bar

3. **Rides Tab**
   - Click "Rides" tab
   - ✅ Should show all rides in table
   - ✅ Should allow filtering by status
   - Click "Chat" button on a ride
   - ✅ Should open chat modal

4. **Drivers Tab**
   - Click "Drivers" tab
   - ✅ Should show all drivers
   - ✅ Should show driver status (Active/Inactive)
   - ✅ Should show vehicle info
   - Click "Activate" or "Deactivate"
   - ✅ Should update driver status

5. **Applications Tab**
   - Click "Applications" tab
   - ✅ Should show pending applications
   - ✅ Should show application history
   - Click "Approve" on pending application
   - ✅ Should approve and create driver profile
   - Click "Reject"
   - ✅ Should reject with reason

---

## End-to-End Test Flow

### Complete Ride Flow:

1. **Create Rider Account**
   - Register as rider in rider-pwa
   - ✅ Account created

2. **Create Driver Account**
   - Register as driver in driver-pwa
   - Complete driver signup
   - ✅ Driver profile created

3. **Approve Driver (Admin)**
   - Login to admin-pwa
   - Go to Applications tab
   - Approve the driver
   - ✅ Driver approved

4. **Driver Goes Online**
   - Login to driver-pwa
   - Click "Go Online"
   - ✅ Driver available

5. **Rider Requests Ride**
   - Login to rider-pwa
   - Book a ride
   - ✅ Ride created with status "matching"

6. **Driver Accepts Ride**
   - Driver sees ride in dashboard
   - Clicks "Accept"
   - ✅ Ride status changes to "accepted"
   - ✅ Rider sees driver assigned

7. **Driver Updates Status**
   - Driver clicks "Arriving at Pickup"
   - ✅ Status updates to "arriving"
   - Driver clicks "Start Trip"
   - ✅ Status updates to "in_progress"
   - Driver clicks "Complete Trip"
   - ✅ Status updates to "completed"
   - ✅ Rating modal appears

8. **Chat Test**
   - During active ride, both rider and driver
   - ✅ Can send messages
   - ✅ Messages appear in real-time

---

## Common Issues & Fixes

### Issue: "Missing Supabase environment variables"
**Fix:** Create `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Issue: "CORS error"
**Fix:** Add your localhost URL to Supabase Dashboard → Settings → API → CORS origins

### Issue: "Authentication failed"
**Fix:** Check that Supabase Auth is enabled and RLS policies are set

### Issue: "Ride not appearing for driver"
**Fix:** 
- Check driver is online (`is_available = true`)
- Check driver is active (`is_active = true`)
- Check driver has location set
- Check ride status is "matching" or "requested"

### Issue: "Map not loading"
**Fix:** Check Leaflet CSS is imported and CDN is accessible

---

## Quick Test Checklist

- [ ] Rider registration works
- [ ] Rider login works
- [ ] Rider can book a ride
- [ ] Fare estimation works
- [ ] Map displays correctly
- [ ] Driver registration works
- [ ] Driver signup works
- [ ] Driver can go online
- [ ] Driver sees available rides
- [ ] Driver can accept rides
- [ ] Status updates work
- [ ] Chat works
- [ ] Admin can view rides
- [ ] Admin can manage drivers
- [ ] Admin can approve applications
- [ ] Real-time updates work

---

## Next Steps After Testing

1. ✅ Fix any bugs found
2. ✅ Test on mobile devices
3. ✅ Deploy to production
4. ✅ Update Supabase CORS settings
5. ✅ Monitor error logs


