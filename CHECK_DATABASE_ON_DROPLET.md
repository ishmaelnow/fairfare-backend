# Check if Database Exists on Droplet

## 🔍 How to Check for Database

### Step 1: Check if PostgreSQL is Installed

**On your Droplet, run:**

```bash
# Check if PostgreSQL is installed
which psql
# or
psql --version

# Check if PostgreSQL service exists
sudo systemctl status postgresql
# or
sudo service postgresql status
```

**If PostgreSQL is installed:**
- ✅ `psql --version` will show version number
- ✅ `systemctl status postgresql` will show service status

**If PostgreSQL is NOT installed:**
- ❌ `which psql` returns nothing
- ❌ `systemctl status postgresql` shows "Unit postgresql.service could not be found"

---

### Step 2: Check if PostgreSQL is Running

```bash
# Check PostgreSQL service status
sudo systemctl status postgresql

# Check if PostgreSQL is listening on port 5432
sudo netstat -tlnp | grep 5432
# or
sudo ss -tlnp | grep 5432
# or
sudo lsof -i :5432
```

**If running:**
- ✅ Service shows "active (running)"
- ✅ Port 5432 is listening

---

### Step 3: Check if Database Exists

**If PostgreSQL is installed and running:**

```bash
# Connect to PostgreSQL (as postgres user)
sudo -u postgres psql

# Once connected, list all databases
\l
# or
\list

# Check for your specific database
\l | grep ride_app
# or
\l | grep fairfare

# Exit PostgreSQL
\q
```

**Or check from command line:**

```bash
# List all databases
sudo -u postgres psql -l

# Check for specific database
sudo -u postgres psql -l | grep ride_app
sudo -u postgres psql -l | grep fairfare
```

---

### Step 4: Check SQLite Database (if using SQLite)

**Check if SQLite database file exists:**

```bash
# Check in common locations
ls -la ~/ride_app.db
ls -la /home/ishmael/ride_app.db
ls -la /var/www/ride_app.db
find /home -name "ride_app.db" 2>/dev/null
find /var/www -name "ride_app.db" 2>/dev/null

# Check where backend is running from
ps aux | grep gunicorn
ps aux | grep python | grep app.py
```

---

### Step 5: Check Backend Configuration

**Check what database the backend is configured to use:**

```bash
# Check backend .env file
cat ~/react-frontend-backend/.env 2>/dev/null
cat ~/new_fairfare-backend/.env 2>/dev/null
find ~ -name ".env" -type f 2>/dev/null

# Check app.py for database configuration
grep -i "DATABASE_URL\|SQLALCHEMY_DATABASE_URI" ~/react-frontend-backend/app.py 2>/dev/null
grep -i "DATABASE_URL\|SQLALCHEMY_DATABASE_URI" ~/new_fairfare-backend/app.py 2>/dev/null
```

---

## 📋 Quick Check Script

**Run this to check everything:**

```bash
echo "=== Checking PostgreSQL Installation ==="
which psql && psql --version || echo "PostgreSQL not found in PATH"
sudo systemctl status postgresql --no-pager | head -5

echo ""
echo "=== Checking PostgreSQL Service ==="
sudo systemctl is-active postgresql 2>/dev/null && echo "PostgreSQL is running" || echo "PostgreSQL is not running"

echo ""
echo "=== Checking Port 5432 ==="
sudo ss -tlnp | grep 5432 && echo "Port 5432 is listening" || echo "Port 5432 is not listening"

echo ""
echo "=== Checking Databases (if PostgreSQL exists) ==="
if command -v psql &> /dev/null; then
    sudo -u postgres psql -l 2>/dev/null | grep -E "Name|ride|fairfare" || echo "No matching databases found"
else
    echo "PostgreSQL not installed, skipping database check"
fi

echo ""
echo "=== Checking SQLite Database Files ==="
find ~ /var/www -name "*.db" -type f 2>/dev/null | head -5 || echo "No SQLite databases found"

echo ""
echo "=== Checking Backend .env Files ==="
find ~ -name ".env" -type f 2>/dev/null | head -3
```

---

## 🎯 What to Look For

### If PostgreSQL is Installed:
- ✅ `psql --version` shows version
- ✅ `systemctl status postgresql` shows service
- ✅ Can connect with `sudo -u postgres psql`
- ✅ Can list databases with `\l`

### If Database Exists:
- ✅ Database appears in `\l` output
- ✅ Database name matches your app (e.g., `ride_app_db`, `fairfare_db`)

### If Using SQLite:
- ✅ `.db` file exists somewhere
- ✅ Backend `.env` has `DATABASE_URL=sqlite:///ride_app.db`

---

## 📝 Summary

**To ascertain if database exists:**

1. **Check PostgreSQL:** `sudo systemctl status postgresql`
2. **If PostgreSQL exists:** `sudo -u postgres psql -l`
3. **Check SQLite:** `find ~ -name "*.db"`
4. **Check backend config:** `grep DATABASE_URL ~/.env` or check backend directory

---

**Run the quick check script above to see what's on your droplet!** 🔍

