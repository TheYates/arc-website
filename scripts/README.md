# Database Seeding Scripts

This directory contains scripts to seed the database with initial data for the ARC Healthcare application.

## Available Scripts

### 1. Admin Account Creation (`create-admin-accounts.ts`)

Creates or updates admin and super admin accounts for the application.

**Usage:**
```bash
# Using npm script (recommended)
npm run seed:admins

# Or directly with tsx
npx tsx scripts/create-admin-accounts.ts
```

**Created Accounts:**
- **Admin Account:**
  - Email: `admin@arc.com`
  - Password: `password`
  - Role: `ADMIN`
  - Username: `admin`

- **Super Admin Account:**
  - Email: `super@arc.com`
  - Password: `superpassword`
  - Role: `SUPER_ADMIN`
  - Username: `superadmin`

**Features:**
- ✅ Creates new admin accounts if they don't exist
- ✅ Updates existing accounts with correct passwords and roles
- ✅ Sets appropriate permissions (email verified, active, profile complete)
- ✅ No password change required for admin accounts
- ✅ Displays summary of all admin accounts after completion

### 2. Common Medications Seeding (`seed-common-medications.ts`)

Seeds the database with common medications for the medication catalog.

**Usage:**
```bash
# Using npm script (recommended)
npm run seed:medications

# Or directly with tsx
npx tsx scripts/seed-common-medications.ts
```

**Features:**
- ✅ Seeds 32 common medications across 13 drug classes
- ✅ Skips seeding if medications already exist
- ✅ Creates MedicationCatalog table if it doesn't exist
- ✅ Displays summary by drug class after completion

**Medication Categories:**
- Cardiovascular (8 medications)
- Antidiabetic (3 medications)
- Gastrointestinal (3 medications)
- Respiratory (3 medications)
- Antibiotic (4 medications)
- Pain Relief (4 medications)
- And 7 other categories...

## Prerequisites

Before running these scripts, ensure you have:

1. **Environment Variables:** Proper `.env` file with `DATABASE_URL`
2. **Database Connection:** Working PostgreSQL database connection
3. **Prisma Setup:** Run `npx prisma generate` to generate the Prisma client
4. **Dependencies:** All npm packages installed (`npm install`)

## Database Schema Requirements

These scripts require the following Prisma models to be defined:

- `User` model with proper fields and UserRole enum
- `MedicationCatalog` model (created automatically if missing)

## Running All Seed Scripts

To set up a complete development environment:

```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Run database migrations
npx prisma migrate dev

# 3. Create admin accounts
npm run seed:admins

# 4. Seed medications
npm run seed:medications
```

## Security Notes

⚠️ **Important:** These scripts create accounts with default passwords. In production:

1. Change default passwords immediately
2. Use environment variables for sensitive data
3. Consider using more secure password generation
4. Enable additional security measures (2FA, etc.)

## Troubleshooting

### Common Issues:

1. **"Property 'medicationCatalog' does not exist"**
   - Run `npx prisma generate` to regenerate the Prisma client
   - Ensure the MedicationCatalog model is in your schema

2. **Database connection errors**
   - Check your `DATABASE_URL` in `.env`
   - Ensure the database is running and accessible

3. **Migration errors**
   - Run `npx prisma migrate dev` to apply pending migrations
   - Check for schema conflicts

### Getting Help:

If you encounter issues:
1. Check the console output for detailed error messages
2. Verify your database connection
3. Ensure all dependencies are installed
4. Check that your Prisma schema is up to date

## Script Development

When creating new seeding scripts:

1. Follow the existing pattern with proper error handling
2. Include progress logging with emojis for better UX
3. Handle existing data gracefully (skip or update)
4. Add the script to package.json scripts section
5. Update this README with documentation
