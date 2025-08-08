# Database Testing Guide

## Overview

This guide helps you test all database operations to ensure PostgreSQL and Prisma are working correctly after the migration from SQLite.

## Prerequisites

Before running tests, ensure:

1. **PostgreSQL is running**
   ```bash
   # Check if PostgreSQL is running
   pg_isready -h localhost -p 5432
   ```

2. **Database exists**
   ```sql
   -- Connect to PostgreSQL and check
   psql -U postgres
   \l  -- List databases
   \c arcsite  -- Connect to your database
   ```

3. **Environment configured**
   ```bash
   # Check .env file contains:
   DATABASE_URL="postgresql://postgres:root@localhost:5432/arcsite?schema=public"
   ```

## Step-by-Step Testing

### 1. Quick Connection Test

```bash
# Run the quick test to verify basic connectivity
npm run test:quick
```

**Expected Output:**
```
✅ Prisma client imported successfully
✅ Database connection successful
✅ Database query successful - Found X users
✅ User data retrieved:
   - admin@arc.com (ADMIN)
   - reviewer@arc.com (REVIEWER)
   - caregiver@arc.com (CARE_GIVER)
   - patient@arc.com (PATIENT)
```

### 2. Full Database Operations Test

```bash
# Run comprehensive database tests
npm run db:test
```

**Tests Included:**
- ✅ Database Connection
- ✅ Database Schema Validation
- ✅ User CRUD Operations
- ✅ Patient CRUD Operations
- ✅ Medication CRUD Operations
- ✅ Authentication Flow

### 3. API Endpoints Test

```bash
# Start the development server first
npm run dev

# In another terminal, test API endpoints
npm run test:api
```

**Tests Included:**
- ✅ Server Health Check
- ✅ Authentication API
- ✅ Invalid Login Handling
- ✅ Medication Administration API

### 4. Manual Testing Steps

#### Test Authentication
1. Go to `http://localhost:3000/login`
2. Try logging in with default users:
   - **Admin**: admin@arc.com / password
   - **Reviewer**: reviewer@arc.com / password
   - **Caregiver**: caregiver@arc.com / password
   - **Patient**: patient@arc.com / password

#### Test Database Browser
```bash
# Open Prisma Studio to browse data
npm run db:studio
```

#### Test Patient Management
1. Login as caregiver
2. Go to `/caregiver/patients`
3. Verify patient list loads
4. Click on a patient to view details

## Troubleshooting

### Common Issues

#### 1. "Cannot connect to database"
```bash
# Check PostgreSQL status
pg_isready -h localhost -p 5432

# Start PostgreSQL if not running
# Windows: net start postgresql
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

#### 2. "Database does not exist"
```sql
-- Connect as postgres user and create database
psql -U postgres
CREATE DATABASE arcsite;
```

#### 3. "Prisma client not generated"
```bash
# Generate Prisma client
npx prisma generate
```

#### 4. "No users found"
```bash
# Seed the database with default users
npm run db:seed
```

#### 5. "Permission denied"
```sql
-- Grant permissions to your user
GRANT ALL PRIVILEGES ON DATABASE arcsite TO postgres;
```

### Reset Database (if needed)
```bash
# WARNING: This will delete all data
npm run db:reset

# Then re-seed
npm run db:seed
```

## Manual Verification Checklist

### ✅ Database Setup
- [ ] PostgreSQL is running
- [ ] Database `arcsite` exists
- [ ] Connection string in .env is correct
- [ ] Prisma client is generated

### ✅ Basic Operations
- [ ] Can connect to database
- [ ] Can query users table
- [ ] Default users exist
- [ ] Can create/read/update/delete records

### ✅ Authentication
- [ ] Can login with admin@arc.com
- [ ] Can login with other default users
- [ ] Invalid credentials are rejected
- [ ] Password hashing works

### ✅ Application Features
- [ ] Homepage loads correctly
- [ ] Login page works
- [ ] Caregiver dashboard loads
- [ ] Patient list displays
- [ ] Patient details page works

### ✅ API Endpoints
- [ ] /api/auth/login responds correctly
- [ ] /api/medications/administrations validates input
- [ ] Error handling works properly

## Performance Testing

### Database Performance
```bash
# Check query performance in Prisma Studio
npm run db:studio

# Monitor slow queries
# Enable query logging in Prisma client
```

### Load Testing
```bash
# Test with multiple concurrent requests
# Use tools like Apache Bench or Artillery
ab -n 100 -c 10 http://localhost:3000/api/auth/login
```

## Success Criteria

Your database migration is successful if:

1. ✅ All automated tests pass
2. ✅ You can login with default users
3. ✅ Patient data displays correctly
4. ✅ No console errors in browser
5. ✅ Prisma Studio shows proper data structure
6. ✅ API endpoints respond correctly

## Next Steps After Testing

Once all tests pass:

1. **Update documentation** with any environment-specific notes
2. **Set up backup procedures** for PostgreSQL
3. **Configure production environment** variables
4. **Set up monitoring** for database performance
5. **Plan data migration** from old SQLite (if needed)

## Support

If you encounter issues:

1. Check the error messages carefully
2. Verify all prerequisites are met
3. Review the troubleshooting section
4. Check PostgreSQL logs for detailed errors
5. Ensure all dependencies are installed correctly

Remember: The migration from SQLite to PostgreSQL is a significant change, so thorough testing is essential before deploying to production.
