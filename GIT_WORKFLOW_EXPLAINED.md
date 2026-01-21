# Git Workflow Explained - Step by Step

## 🎯 The Complete Process

### Current Situation
- **Local code:** `C:\Users\koshi\cursor-apps\react-frontend-backend\` (has your updated code)
- **GitHub:** May or may not have your code
- **Droplet:** `/opt/fairfare-backend/` (old code)

---

## Step 1: Check if You Have a Git Repository

**On your local machine, check:**

```bash
cd C:\Users\koshi\cursor-apps\react-frontend-backend
git status
```

**What this tells you:**
- ✅ If it shows "On branch main/master" → You have a git repo
- ❌ If it shows "not a git repository" → You need to create one

---

## Step 2: If No Git Repo - Initialize One

**On your local machine:**

```bash
cd C:\Users\koshi\cursor-apps\react-frontend-backend
git init
git add .
git commit -m "Initial commit - backend code"
```

**What this does:**
- Creates a git repository in your local folder
- Adds all files to git
- Creates first commit

---

## Step 3: Create GitHub Repository

**On GitHub website:**
1. Go to github.com
2. Click "New repository"
3. Name it (e.g., `fairfare-backend`)
4. Don't initialize with README (you already have files)
5. Click "Create repository"

**GitHub will show you commands - but DON'T run them yet!**

---

## Step 4: Connect Local to GitHub

**On your local machine:**

```bash
cd C:\Users\koshi\cursor-apps\react-frontend-backend
git remote add origin https://github.com/YOUR_USERNAME/fairfare-backend.git
git branch -M main
git push -u origin main
```

**What this does:**
- Links your local repo to GitHub
- Pushes your code to GitHub
- GitHub now has your code

---

## Step 5: On Droplet - Clone or Pull

**Option A: If droplet already has git repo:**

```bash
cd /opt/fairfare-backend
git remote -v  # Check if remote is set
git pull origin main
```

**Option B: If droplet doesn't have git repo:**

```bash
cd /opt
# Backup old backend
sudo mv fairfare-backend fairfare-backend-backup

# Clone fresh from GitHub
git clone https://github.com/YOUR_USERNAME/fairfare-backend.git fairfare-backend
```

**What this does:**
- Gets latest code from GitHub
- Updates files on droplet

---

## 📋 Complete Flow Diagram

```
Local Machine                    GitHub                    Droplet
     │                             │                          │
     │ 1. git init                 │                          │
     │ 2. git add .                │                          │
     │ 3. git commit               │                          │
     │                             │                          │
     │ 4. git push ───────────────>│                          │
     │                             │                          │
     │                             │ 5. git pull <────────────│
     │                             │                          │
```

---

## ⚠️ Important Notes

### What Gets Pushed to GitHub:
- ✅ Code files (`app.py`, `models.py`, etc.)
- ✅ `requirements.txt`
- ❌ `.env` file (should NOT be pushed - contains secrets)
- ❌ `venv/` folder (should NOT be pushed)

### What Happens on Droplet:
- Code files get updated
- `.env` file stays the same (not in git)
- You may need to run `pip install -r requirements.txt` if dependencies changed

---

## 🔍 Check Current State First

**Before doing anything, check:**

1. **Local machine:**
   ```bash
   cd C:\Users\koshi\cursor-apps\react-frontend-backend
   git status
   ```

2. **Droplet:**
   ```bash
   cd /opt/fairfare-backend
   git status
   ```

**This tells us:**
- Do you have git repos?
- Are they connected to GitHub?
- What's the current state?

---

## 🎯 Summary

**Git workflow:**
1. Local code → Push to GitHub
2. GitHub stores your code
3. Droplet → Pull from GitHub
4. Droplet gets updated code

**Benefits:**
- Version control
- Easy updates
- Can rollback if needed
- Same code everywhere

---

**Do you already have a GitHub repository, or do we need to create one?** 🔍

