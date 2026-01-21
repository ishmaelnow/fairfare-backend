# Check fairfare-backend Database Configuration

## 🎯 Goal
Find which database `fairfare-backend` is configured to use.

---

## Step 1: Check fairfare-backend .env File

**Run this ONE command:**

```bash
cat ~/fairfare-backend/.env | grep DATABASE_URL
```

**What to look for:**
- The database name in the connection string
- Example: `postgresql://user:pass@localhost:5432/DATABASE_NAME`

---

## Step 2: Check fairfare-backend app.py Configuration

**Run this ONE command:**

```bash
grep -i "DATABASE_URL\|SQLALCHEMY_DATABASE_URI" ~/fairfare-backend/app.py
```

**What to look for:**
- What database URL is configured?
- Is it using PostgreSQL or SQLite?

---

## Step 3: Check What Tables Exist in That Database

**After finding the database name from Step 1, check tables:**

```bash
# If database is fairfare_db
sudo -u postgres psql -d fairfare_db -c "\dt"

# If database is something else, replace DATABASE_NAME
sudo -u postgres psql -d DATABASE_NAME -c "\dt"
```

**What to look for:**
- Do you see `users`, `rides`, `drivers` tables?
- Or different table names?

---

## Step 4: Check Schema of Tables (if they exist)

**If tables exist, check their schema:**

```bash
# Check users table
sudo -u postgres psql -d fairfare_db -c "\d users"

# Check rides table
sudo -u postgres psql -d fairfare_db -c "\d rides"

# Check drivers table
sudo -u postgres psql -d fairfare_db -c "\d drivers"
```

---

## 📋 Your API Models Expect These Tables

### Users Table:
- `id`, `name`, `email`, `password`, `is_driver`, `created_at`, `updated_at`

### Rides Table:
- `id`, `user_id`, `driver_id`, `rider_name`, `phone_number`, `email`, `pickup_location`, `dropoff_location`, `pickup_time`, `status`, `created_at`, `updated_at`

### Drivers Table:
- `id`, `user_id`, `vehicle_type`, `model`, `year`, `color`, `license_plate`, `is_approved`, `is_available`, `created_at`, `updated_at`

---

**Run Step 1 first to see what database fairfare-backend is using!** 🔍

