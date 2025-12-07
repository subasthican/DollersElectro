# 🛡️ Security Guide After Hack

## 🚨 IMMEDIATE ACTIONS REQUIRED

### 1. Create .env File (CRITICAL!)

Your .env file was deleted. Create it NOW:

```bash
cd /Users/subasthican/Desktop/DollersElectro/DollersElectro/backend

# Create the file
nano .env
```

Copy and paste this content (update the values marked with ⚠️):

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/dollerselectro

# JWT Configuration - ⚠️ CHANGE THESE IMMEDIATELY!
JWT_SECRET=CHANGE-THIS-TO-A-LONG-RANDOM-STRING-$(openssl rand -base64 32)
JWT_REFRESH_SECRET=CHANGE-THIS-TO-ANOTHER-LONG-RANDOM-STRING-$(openssl rand -base64 32)
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
EMAIL_USER=manoharansubasthican@gmail.com
EMAIL_PASS=fbak jhdq dcea trgo

# Cloudinary Configuration - ⚠️ Get these from cloudinary.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Session Secret - ⚠️ CHANGE THIS!
SESSION_SECRET=$(openssl rand -base64 32)

# Ollama AI Configuration
OLLAMA_API_URL=http://localhost:11434
AI_MODEL=llama3.2

# Rate Limiting
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCKOUT_DURATION=900000

# OTP Configuration
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5
```

Save with `Ctrl+O`, then exit with `Ctrl+X`.

---

## 🔐 Change All Passwords

### Your Gmail App Password:
⚠️ **Your email app password is exposed!** Change it immediately:

1. Go to: https://myaccount.google.com/apppasswords
2. Delete the old app password
3. Generate a new one
4. Update `EMAIL_PASS` in your .env file

### Admin Password:
```bash
cd /Users/subasthican/Desktop/DollersElectro/DollersElectro/backend

# Create this script
nano change-admin-password.js
```

Paste this code:

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Find admin user
    const admin = await User.findOne({ email: 'manoharansubasthican@gmail.com' });
    
    if (!admin) {
      console.log('Admin not found!');
      process.exit(1);
    }
    
    // Set new password
    const newPassword = 'NewSecurePassword@2024';  // ⚠️ CHANGE THIS!
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    admin.password = hashedPassword;
    admin.isTemporaryPassword = false;
    await admin.save();
    
    console.log('✅ Admin password changed successfully!');
    console.log(`New password: ${newPassword}`);
    console.log('⚠️ WRITE THIS DOWN AND DELETE THIS SCRIPT!');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
```

Run it:
```bash
node change-admin-password.js
```

**Then DELETE the script immediately!**

---

## 🔍 Check Your System

### 1. Find Recently Modified Files:
```bash
# Files modified in last 24 hours
find /Users/subasthican/Desktop/DollersElectro -type f -mtime -1 -ls

# Files modified in last week
find /Users/subasthican/Desktop/DollersElectro -type f -mtime -7 -ls
```

### 2. Check for Suspicious Processes:
```bash
# Check running node processes
ps aux | grep node

# Check network connections
lsof -i -P | grep LISTEN

# Check for unusual processes
top -o cpu
```

### 3. Check MongoDB for Suspicious Data:
```bash
mongosh

use dollerselectro

# Check all users
db.users.find().pretty()

# Check recent orders
db.orders.find().sort({createdAt: -1}).limit(10).pretty()

# Look for suspicious admin users
db.users.find({role: 'admin'}).pretty()
```

---

## 🔒 Secure Your System

### 1. Update Everything:
```bash
# Update Homebrew
brew update && brew upgrade

# Update Node.js packages
cd /Users/subasthican/Desktop/DollersElectro/DollersElectro/backend
npm audit fix

cd /Users/subasthican/Desktop/DollersElectro/DollersElectro/frontend
npm audit fix
```

### 2. Enable Firewall:
```bash
# Enable Mac firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
```

### 3. Install Security Tools:
```bash
# Install fail2ban (prevents brute force)
brew install fail2ban

# Install rkhunter (rootkit hunter)
brew install rkhunter

# Run scan
sudo rkhunter --check
```

### 4. Backup Your Database:
```bash
# Create backup directory
mkdir -p ~/DollersElectro-Backups

# Backup MongoDB
mongodump --db dollerselectro --out ~/DollersElectro-Backups/backup-$(date +%Y%m%d-%H%M%S)

# Backup your code
cd /Users/subasthican/Desktop
tar -czf ~/DollersElectro-Backups/code-backup-$(date +%Y%m%d-%H%M%S).tar.gz DollersElectro/
```

---

## 📊 Monitor Logs

### Watch Backend Logs in Real-time:
```bash
cd /Users/subasthican/Desktop/DollersElectro/DollersElectro/backend
tail -f logs/combined.log
```

### Check for Failed Login Attempts:
```bash
grep "failed" logs/combined.log | tail -20
grep "401" logs/combined.log | tail -20
grep "unauthorized" logs/combined.log | tail -20
```

---

## 🚀 Restart Everything Securely

### 1. Stop All Servers:
```bash
# Kill all node processes
pkill -f node

# Kill Ollama
pkill -f ollama

# Stop MongoDB
brew services stop mongodb-community
```

### 2. Start MongoDB:
```bash
brew services start mongodb-community
```

### 3. Start Backend (with new .env):
```bash
cd /Users/subasthican/Desktop/DollersElectro/DollersElectro/backend
node server.js
```

### 4. Start Frontend:
```bash
cd /Users/subasthican/Desktop/DollersElectro/DollersElectro/frontend
npm start
```

### 5. Start Ollama:
```bash
ollama serve
```

---

## ✅ Security Checklist

- [ ] Created new .env file with secure random secrets
- [ ] Changed Gmail app password
- [ ] Changed admin password in database
- [ ] Ran system scan for malware
- [ ] Checked MongoDB for suspicious users/data
- [ ] Updated all npm packages (`npm audit fix`)
- [ ] Enabled system firewall
- [ ] Created database backup
- [ ] Created code backup
- [ ] Reviewed recent file modifications
- [ ] Checked running processes
- [ ] Reviewed server logs
- [ ] Changed all JWT secrets
- [ ] Enabled 2FA on all external accounts (Gmail, Cloudinary, etc.)

---

## 🆘 If You Find Malware

1. **Disconnect from internet immediately**
2. **Run full antivirus scan:**
   ```bash
   # Install ClamAV
   brew install clamav
   
   # Update virus definitions
   freshclam
   
   # Scan your system
   clamscan -r /Users/subasthican/Desktop/DollersElectro
   ```

3. **Contact professionals if needed**

---

## 📱 Enable 2FA Everywhere

1. **Gmail:** https://myaccount.google.com/security
2. **GitHub:** Settings → Security → Two-factor authentication
3. **Cloudinary:** Account Settings → Security
4. **MongoDB Atlas:** (if using cloud) Security → Multi-Factor Authentication

---

## 🔄 Regular Maintenance

Going forward:

1. **Daily:**
   - Check server logs
   - Monitor failed login attempts

2. **Weekly:**
   - Backup database
   - Review user accounts
   - Check for suspicious activity

3. **Monthly:**
   - Update all packages
   - Rotate JWT secrets
   - Review security logs
   - Test backup restoration

---

## 📞 Emergency Contacts

- **MongoDB Support:** https://www.mongodb.com/support
- **Cloudinary Support:** https://support.cloudinary.com/
- **Node.js Security:** https://nodejs.org/en/security/

---

**Stay Safe! 🛡️**


