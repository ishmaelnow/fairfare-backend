# How to Update Files - Explained

## 🎯 The Problem
- **Local files:** `C:\Users\koshi\cursor-apps\react-frontend-backend\` (Windows)
- **Droplet files:** `/opt/fairfare-backend/` (Linux)
- **Need to:** Copy local files to droplet

---

## Option 1: SCP (Secure Copy) - From Windows to Droplet

**On your Windows machine (PowerShell):**

```powershell
# Copy app.py
scp C:\Users\koshi\cursor-apps\react-frontend-backend\app.py ishmael@YOUR_DROPLET_IP:/opt/fairfare-backend/

# Copy models.py
scp C:\Users\koshi\cursor-apps\react-frontend-backend\models.py ishmael@YOUR_DROPLET_IP:/opt/fairfare-backend/

# Copy database.py
scp C:\Users\koshi\cursor-apps\react-frontend-backend\database.py ishmael@YOUR_DROPLET_IP:/opt/fairfare-backend/

# Copy requirements.txt
scp C:\Users\koshi\cursor-apps\react-frontend-backend\requirements.txt ishmael@YOUR_DROPLET_IP:/opt/fairfare-backend/
```

**What this does:**
- Connects to your droplet via SSH
- Copies files from Windows to Linux
- Overwrites existing files

**You'll need:** Your droplet IP address

---

## Option 2: Manual Edit on Droplet

**SSH into droplet, then edit files:**

```bash
# SSH into droplet
ssh ishmael@YOUR_DROPLET_IP

# Edit app.py
nano /opt/fairfare-backend/app.py
# Copy/paste content from your local file
# Save: Ctrl+X, Y, Enter
```

**What this does:**
- Opens file editor on droplet
- You manually copy content from local file
- Save changes

---

## Option 3: Git (If you have repository)

**If your code is in git:**

```bash
# On droplet
cd /opt/fairfare-backend
git pull origin main
```

**What this does:**
- Pulls latest code from git repository
- Updates files automatically

---

## Option 4: Create Files on Droplet via SSH

**SSH into droplet, create files:**

```bash
# SSH into droplet
ssh ishmael@YOUR_DROPLET_IP

# Create models.py
nano /opt/fairfare-backend/models.py
# Paste content from your local models.py
# Save: Ctrl+X, Y, Enter
```

---

## 📋 Files You Need to Copy

**Essential files:**
1. `app.py` - Main application
2. `models.py` - Database models (NEW - doesn't exist on droplet)
3. `database.py` - Database initialization
4. `requirements.txt` - Dependencies

**Optional files:**
- `.env` - Environment variables (be careful with secrets)

---

## 🎯 Recommended Approach

**Step 1:** Use SCP to copy files (fastest)
**Step 2:** Or manually edit if SCP doesn't work

**Which method do you prefer?**
1. SCP (need your droplet IP)
2. Manual edit (I'll guide you through each file)
3. Git (if you have repository)

---

**Tell me which method you want to use, and I'll give you the exact commands!** 🔧

