# Check API Models for Password Field

## 🔍 How to Check Your Models

### Option 1: Check models.py File on Your Local Machine

**The models file is at:**
- `C:\Users\koshi\cursor-apps\react-frontend-backend\models.py`

**Open it and look for the User model:**

```python
class User(db.Model):
    password = db.Column(...)  # ← Check this line
    # OR
    password_hash = db.Column(...)  # ← Or this line
```

---

### Option 2: Check models.py on Droplet

**On your Droplet, run:**

```bash
# Check fairfare-backend models
grep -A 2 "password" ~/fairfare-backend/models.py

# Or view the User model section
grep -A 10 "class User" ~/fairfare-backend/models.py | grep password
```

---

### Option 3: Check What I Found

**I already checked your models.py file:**

Looking at your `models.py` file, the User model has:

```python
class User(db.Model):
    password = db.Column(db.String(255), nullable=False)
```

**So your API models use:** `password` ✅

**But your database has:** `password_hash` ❌

---

## 🔧 What This Means

**Your API expects:** `password` column
**Your database has:** `password_hash` column

**You have two options:**

### Option A: Rename Database Column (Recommended)
Change database to match API:

```sql
ALTER TABLE users RENAME COLUMN password_hash TO password;
```

### Option B: Update API Model
Change API to match database:

```python
# In models.py, change:
password = db.Column(db.String(255), nullable=False)
# To:
password_hash = db.Column(db.String(255), nullable=False)
```

---

## ✅ Recommendation

**Rename the database column** to match your API models (Option A), since your API already uses `password`.

---

**Your models use `password`, so rename the database column!** 🔧

