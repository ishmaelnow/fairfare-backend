# Backend Testing Guide

Complete guide to test all backend functionalities for your React frontend.

## 🎯 Quick Test Checklist

### ✅ Test 1: Health Check (No Auth Required)
**Endpoint:** `GET /api/health`

**How to test:**
1. Open browser: `http://localhost:8001/api/health`
2. Or use curl:
   ```powershell
   curl http://localhost:8001/api/health
   ```

**Expected Response:**
```json
{
  "status": "healthy",
  "message": "API is running"
}
```

---

### ✅ Test 2: User Registration
**Endpoint:** `POST /api/users/register`

**How to test via Frontend:**
1. Go to `http://localhost:3000/register`
2. Fill in:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Password: "password123"
3. Check "I agree to Terms of Service"
4. Click "Register"

**Expected Result:**
- Success message: "User registered successfully!"
- Redirected to login page

**How to test via API (curl/Postman):**
```powershell
curl -X POST http://localhost:8001/api/users/register `
  -H "Content-Type: application/json" `
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**What to verify:**
- ✅ User is created in database
- ✅ Password is hashed (not stored as plain text)
- ✅ Cannot register with same email twice (should show error)

---

### ✅ Test 3: User Login
**Endpoint:** `POST /api/users/login`

**How to test via Frontend:**
1. Go to `http://localhost:3000/login`
2. Enter:
   - Email: "john@example.com"
   - Password: "password123"
3. Click "Login"

**Expected Result:**
- Success message: "Login successful!"
- Token stored in localStorage
- Redirected to `/book-ride` page

**How to test via API:**
```powershell
curl -X POST http://localhost:8001/api/users/login `
  -H "Content-Type: application/json" `
  -d '{"email":"john@example.com","password":"password123"}'
```

**Expected Response:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "isDriver": false
  }
}
```

**What to verify:**
- ✅ Token is returned
- ✅ Token is valid JWT format
- ✅ Wrong password shows error
- ✅ Non-existent email shows error
- ✅ Token is stored in browser localStorage

---

### ✅ Test 4: Book a Ride (Requires Auth)
**Endpoint:** `POST /api/rides`

**Prerequisites:** Must be logged in (have token)

**How to test via Frontend:**
1. Make sure you're logged in
2. Go to `http://localhost:3000/book-ride`
3. Fill in the form:
   - Your Name: "John Doe"
   - Phone Number: "+1234567890"
   - Email: "john@example.com"
   - Pickup Location: "123 Main St, City"
   - Dropoff Location: "456 Oak Ave, City"
   - Pickup Time: Select a future date/time
4. Click "Book Ride"

**Expected Result:**
- Success message: "Ride booked successfully!"
- Ride appears in dashboard
- If driver available, ride is assigned

**How to test via API:**
```powershell
# First, get token from login
$response = curl -X POST http://localhost:8001/api/users/login `
  -H "Content-Type: application/json" `
  -d '{"email":"john@example.com","password":"password123"}'
$token = ($response | ConvertFrom-Json).token

# Then book ride
curl -X POST http://localhost:8001/api/rides `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{
    "riderName": "John Doe",
    "phoneNumber": "+1234567890",
    "email": "john@example.com",
    "pickupLocation": "123 Main St",
    "dropoffLocation": "456 Oak Ave",
    "pickupTime": "2024-12-31T10:00"
  }'
```

**Expected Response:**
```json
{
  "message": "Ride booked successfully",
  "ride": {
    "id": 1,
    "riderName": "John Doe",
    "pickupLocation": "123 Main St",
    "dropoffLocation": "456 Oak Ave",
    "status": "pending",
    "driverId": null
  }
}
```

**What to verify:**
- ✅ Ride is created in database
- ✅ Cannot book without being logged in (401 error)
- ✅ All required fields validated
- ✅ Invalid token shows 401 error

---

### ✅ Test 5: View My Rides
**Endpoint:** `GET /api/users/rides`

**Prerequisites:** Must be logged in

**How to test via Frontend:**
1. Make sure you're logged in
2. Go to `http://localhost:3000/dashboard`
3. Should see list of your rides

**Expected Result:**
- List of all rides you've booked
- Each ride shows pickup/dropoff locations
- Shows pickup time

**How to test via API:**
```powershell
curl -X GET http://localhost:8001/api/users/rides `
  -H "Authorization: Bearer $token"
```

**Expected Response:**
```json
{
  "rides": [
    {
      "_id": 1,
      "riderName": "John Doe",
      "pickupLocation": "123 Main St",
      "dropoffLocation": "456 Oak Ave",
      "pickupTime": "2024-12-31T10:00:00",
      "status": "pending"
    }
  ]
}
```

**What to verify:**
- ✅ Only shows rides for logged-in user
- ✅ Empty array if no rides
- ✅ Shows rides in reverse chronological order (newest first)

---

### ✅ Test 6: Apply to Become Driver
**Endpoint:** `POST /api/users/become-driver`

**Prerequisites:** Must be logged in

**How to test via Frontend:**
1. Make sure you're logged in
2. Go to `http://localhost:3000/driver-signup`
3. Fill in vehicle details:
   - Vehicle Type: "Sedan"
   - Model: "Toyota Camry"
   - Year: "2022"
   - Color: "White"
   - License Plate: "ABC-1234"
4. Click "Submit Application"

**Expected Result:**
- Success message: "Application submitted successfully!"
- Redirected to dashboard
- Driver status: pending approval

**How to test via API:**
```powershell
curl -X POST http://localhost:8001/api/users/become-driver `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{
    "vehicleType": "Sedan",
    "model": "Toyota Camry",
    "year": "2022",
    "color": "White",
    "licensePlate": "ABC-1234"
  }'
```

**Expected Response:**
```json
{
  "message": "Driver application submitted successfully",
  "driver": {
    "id": 1,
    "vehicleType": "Sedan",
    "model": "Toyota Camry",
    "isApproved": false
  }
}
```

**What to verify:**
- ✅ Driver record created
- ✅ User's `is_driver` flag set to true
- ✅ Cannot apply twice (updates existing application)
- ✅ Requires all vehicle fields

---

### ✅ Test 7: List All Drivers (Admin)
**Endpoint:** `GET /api/drivers`

**How to test via Frontend:**
1. Go to `http://localhost:3000/manage-drivers`
2. Should see list of all drivers

**How to test via API:**
```powershell
curl -X GET http://localhost:8001/api/drivers
```

**Expected Response:**
```json
[
  {
    "_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "vehicle": "Sedan Toyota Camry (2022)",
    "isAvailable": false,
    "isApproved": false
  }
]
```

**What to verify:**
- ✅ Shows all drivers (approved and pending)
- ✅ Shows driver details
- ✅ Shows approval status

---

### ✅ Test 8: Approve Driver (Admin)
**Endpoint:** `PATCH /api/drivers/:id/approve`

**How to test via Frontend:**
1. Go to `http://localhost:3000/manage-drivers`
2. Find a pending driver
3. Click "Approve" button

**Expected Result:**
- Driver status changes to approved
- Driver becomes available

**How to test via API:**
```powershell
curl -X PATCH http://localhost:8001/api/drivers/1/approve
```

**Expected Response:**
```json
{
  "message": "Driver approved successfully",
  "driver": {
    "id": 1,
    "isApproved": true,
    "isAvailable": true
  }
}
```

**What to verify:**
- ✅ Driver is approved
- ✅ Driver becomes available
- ✅ Approved drivers can be assigned to rides

---

### ✅ Test 9: Toggle Driver Availability
**Endpoint:** `PATCH /api/drivers/:id/availability`

**How to test via Frontend:**
1. Go to `http://localhost:3000/manage-drivers`
2. Find an approved driver
3. Click "Mark as Available" or "Mark as Busy"

**How to test via API:**
```powershell
curl -X PATCH http://localhost:8001/api/drivers/1/availability `
  -H "Content-Type: application/json" `
  -d '{"isAvailable": true}'
```

**Expected Response:**
```json
{
  "message": "Driver availability updated",
  "driver": {
    "id": 1,
    "isAvailable": true
  }
}
```

**What to verify:**
- ✅ Availability status changes
- ✅ Only available drivers get assigned to new rides

---

### ✅ Test 10: Remove Driver
**Endpoint:** `DELETE /api/drivers/:id`

**How to test via Frontend:**
1. Go to `http://localhost:3000/manage-drivers`
2. Find a driver
3. Click "Remove" button
4. Confirm deletion

**How to test via API:**
```powershell
curl -X DELETE http://localhost:8001/api/drivers/1
```

**Expected Response:**
```json
{
  "message": "Driver removed successfully"
}
```

**What to verify:**
- ✅ Driver is removed from database
- ✅ User's `is_driver` flag set to false

---

## 🔄 Complete User Flow Test

Test the entire flow end-to-end:

1. **Register** → New user account
2. **Login** → Get JWT token
3. **Book Ride** → Create ride booking
4. **View Dashboard** → See your rides
5. **Apply as Driver** → Submit driver application
6. **Approve Driver** (as admin) → Approve the driver
7. **Book Another Ride** → Should auto-assign approved driver
8. **View Dashboard** → See ride with driver assigned

---

## 🐛 Error Testing

Test error handling:

### Test Invalid Registration
- Missing fields → Should show error
- Invalid email format → Should show error
- Duplicate email → Should show "User already exists"

### Test Invalid Login
- Wrong password → Should show "Invalid email or password"
- Non-existent email → Should show "Invalid email or password"

### Test Unauthorized Access
- Try to book ride without token → Should show 401 error
- Try with invalid token → Should show 401 error

### Test Validation
- Book ride with missing fields → Should show validation errors
- Invalid date format → Should handle gracefully

---

## 📊 Database Verification

After testing, verify data in database:

**If using SQLite:**
```powershell
# Install SQLite browser or use command line
sqlite3 ride_app.db
.tables
SELECT * FROM users;
SELECT * FROM rides;
SELECT * FROM drivers;
```

**If using PostgreSQL:**
```powershell
psql -U postgres -d ride_app_db
\dt
SELECT * FROM users;
SELECT * FROM rides;
SELECT * FROM drivers;
```

---

## 🎯 Priority Tests

**Must Test First:**
1. ✅ Health check
2. ✅ User registration
3. ✅ User login
4. ✅ Book ride

**Then Test:**
5. ✅ View rides
6. ✅ Driver signup
7. ✅ Driver management

---

## 📝 Testing Checklist

- [ ] Health check endpoint works
- [ ] Can register new user
- [ ] Cannot register duplicate email
- [ ] Can login with correct credentials
- [ ] Cannot login with wrong password
- [ ] Token is stored after login
- [ ] Can book ride when logged in
- [ ] Cannot book ride when not logged in
- [ ] Can view my rides
- [ ] Can apply to become driver
- [ ] Can see all drivers (admin)
- [ ] Can approve driver
- [ ] Can toggle driver availability
- [ ] Can remove driver
- [ ] Ride auto-assigns to available driver
- [ ] Error messages are clear and helpful

---

## 🚀 Quick Test Script

Save this as `test_backend.ps1`:

```powershell
Write-Host "Testing Backend API..." -ForegroundColor Green

# Test 1: Health Check
Write-Host "`n1. Testing Health Check..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:8001/api/health" -Method Get
Write-Host "✓ Health: $($health.status)" -ForegroundColor Green

# Test 2: Register User
Write-Host "`n2. Testing User Registration..." -ForegroundColor Yellow
$registerData = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json
try {
    $register = Invoke-RestMethod -Uri "http://localhost:8001/api/users/register" -Method Post -Body $registerData -ContentType "application/json"
    Write-Host "✓ User registered: $($register.user.email)" -ForegroundColor Green
} catch {
    Write-Host "✗ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Login
Write-Host "`n3. Testing User Login..." -ForegroundColor Yellow
$loginData = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json
try {
    $login = Invoke-RestMethod -Uri "http://localhost:8001/api/users/login" -Method Post -Body $loginData -ContentType "application/json"
    $token = $login.token
    Write-Host "✓ Login successful, token received" -ForegroundColor Green
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Test 4: Book Ride
Write-Host "`n4. Testing Ride Booking..." -ForegroundColor Yellow
$rideData = @{
    riderName = "Test User"
    phoneNumber = "+1234567890"
    email = "test@example.com"
    pickupLocation = "123 Test St"
    dropoffLocation = "456 Test Ave"
    pickupTime = "2024-12-31T10:00"
} | ConvertTo-Json
$headers = @{
    Authorization = "Bearer $token"
}
try {
    $ride = Invoke-RestMethod -Uri "http://localhost:8001/api/rides" -Method Post -Body $rideData -ContentType "application/json" -Headers $headers
    Write-Host "✓ Ride booked: $($ride.ride.id)" -ForegroundColor Green
} catch {
    Write-Host "✗ Ride booking failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Testing complete!" -ForegroundColor Green
```

Run it:
```powershell
.\test_backend.ps1
```

---

## 💡 Tips

1. **Use Browser DevTools** → Network tab to see API calls
2. **Check Console** → For any JavaScript errors
3. **Verify localStorage** → Token should be stored after login
4. **Test Error Cases** → Wrong passwords, missing fields, etc.
5. **Test Logout** → Clear token and try accessing protected routes

Happy Testing! 🎉

