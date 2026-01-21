# Check if Database Matches API

## 🔍 Step 1: Check Which Database Backend is Configured to Use

**On your Droplet, check backend configuration:**

```bash
# Find backend directory
ls -la ~ | grep -E "react-frontend-backend|new_fairfare-backend|fairfare-backend"

# Check .env file for DATABASE_URL
cat ~/react-frontend-backend/.env 2>/dev/null | grep DATABASE_URL
cat ~/new_fairfare-backend/.env 2>/dev/null | grep DATABASE_URL
find ~ -name ".env" -type f -exec grep -l "DATABASE_URL" {} \; 2>/dev/null

# Check app.py for database configuration
grep -i "DATABASE_URL\|SQLALCHEMY_DATABASE_URI" ~/react-frontend-backend/app.py 2>/dev/null
grep -i "DATABASE_URL\|SQLALCHEMY_DATABASE_URI" ~/new_fairfare-backend/app.py 2>/dev/null
```

---

## 🔍 Step 2: Check What Tables Exist in Each Database

**Check tables in each database:**

```bash
# Check fairfare_db
sudo -u postgres psql -d fairfare_db -c "\dt"

# Check new_fairfare_db
sudo -u postgres psql -d new_fairfare_db -c "\dt"

# Check globapp_db (for reference)
sudo -u postgres psql -d globapp_db -c "\dt"
```

---

## 🔍 Step 3: Check Table Schemas

**Check if tables match your API models (User, Ride, Driver):**

```bash
# Check fairfare_db schema
sudo -u postgres psql -d fairfare_db -c "\d users"
sudo -u postgres psql -d fairfare_db -c "\d rides"
sudo -u postgres psql -d fairfare_db -c "\d drivers"

# Check new_fairfare_db schema
sudo -u postgres psql -d new_fairfare_db -c "\d users"
sudo -u postgres psql -d new_fairfare_db -c "\d rides"
sudo -u postgres psql -d new_fairfare_db -c "\d drivers"
```

---

## 📋 Expected Tables (Based on Your API Models)

**Your backend expects these tables:**

1. **`users` table:**
   - `id` (primary key)
   - `name`
   - `email` (unique)
   - `password_hash`
   - `role` (default: 'rider')
   - `created_at`

2. **`rides` table:**
   - `id` (primary key)
   - `user_id` (foreign key to users)
   - `driver_id` (foreign key to drivers, nullable)
   - `pickup_location`
   - `dropoff_location`
   - `status` (pending, assigned, completed, cancelled)
   - `created_at`
   - `updated_at`

3. **`drivers` table:**
   - `id` (primary key)
   - `user_id` (foreign key to users, unique)
   - `license_number`
   - `vehicle_info`
   - `is_approved` (boolean, default: false)
   - `is_available` (boolean, default: false)
   - `created_at`

---

## 🔍 Step 4: Compare Database Schema with Models

**Check if columns match:**

```bash
# Get full schema for users table
sudo -u postgres psql -d fairfare_db -c "\d+ users"

# Get full schema for rides table
sudo -u postgres psql -d fairfare_db -c "\d+ rides"

# Get full schema for drivers table
sudo -u postgres psql -d fairfare_db -c "\d+ drivers"
```

---

## 📋 Quick Check Script

**Run this to check everything:**

```bash
echo "=== Checking Backend Configuration ==="
find ~ -name "app.py" -path "*/react-frontend-backend/*" -o -path "*/new_fairfare-backend/*" 2>/dev/null | head -1 | xargs grep -i "DATABASE_URL\|SQLALCHEMY_DATABASE_URI" 2>/dev/null

echo ""
echo "=== Checking fairfare_db Tables ==="
sudo -u postgres psql -d fairfare_db -c "\dt" 2>/dev/null

echo ""
echo "=== Checking new_fairfare_db Tables ==="
sudo -u postgres psql -d new_fairfare_db -c "\dt" 2>/dev/null

echo ""
echo "=== Checking if tables match API models ==="
echo "Users table:"
sudo -u postgres psql -d fairfare_db -c "\d users" 2>/dev/null | head -15
echo ""
echo "Rides table:"
sudo -u postgres psql -d fairfare_db -c "\d rides" 2>/dev/null | head -15
echo ""
echo "Drivers table:"
sudo -u postgres psql -d fairfare_db -c "\d drivers" 2>/dev/null | head -15
```

---

## ✅ What to Look For

### Database Matches API If:
- ✅ Tables exist: `users`, `rides`, `drivers`
- ✅ Columns match your models (see expected tables above)
- ✅ Foreign keys are set up correctly
- ✅ Data types match (e.g., `id` is integer/serial, `email` is varchar/text)

### Database Doesn't Match If:
- ❌ Tables don't exist
- ❌ Column names are different
- ❌ Missing required columns
- ❌ Wrong data types
- ❌ Missing foreign key relationships

---

## 🎯 Next Steps Based on Results

### If Database Matches:
- ✅ Update backend `.env` to use the correct database
- ✅ Test API endpoints
- ✅ Ready to deploy!

### If Database Doesn't Match:
- 🔧 Option 1: Create new database with correct schema
- 🔧 Option 2: Migrate existing database to match schema
- 🔧 Option 3: Update models to match existing database

---

**Run the checks above to see if your databases match the API!** 🔍

