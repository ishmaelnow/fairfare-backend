# Quick Backend Testing Guide

## 🎯 Start Here: Essential Tests

Since your frontend is working, test these backend features through the UI:

### 1. **User Registration** ✅
**Where:** `http://localhost:3000/register`

**Test:**
- Fill in name, email, password
- Click Register
- **Expected:** Success message, redirected to login

**Backend Check:** User should be created in database

---

### 2. **User Login** ✅
**Where:** `http://localhost:3000/login`

**Test:**
- Enter email and password from step 1
- Click Login
- **Expected:** Success message, redirected to book-ride page

**Backend Check:** 
- Token should be returned
- Check browser DevTools → Application → Local Storage → Should see `token`

---

### 3. **Book a Ride** ✅
**Where:** `http://localhost:3000/book-ride`

**Test:**
- Fill in all ride details:
  - Your Name
  - Phone Number
  - Email
  - Pickup Location
  - Dropoff Location
  - Pickup Time (future date)
- Click "Book Ride"
- **Expected:** Success message, form clears

**Backend Check:**
- Ride should be created
- Check browser DevTools → Network tab → See POST request to `/api/rides`
- Response should show ride details

---

### 4. **View My Rides** ✅
**Where:** `http://localhost:3000/dashboard`

**Test:**
- Should see list of rides you booked
- **Expected:** Shows pickup/dropoff locations, pickup time

**Backend Check:**
- Check Network tab → GET request to `/api/users/rides`
- Should return array of your rides

---

### 5. **Apply as Driver** ✅
**Where:** `http://localhost:3000/driver-signup`

**Test:**
- Fill in vehicle details:
  - Vehicle Type (e.g., "Sedan")
  - Model (e.g., "Toyota Camry")
  - Year (e.g., "2022")
  - Color (e.g., "White")
  - License Plate (e.g., "ABC-1234")
- Click "Submit Application"
- **Expected:** Success message, redirected to dashboard

**Backend Check:**
- Driver application should be created
- Status should be "pending approval"

---

### 6. **Manage Drivers (Admin)** ✅
**Where:** `http://localhost:3000/manage-drivers`

**Test:**
- Should see list of all drivers
- Find your driver application
- Click "Approve" button
- **Expected:** Driver status changes to approved

**Backend Check:**
- Check Network tab → PATCH request to `/api/drivers/:id/approve`
- Driver should become available

---

### 7. **Test Auto-Assignment** ✅
**After approving a driver:**

**Test:**
- Book a new ride
- **Expected:** Ride should be automatically assigned to the approved driver

**Backend Check:**
- Response should include `driverId`
- Status should be "assigned" instead of "pending"

---

## 🔍 How to Verify Backend is Working

### Check Browser DevTools:

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Perform actions in frontend**
4. **Watch for API calls:**
   - `POST /api/users/register` → Should return 201
   - `POST /api/users/login` → Should return 200 with token
   - `POST /api/rides` → Should return 201 with ride data
   - `GET /api/users/rides` → Should return 200 with rides array

### Check Response Data:

Click on any API request → Response tab → Should see JSON data

**Good Response:**
```json
{
  "message": "Success",
  "data": {...}
}
```

**Error Response:**
```json
{
  "error": "Error message here"
}
```

---

## 🐛 Common Issues to Check

### Issue: "Network error" or "Failed to fetch"
**Fix:** Backend not running → Start backend: `python app.py`

### Issue: "401 Unauthorized"
**Fix:** Not logged in → Login first, then try again

### Issue: "User already exists"
**Fix:** Try different email address

### Issue: "Invalid email or password"
**Fix:** Make sure you registered first, or check password

### Issue: Database errors
**Fix:** Backend is trying to connect to PostgreSQL → Check `.env` file has SQLite:
```env
DATABASE_URL=sqlite:///ride_app.db
```

---

## ✅ Quick Test Checklist

Test these in order:

- [ ] Can register new user
- [ ] Can login with registered user
- [ ] Token appears in localStorage after login
- [ ] Can book a ride (when logged in)
- [ ] Can see my rides in dashboard
- [ ] Can apply to become driver
- [ ] Can see drivers list (admin page)
- [ ] Can approve driver
- [ ] New ride auto-assigns to approved driver

---

## 🚀 Quick API Test (Optional)

If you want to test backend directly (without frontend):

**Open PowerShell:**
```powershell
# Test health check
Invoke-RestMethod -Uri "http://localhost:8001/api/health"

# Test registration
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8001/api/users/register" `
  -Method Post -Body $body -ContentType "application/json"
```

---

## 📊 What Success Looks Like

**Frontend Working:**
- ✅ Pages load without errors
- ✅ Forms submit successfully
- ✅ Data appears after actions
- ✅ No console errors

**Backend Working:**
- ✅ API calls return 200/201 status
- ✅ Data is saved to database
- ✅ Responses contain expected data
- ✅ No 500 errors

**Database Working:**
- ✅ `ride_app.db` file created (SQLite)
- ✅ Data persists after page refresh
- ✅ Can query data

---

## 🎯 Priority: Test These First

1. **Register** → Create account
2. **Login** → Get token
3. **Book Ride** → Create ride
4. **View Dashboard** → See your rides

If these work, the backend is functioning correctly! 🎉

See `TESTING_GUIDE.md` for complete detailed testing instructions.

