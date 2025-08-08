# PostgreSQL Migration Guide

## Overview

The ARC website has been migrated from SQLite to PostgreSQL with Prisma ORM. This provides better scalability, performance, and advanced database features for production use.

## What Changed

### Database Engine
- **From**: SQLite with better-sqlite3
- **To**: PostgreSQL with Prisma ORM
- **Benefits**: Better concurrency, ACID compliance, advanced data types, full-text search

### Schema Changes
- **UUID Primary Keys**: All tables now use UUID instead of TEXT
- **Proper Relationships**: Foreign key constraints with proper cascade behavior
- **Enums**: Database-level enums for better data integrity
- **Advanced Types**: JSON fields, arrays, and proper timestamp handling

### API Layer
- **New Prisma APIs**: All database operations now use Prisma
- **Type Safety**: Full TypeScript support with generated types
- **File Structure**:
  - `lib/database/postgresql.ts` - Database configuration
  - `lib/api/auth-prisma.ts` - Authentication API
  - `lib/api/patients-prisma.ts` - Patients management API
  - `lib/api/medications-prisma.ts` - Medications and prescriptions API
  - `prisma/schema.prisma` - Database schema definition
  - `prisma/seed.ts` - Database seeding script

## Prerequisites

### System Requirements
- Node.js 18+
- PostgreSQL 12+ (local or remote)
- pnpm package manager

### PostgreSQL Setup
1. **Install PostgreSQL** (if not already installed):
   ```bash
   # Windows (using Chocolatey)
   choco install postgresql

   # macOS (using Homebrew)
   brew install postgresql

   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   ```

2. **Start PostgreSQL service**:
   ```bash
   # Windows
   net start postgresql

   # macOS
   brew services start postgresql

   # Linux
   sudo systemctl start postgresql
   ```

3. **Create database**:
   ```sql
   -- Connect to PostgreSQL as superuser
   psql -U postgres

   -- Create database
   CREATE DATABASE arc_website;

   -- Create user (optional)
   CREATE USER arc_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE arc_website TO arc_user;
   ```

## Installation & Setup

### 1. Environment Configuration
Create or update your `.env` file:
```env
# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/arc_website?schema=public"

# Replace with your actual credentials:
# postgresql://username:password@host:port/database?schema=public
```

### 2. Install Dependencies
```bash
# Install all dependencies including Prisma
pnpm install

# Or install Prisma specifically
pnpm add prisma @prisma/client
pnpm add bcryptjs @types/bcryptjs
pnpm add -D tsx
```

### 3. Setup Database
```bash
# Run the complete setup script
pnpm run setup-postgres

# Or run steps manually:
pnpm run db:generate  # Generate Prisma client
pnpm run db:push      # Create database schema
pnpm run db:seed      # Seed with initial data
```

## Database Schema

### Core Models
1. **User** - User accounts with role-based access
2. **Patient** - Extended patient information
3. **CaregiverAssignment** - Patient-caregiver relationships
4. **Medication** - Medication catalog
5. **Prescription** - Prescribed medications
6. **MedicationAdministration** - Administration records
7. **VitalSigns** - Patient vital signs
8. **MedicalReview** - Medical review records
9. **SymptomReport** - Patient symptom reports
10. **MedicalSupplyRequest** - Medical supply requests
11. **Service** - Service catalog
12. **ServiceItem** - Service items and options

### Key Features
- **UUID Primary Keys**: Better for distributed systems
- **Enum Types**: Database-level validation
- **JSON Fields**: Flexible data storage
- **Array Fields**: Multiple values in single column
- **Proper Relationships**: Foreign keys with cascade options
- **Timestamps**: Automatic created/updated tracking

## Default Data

The setup script creates default users for testing:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@arc.com | password | System administrator |
| Reviewer | reviewer@arc.com | password | Medical reviewer/doctor |
| Caregiver | caregiver@arc.com | password | Care provider |
| Patient | patient@arc.com | password | Sample patient with profile |

## Development Commands

```bash
# Database operations
pnpm run db:generate    # Generate Prisma client
pnpm run db:push        # Push schema changes
pnpm run db:migrate     # Create and run migrations
pnpm run db:seed        # Seed database
pnpm run db:reset       # Reset database (WARNING: deletes all data)
pnpm run db:studio      # Open Prisma Studio (database GUI)

# Application
pnpm run dev           # Start development server
pnpm run build         # Build for production
pnpm run start         # Start production server
```

## API Usage Examples

```typescript
// Import Prisma APIs
import { authenticateUser } from '@/lib/api/auth-prisma';
import { getPatientById } from '@/lib/api/patients-prisma';
import { getAllMedications } from '@/lib/api/medications-prisma';

// Authenticate user
const result = await authenticateUser('admin@arc.com', 'password');
if (result.success) {
  console.log('User:', result.user);
}

// Get patient with relationships
const patient = await getPatientById('patient-uuid');
console.log('Patient:', patient);

// Get all medications
const medications = await getAllMedications();
console.log('Medications:', medications);
```

## Migration from SQLite

If migrating from the previous SQLite setup:

1. **Backup existing data** (if needed)
2. **Update environment variables** to PostgreSQL
3. **Run setup script**: `pnpm run setup-postgres`
4. **Update imports** from SQLite APIs to Prisma APIs
5. **Test all functionality**

## Troubleshooting

### Common Issues

1. **Connection refused**:
   ```bash
   # Check if PostgreSQL is running
   pg_isready -h localhost -p 5432
   
   # Start PostgreSQL service
   sudo systemctl start postgresql  # Linux
   brew services start postgresql   # macOS
   ```

2. **Database does not exist**:
   ```sql
   -- Connect and create database
   psql -U postgres
   CREATE DATABASE arc_website;
   ```

3. **Permission denied**:
   ```sql
   -- Grant permissions
   GRANT ALL PRIVILEGES ON DATABASE arc_website TO your_user;
   ```

4. **Prisma client not generated**:
   ```bash
   pnpm run db:generate
   ```

### Performance Tips

- **Indexes**: Prisma automatically creates indexes for foreign keys
- **Connection pooling**: Configure in DATABASE_URL for production
- **Query optimization**: Use Prisma's include/select for efficient queries

## Production Deployment

### Environment Variables
```env
# Production database URL
DATABASE_URL="postgresql://user:password@host:port/database?schema=public&connection_limit=5"

# Optional: Shadow database for migrations
SHADOW_DATABASE_URL="postgresql://user:password@host:port/shadow_db"
```

### Deployment Steps
1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations: `npx prisma migrate deploy`
4. Generate client: `npx prisma generate`
5. Start application

## Support

For issues or questions about the PostgreSQL migration:
1. Check this documentation
2. Review Prisma documentation: https://prisma.io/docs
3. Check the setup script: `scripts/setup-postgres.js`
4. Examine the schema: `prisma/schema.prisma`
