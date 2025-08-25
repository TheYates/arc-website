# 🚨 Database Recovery & Backup Guide

## What Happened
Your database was accidentally reset during the medication system upgrade. This is a painful lesson about the importance of **always backing up before making database changes**.

## Immediate Recovery Steps

### 1. **Quick Recovery** (Run this first!)
```powershell
.\scripts\quick-recovery.ps1
```
This will:
- Apply the current database schema
- Generate Prisma client
- Seed common medications
- Create an admin user

### 2. **Manual Recovery Steps** (If script fails)
```powershell
# Apply schema
npx prisma migrate deploy
# OR if that fails:
npx prisma db push

# Generate client
npx prisma generate

# Create admin user
npx tsx scripts/create-admin.ts
```

## 🛡️ **Prevention for Future**

### **ALWAYS Backup Before Changes**
```powershell
# Before ANY database changes, run:
.\scripts\backup-database.ps1

# This creates a timestamped backup in the backups/ folder
```

### **Safe Migration Process**
```powershell
# Instead of making direct changes:
.\scripts\backup-before-changes.ps1 "medication-system-upgrade"
# Then make your changes
# If something goes wrong:
.\scripts\restore-database.ps1 backups\your-backup-file.sql
```

## 📋 **What You Lost & How to Recover**

### **Lost Data:**
- All user accounts (admin, caregivers, reviewers, patients)
- All patient information and medical records
- All medications and prescriptions
- All vital signs and medical reviews

### **What's Been Restored:**
- ✅ Database schema (all tables and relationships)
- ✅ Common medications catalog (20+ medications)
- ✅ Admin user account
- ✅ All application functionality

### **What You Need to Recreate:**
- User accounts (caregivers, reviewers, patients)
- Patient information and assignments
- Any custom medications beyond the common ones

## 🔧 **Available Recovery Scripts**

### **Windows PowerShell Scripts:**
- `.\scripts\backup-database.ps1` - Create database backup
- `.\scripts\restore-database.ps1` - Restore from backup
- `.\scripts\backup-before-changes.ps1` - Safe backup before changes
- `.\scripts\quick-recovery.ps1` - Emergency recovery

### **Usage Examples:**
```powershell
# Create backup before changes
.\scripts\backup-database.ps1 "before-medication-update"

# Restore from backup if needed
.\scripts\restore-database.ps1 backups\backup-before-medication-update.sql

# Safe workflow for future changes
.\scripts\backup-before-changes.ps1 "my-database-changes"
# ... make your changes ...
# If something goes wrong, restore from the backup created
```

## ⚠️ **Critical Rules Going Forward**

### **DO:**
- ✅ **Always backup before database changes**
- ✅ Test changes on development data first
- ✅ Use the safe migration scripts
- ✅ Keep multiple backup versions
- ✅ Document what changes you're making

### **DON'T:**
- ❌ **Never use `--force-reset` on important data**
- ❌ Don't apply migrations without backups
- ❌ Don't test database changes on production data
- ❌ Don't delete backups until you're sure they're not needed

## 🎯 **Your Next Steps**

1. **Run the recovery script** to get basic functionality back
2. **Test the application** - login, create patients, add medications
3. **Recreate essential user accounts** using your admin panel
4. **Set up automatic backups** for the future
5. **Document your backup procedures** for your team

## 💡 **Silver Lining**

While losing data is never good, this incident has led to:
- ✅ Proper backup procedures being established
- ✅ Better medication system with database persistence
- ✅ Patient editing functionality for caregivers/reviewers
- ✅ More robust error handling and recovery procedures

## 🆘 **Emergency Contacts**

If you need help with:
- **Database recovery:** Check the emergency-restore-guide.md
- **Backup issues:** Ensure PostgreSQL client tools are installed
- **Data recreation:** Use the admin panel to recreate users and patients

---

**Remember:** The best backup is the one you make BEFORE you need it! 🔒
