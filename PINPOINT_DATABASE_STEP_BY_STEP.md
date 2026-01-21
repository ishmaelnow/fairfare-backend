# Pinpoint the Database - Step by Step

## 🎯 Goal
Find which database matches your API models and which one your backend is configured to use.

---

## Step 1: Check What Database Backend is Configured to Use

**Run this ONE command:**

```bash
cat ~/new_fairfare-backend/.env | grep DATABASE_URL
```

**What to look for:**
- The database name in the connection string (e.g., `new_fairfare_db` or `fairfare_db`)

**From your output, I see:**
- `DATABASE_URL=postgresql://new_fairfare_user:fairfare_pass@localhost:5432/new_fairfare_db`
- This means backend is configured to use: **`new_fairfare_db`**

---

## Step 2: Check What Tables Exist in new_fairfare_db

**Run this ONE command:**

```bash
sudo -u postgres psql -d new_fairfare_db -c "\dt"
```

**What to look for:**
- Do you see `users`, `rides`, `drivers` tables?
- Or different table names?

---

## Step 3: Check What Tables Exist in fairfare_db (for comparison)

**Run this ONE command:**

```bash
sudo -u postgres psql -d fairfare_db -c "\dt"
```

**What to look for:**
- Compare with `new_fairfare_db`
- Which one has the tables you expect?

---

## Step 4: Check Schema of Users Table (if it exists)

**If `users` table exists in new_fairfare_db:**

```bash
sudo -u postgres psql -d new_fairfare_db -c "\d users"
```

**If `users` table exists in fairfare_db:**

```bash
sudo -u postgres psql -d fairfare_db -c "\d users"
```

**What to look for:**
- Does it have: `id`, `name`, `email`, `password`, `is_driver`, `created_at`, `updated_at`?
- Or different columns?

---

## Step 5: Check Schema of Rides Table (if it exists)

**If `rides` table exists:**

```bash
# For new_fairfare_db
sudo -u postgres psql -d new_fairfare_db -c "\d rides"

# For fairfare_db
sudo -u postgres psql -d fairfare_db -c "\d rides"
```

**What to look for:**
- Does it have: `id`, `user_id`, `driver_id`, `rider_name`, `phone_number`, `email`, `pickup_location`, `dropoff_location`, `pickup_time`, `status`, `created_at`, `updated_at`?

---

## Step 6: Check Schema of Drivers Table (if it exists)

**If `drivers` table exists:**

```bash
# For new_fairfare_db
sudo -u postgres psql -d new_fairfare_db -c "\d drivers"

# For fairfare_db
sudo -u postgres psql -d fairfare_db -c "\d drivers"
```

**What to look for:**
- Does it have: `id`, `user_id`, `vehicle_type`, `model`, `year`, `color`, `license_plate`, `is_approved`, `is_available`, `created_at`, `updated_at`?

---

## 📋 Your API Models Expect These Tables

### Users Table:
- `id` (primary key)
- `name`
- `email` (unique)
- `password`
- `is_driver` (boolean)
- `created_at`
- `updated_at`

### Rides Table:
- `id` (primary key)
- `user_id` (foreign key)
- `driver_id` (foreign key, nullable)
- `rider_name`
- `phone_number`
- `email`
- `pickup_location`
- `dropoff_location`
- `pickup_time`
- `status`
- `created_at`
- `updated_at`

### Drivers Table:
- `id` (primary key)
- `user_id` (foreign key, unique)
- `vehicle_type`
- `model`
- `year`
- `color`
- `license_plate` (unique)
- `is_approved` (boolean)
- `is_available` (boolean)
- `created_at`
- `updated_at`

---

## 🎯 Summary Checklist

After running the steps above, check:

- [ ] Which database is backend configured to use? (`new_fairfare_db` or `fairfare_db`)
- [ ] Does that database have `users`, `rides`, `drivers` tables?
- [ ] Do the columns match your API models?
- [ ] If not, which database has the correct schema?

---

**Run Step 1 first, then Step 2, and share the results. We'll go step by step!** 🔍

