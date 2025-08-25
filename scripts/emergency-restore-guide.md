# 🚨 Emergency Database Recovery Guide

## If Your Database Was Reset/Lost

### 1. **Check for Existing Backups**
```bash
ls -la backups/
```

### 2. **If You Have Backups**
```bash
./scripts/restore-database.sh backups/your-backup-file.sql
```

### 3. **If No Backups Exist**
Unfortunately, if no backups were created before the reset, the data cannot be recovered. However, you can:

#### A. **Recreate Essential Data**
```bash
# 1. Apply current schema
npx prisma db push

# 2. Seed common medications
npx prisma db execute --file=scripts/simple-seed-medications.sql --schema=prisma/schema.prisma

# 3. Run any existing seed scripts
npm run seed  # if you have a seed script
```

#### B. **Create Sample Data for Testing**
```bash
# Create admin user
npx tsx scripts/create-admin.ts

# Assign test data (if scripts exist)
npx tsx scripts/assign-patients-to-all-reviewers.js
```

## 🛡️ **Prevention for Future**

### **Always Backup Before Changes**
```bash
# Before any database changes
./scripts/backup-database.sh "before-medication-changes"

# Then make your changes safely
./scripts/safe-migration.sh
```

### **Set Up Automatic Backups**
Create a cron job or scheduled task:
```bash
# Example: Daily backup at 2 AM
0 2 * * * /path/to/your/project/scripts/backup-database.sh "daily-$(date +%Y%m%d)"
```

### **Use Safe Migration Process**
```bash
# Instead of: npx prisma db push --force-reset
# Use: ./scripts/safe-migration.sh
```

## 📋 **Recovery Checklist**

- [ ] Check for existing backups in `backups/` folder
- [ ] If backups exist, restore from most recent one
- [ ] If no backups, apply schema with `npx prisma db push`
- [ ] Seed essential data (medications, admin user)
- [ ] Test application functionality
- [ ] Set up future backup procedures

## 🔧 **Emergency Commands**

```bash
# Quick schema apply (if no backups)
npx prisma db push

# Seed medications only
npx prisma db execute --file=scripts/simple-seed-medications.sql --schema=prisma/schema.prisma

# Create admin user
npx tsx scripts/create-admin.ts

# Check database status
npx prisma migrate status

# Generate client after changes
npx prisma generate
```

## ⚠️ **What NOT to Do**

- ❌ Never use `--force-reset` on production/important data
- ❌ Don't apply migrations without backups
- ❌ Avoid direct database manipulation without backups
- ❌ Don't test database changes on production data

## ✅ **What TO Do**

- ✅ Always backup before changes
- ✅ Use the safe migration scripts
- ✅ Test changes on development data first
- ✅ Keep multiple backup versions
- ✅ Document your backup procedures
