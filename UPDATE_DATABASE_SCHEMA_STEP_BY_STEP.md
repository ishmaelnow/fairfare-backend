# Update Database Schema - Step by Step

## 🎯 Goal
Update `fairfare_db` schema to match your API models exactly.

---

## Step 1: Connect to fairfare_db

**Run this command:**

```bash
sudo -u postgres psql -d fairfare_db
```

**You should see:** `fairfare_db=#` prompt

---

## Step 2: Add `is_driver` column to users table

**While in PostgreSQL prompt, run:**

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_driver BOOLEAN DEFAULT FALSE NOT NULL;
```

**Expected output:** `ALTER TABLE`

**Verify it was added:**

```sql
\d users
```

**You should see:** `is_driver` column in the list

---

## Step 3: Add `updated_at` column to users table

**Run:**

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;
```

**Expected output:** `ALTER TABLE`

**Verify:**

```sql
\d users
```

---

## Step 4: Add `updated_at` column to rides table

**Run:**

```sql
ALTER TABLE rides ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;
```

**Expected output:** `ALTER TABLE`

**Verify:**

```sql
\d rides
```

---

## Step 5: Add `updated_at` column to drivers table

**Run:**

```sql
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;
```

**Expected output:** `ALTER TABLE`

**Verify:**

```sql
\d drivers
```

---

## Step 6: Fix `year` column data type in drivers table

**First, check if there's any data:**

```sql
SELECT COUNT(*) FROM drivers WHERE year IS NOT NULL;
```

**If count is 0 (no data), we can change the type directly:**

```sql
ALTER TABLE drivers ALTER COLUMN year TYPE INTEGER USING year::INTEGER;
```

**If count > 0 (has data), we need to convert existing values:**

```sql
-- First, ensure all year values are valid integers
UPDATE drivers SET year = NULL WHERE year !~ '^[0-9]+$';

-- Then change the type
ALTER TABLE drivers ALTER COLUMN year TYPE INTEGER USING year::INTEGER;
```

**Verify:**

```sql
\d drivers
```

**You should see:** `year | integer` instead of `year | character varying(10)`

---

## Step 7: Handle `password_hash` vs `password` naming

**Check your API models - do they use `password` or `password_hash`?**

**If API uses `password_hash`:** No change needed ✅

**If API uses `password`:** We need to rename the column:

```sql
ALTER TABLE users RENAME COLUMN password_hash TO password;
```

**Verify:**

```sql
\d users
```

---

## Step 8: Verify All Changes

**Check all three tables:**

```sql
\d users
\d rides
\d drivers
```

**Expected columns:**

**users:**
- ✅ `id`, `name`, `email`, `password_hash` (or `password`), `is_driver`, `created_at`, `updated_at`

**rides:**
- ✅ `id`, `user_id`, `driver_id`, `rider_name`, `phone_number`, `email`, `pickup_location`, `dropoff_location`, `pickup_time`, `status`, `created_at`, `updated_at`

**drivers:**
- ✅ `id`, `user_id`, `vehicle_type`, `model`, `year` (integer), `color`, `license_plate`, `is_approved`, `is_available`, `created_at`, `updated_at`

---

## Step 9: Exit PostgreSQL

**Run:**

```sql
\q
```

---

## 📋 Complete SQL Script (All Steps Together)

**If you want to run everything at once:**

```bash
sudo -u postgres psql -d fairfare_db <<EOF
-- Add is_driver to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_driver BOOLEAN DEFAULT FALSE NOT NULL;

-- Add updated_at to all tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Fix year column type (if no data exists)
ALTER TABLE drivers ALTER COLUMN year TYPE INTEGER USING year::INTEGER;

-- Verify changes
\d users
\d rides
\d drivers
EOF
```

---

**Start with Step 1 - connect to the database!** 🔍

