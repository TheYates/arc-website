# SQLite Migration Guide

## Overview

The ARC website has been successfully migrated from localStorage-based data storage to SQLite database. This provides better data persistence, performance, and scalability.

## What Changed

### Database Setup
- **Database Engine**: SQLite with better-sqlite3 package
- **Database File**: `data/arc.db`
- **Schema**: Comprehensive medical database schema with proper relationships

### API Layer
- **New SQLite APIs**: Created dedicated SQLite-based API functions
- **File Structure**:
  - `lib/database/sqlite.ts` - Database configuration and initialization
  - `lib/api/medications-sqlite.ts` - Medications and administrations API
  - `lib/api/patients-sqlite.ts` - Patients management API
  - `lib/api/auth-sqlite.ts` - User authentication API

### Updated Components
- **Caregiver Patient Details**: `app/caregiver/patients/[id]/page.tsx`
- **Caregiver Patients List**: `app/caregiver/patients/page.tsx`
- **Authentication**: `lib/auth.ts`

## Database Schema

### Core Tables
1. **users** - User accounts (admin, reviewer, caregiver, patient)
2. **patients** - Patient information and medical details
3. **medications** - Prescribed medications
4. **medication_administrations** - Administration records
5. **caregiver_assignments** - Patient-caregiver relationships
6. **vital_signs** - Patient vital signs records
7. **medical_reviews** - Medical review records
8. **symptom_reports** - Patient symptom reports

### Key Features
- **Foreign Key Constraints**: Proper data integrity
- **Indexes**: Optimized for common queries
- **Default Values**: Sensible defaults for all fields
- **Data Validation**: Check constraints for data quality

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- pnpm package manager

### Installation Steps

1. **Install SQLite Package**:
   ```bash
   pnpm add better-sqlite3
   ```

2. **Initialize Database**:
   ```bash
   pnpm run init-db
   ```

3. **Or do both in one command**:
   ```bash
   pnpm run setup-sqlite
   ```

### Default Data

The initialization script creates default users for testing:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@arc.com | password | System administrator |
| Reviewer | reviewer@arc.com | password | Medical reviewer/doctor |
| Caregiver | caregiver@arc.com | password | Care provider |
| Patient | patient@arc.com | password | Sample patient |

## Development

### Running the Application

```bash
# Start development server
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm run start
```

### Database Management

```bash
# Reinitialize database (WARNING: This will delete all data)
pnpm run init-db

# View database file location
ls -la data/arc.db
```

### API Usage Examples

```typescript
// Import SQLite APIs
import { getMedications, recordMedicationAdministration } from '@/lib/api/medications-sqlite';
import { getPatientById } from '@/lib/api/patients-sqlite';
import { authenticateUser } from '@/lib/api/auth-sqlite';

// Get patient medications
const medications = getMedications(patientId);

// Record medication administration
const administration = recordMedicationAdministration({
  medicationId: 'med-123',
  patientId: 'patient-456',
  caregiverId: 'caregiver-789',
  scheduledTime: new Date().toISOString(),
  actualTime: new Date().toISOString(),
  status: 'administered',
  dosageGiven: '10mg',
  notes: 'Patient took medication with breakfast',
  patientResponse: 'good'
});
```

## Migration Benefits

### Performance
- **Faster Queries**: SQLite provides optimized query execution
- **Concurrent Access**: Multiple users can access data simultaneously
- **Data Integrity**: ACID compliance ensures data consistency

### Scalability
- **Large Datasets**: Can handle thousands of records efficiently
- **Complex Queries**: Support for JOINs, aggregations, and advanced SQL
- **Backup & Recovery**: Standard database backup procedures

### Development
- **Type Safety**: Full TypeScript support with proper typing
- **Error Handling**: Comprehensive error handling and validation
- **Testing**: Easier to write tests with predictable data state

## File Structure

```
├── data/
│   └── arc.db                          # SQLite database file
├── lib/
│   ├── database/
│   │   └── sqlite.ts                   # Database configuration
│   └── api/
│       ├── medications-sqlite.ts       # Medications API
│       ├── patients-sqlite.ts          # Patients API
│       └── auth-sqlite.ts              # Authentication API
├── scripts/
│   └── init-sqlite.js                  # Database initialization
└── docs/
    └── SQLITE_MIGRATION.md             # This file
```

## Troubleshooting

### Common Issues

1. **better-sqlite3 installation fails**:
   ```bash
   # Try with build approval
   pnpm add better-sqlite3
   pnpm approve-builds
   ```

2. **Database file not found**:
   ```bash
   # Reinitialize database
   pnpm run init-db
   ```

3. **Permission errors**:
   ```bash
   # Ensure data directory is writable
   chmod 755 data/
   ```

### Development Tips

- **Database Browser**: Use SQLite browser tools to inspect data
- **Backup**: Regular backups of `data/arc.db` recommended
- **Testing**: Use separate test database for development

## Next Steps

1. **Add More Tables**: Extend schema for additional features
2. **Optimize Queries**: Add indexes for better performance
3. **Data Migration**: Tools for importing existing data
4. **Backup Strategy**: Automated backup procedures
5. **Monitoring**: Database performance monitoring

## Support

For issues or questions about the SQLite migration:
1. Check this documentation
2. Review the initialization script: `scripts/init-sqlite.js`
3. Examine the API files in `lib/api/`
4. Test with the default data provided
