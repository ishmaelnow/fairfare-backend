# View Current Nginx Configuration

## 🔍 Command to View the Config File

**On your Droplet, run:**

```bash
cat /etc/nginx/sites-available/fairfaretransportation.app
```

**Or if you want to see it with line numbers:**

```bash
cat -n /etc/nginx/sites-available/fairfaretransportation.app
```

**Or view it in an editor (easier to read):**

```bash
nano /etc/nginx/sites-available/fairfaretransportation.app
# (Press Ctrl+X to exit without saving)
```

---

## 📋 What to Look For

After viewing the file, check for:

1. ✅ **Server blocks** - How many `server { }` blocks?
2. ✅ **Server names** - What domains are configured?
3. ✅ **Location blocks** - What paths are handled? (`/api`, `/`, etc.)
4. ✅ **Proxy pass** - Where does it proxy to? (`http://127.0.0.1:8001`?)
5. ✅ **SSL configuration** - Is HTTPS set up?
6. ✅ **Port configuration** - HTTP (80) and HTTPS (443)?

---

## 📝 Share the Output

**After running the command, please share:**
- The full contents of the config file
- Or at least the relevant `server { }` blocks

**Then I can:**
- ✅ See what's currently configured
- ✅ Identify what needs to be added/changed
- ✅ Create the correct update (without conflicts)
- ✅ Ensure `api.fairfaretransportation.app` is properly configured

---

**Run `cat /etc/nginx/sites-available/fairfaretransportation.app` and share the output!** 🔍

