# Database Migration: Pricing JSON to SQLite

## Overview
The admin services page has been successfully migrated from using `data/pricing.json` to using the SQLite database. This provides better data integrity, performance, and scalability.

## Changes Made

### 1. API Endpoint Updates (`app/api/admin/pricing/route.ts`)
- **Before**: Read/write data from `data/pricing.json` file
- **After**: Read/write data from SQLite database using existing services tables
- Maintains the same API interface for backward compatibility
- Transforms database structure to match the expected PricingItem format

### 2. Database Schema Used
The migration uses the existing SQLite tables:
- `services` - Main service definitions
- `service_categories` - Feature categories within services  
- `service_items` - Individual items/addons within categories

### 3. Data Transformation
- **Services** → `services` table
- **Features** → `service_categories` table  
- **Addons** → `service_items` table (with hierarchical support)

### 4. Migration Script
Created `scripts/migrate-pricing-json-to-db.js` to:
- Import existing pricing.json data into database
- Handle existing records (update vs create)
- Maintain hierarchical relationships
- Preserve all pricing and configuration data

## Benefits

### Performance
- Database queries are faster than file I/O
- Proper indexing for efficient lookups
- Concurrent access support

### Data Integrity
- ACID transactions ensure data consistency
- Foreign key constraints maintain relationships
- Type safety with database schema

### Scalability
- Can handle larger datasets efficiently
- Better memory usage
- Supports complex queries and filtering

## Backward Compatibility
- Admin interface remains unchanged
- API endpoints maintain same request/response format
- All existing functionality preserved

## Files Modified

### Admin API (Database-powered)
1. `app/api/admin/pricing/route.ts` - Main admin API endpoint
2. `app/admin/services/page.tsx` - Updated comments and descriptions

### Public API (Database-powered)
3. `app/api/services/pricing/route.ts` - Public services pricing API
4. `app/api/services/pricing/[serviceSlug]/route.ts` - Individual service pricing API
5. `app/api/services/adamfo-pa/route.ts` - ADAMFO PA specific API

### Migration & Documentation
6. `scripts/migrate-pricing-json-to-db.js` - Migration script (new)
7. `data/pricing.json.backup` - Backup of original file (new)
8. `MIGRATION_NOTES.md` - This documentation file (new)

## Testing

### Admin APIs
- ✅ GET `/api/admin/pricing` - Returns data from database
- ✅ POST `/api/admin/pricing` - Saves data to database
- ✅ Admin interface loads and functions correctly

### Public APIs
- ✅ GET `/api/services/pricing` - Returns public services from database
- ✅ GET `/api/services/pricing/ahenefie` - Returns specific service from database
- ✅ GET `/api/services/adamfo-pa` - Returns ADAMFO PA service from database

### Frontend Pages
- ✅ `/admin/services` - Admin services management page
- ✅ `/services/ahenefie` - AHENEFIE service page
- ✅ `/pricing` - Public pricing page
- ✅ All existing services and hierarchies preserved

## Database Used
The system uses **`data/arc.db`** as the active SQLite database file.
- `data/arc.db` - 152 KB (contains all data)
- `data/arc-website.db` - 0 KB (empty, not used)

## Sort Order Fix
**Issue**: When new features were added through the admin interface, they were getting `sortOrder: 0` by default, causing inconsistent ordering when the page was refreshed.

**Solution**:
1. **Backend Fix**: Updated the admin pricing API to automatically assign proper sort orders based on array position when `sortOrder` is 0 or undefined
2. **Frontend Fix**: Updated the admin interface to calculate the next available sort order when creating new items
3. **Database Fix**: Created a script to fix existing items with `sortOrder: 0`

**Files Modified for Sort Order Fix**:
- `app/api/admin/pricing/route.ts` - Enhanced sort order handling in save logic
- `app/admin/services/page.tsx` - Auto-assign sort orders for new items
- `scripts/fix-sort-orders.js` - Fix existing data with incorrect sort orders

**Testing**: ✅ Verified that features are now maintained in the correct order after save/refresh

## Database Constraint Fixes
**Issue**: Foreign key constraint failures and unique constraint violations when saving pricing data.

**Root Causes**:
1. **Foreign Key Constraints**: Attempting to create categories/items with invalid parent references
2. **Unique Constraints**: Duplicate service slugs when creating new services

**Solutions Applied**:
1. **Enhanced Validation**: Added existence checks before creating categories and items
2. **Unique Slug Generation**: Implemented automatic slug uniqueness with counter suffixes
3. **Graceful Error Handling**: Individual operation failures no longer crash the entire save process
4. **Better Logging**: Added detailed error messages for debugging

**Files Modified for Constraint Fixes**:
- `app/api/admin/pricing/route.ts` - Added validation and error handling for all database operations

**Testing**: ✅ Admin interface now saves successfully without 500 errors

## Next Steps
1. The `data/pricing.json` file can now be safely removed if desired
2. Consider adding database indexes for better performance
3. Implement database backup strategies
4. Add data validation at the database level
5. Monitor performance and optimize queries as needed

## Rollback Plan
If needed, the system can be rolled back by:
1. Reverting `app/api/admin/pricing/route.ts` to use file-based storage
2. Restoring `data/pricing.json` from `data/pricing.json.backup`
3. The database data will remain intact for future use
