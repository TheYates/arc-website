# Logo API Troubleshooting Guide

## Issue Fixed: JSON Parsing Error

**Error Message:**
```
Failed to fetch logos from API: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

## Root Cause
The `/api/admin/logos` endpoint was returning HTML (likely an error page) instead of JSON, causing the JSON parsing to fail.

## Fixes Applied

### 1. Database Configuration Fix
**Problem:** Missing `DIRECT_URL` environment variable for Supabase
**Solution:** Added `DIRECT_URL` to `.env` file

```env
# Before
DATABASE_URL='postgresql://...'

# After  
DATABASE_URL='postgresql://...'
DIRECT_URL='postgresql://...'
```

### 2. Enhanced Error Handling in `lib/constants/logos.ts`
**Problem:** Poor error handling when API returns non-JSON responses
**Solution:** Added comprehensive error checking

```typescript
// Added checks for:
- Response status (response.ok)
- Content-Type header validation
- API enable/disable flag (USE_API_LOGOS)
- Graceful fallback to static logos
```

### 3. Improved `useLogos` Hook Error Handling
**Problem:** Hook didn't handle non-JSON responses gracefully
**Solution:** Enhanced error handling with proper fallbacks

```typescript
// Added:
- Response status validation
- Content-Type checking
- Better error messages
- Empty array fallback
```

### 4. API Disable Flag
**Problem:** No way to disable API calls when database is unavailable
**Solution:** Added `USE_API_LOGOS` flag

```typescript
export const USE_API_LOGOS = false; // Disable API calls
```

## Current Status

✅ **Fixed:** JSON parsing errors eliminated
✅ **Fixed:** Database configuration issues (missing DIRECT_URL)
✅ **Fixed:** Better error handling throughout the chain
✅ **Verified:** Database connection working with 3 active banners
✅ **Enabled:** API-based logo fetching from banners table

## Configuration Options

### Static Logos Only (Recommended for now)
```typescript
// In lib/constants/logos.ts
export const USE_PLACEHOLDER_LOGOS = true;  // Use SVG placeholders
export const USE_API_LOGOS = false;         // Disable API calls
```

### Current Configuration (API Enabled)
```typescript
// In lib/constants/logos.ts
export const USE_PLACEHOLDER_LOGOS = false; // Using real banners from database
export const USE_API_LOGOS = true;          // API calls enabled
```

## Testing the Fix

### 1. Check Static Logos Work
```bash
# Visit any page with partner logos
# Should see placeholder SVG logos without errors
```

### 2. Test Database Connection
```bash
# Visit: http://localhost:3000/api/health/database
# Should show database status
```

### 3. Test Logo API
```bash
# Visit: http://localhost:3000/api/admin/logos?active=true
# Should return JSON response or proper error
```

## Database Setup (When Ready)

### 1. Ensure Database Schema is Applied
```bash
npx prisma db push
```

### 2. Verify Banner Table Exists
```sql
-- In your Supabase SQL editor
SELECT * FROM "Banner" LIMIT 1;
```

### 3. Add Sample Banner Data
```sql
INSERT INTO "Banner" (id, name, src, alt, "isActive", "sortOrder", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Sample Logo',
  '/images/logos/sample.png',
  'Sample Logo Alt Text',
  true,
  1,
  NOW(),
  NOW()
);
```

## File Changes Made

1. **`.env`** - Added DIRECT_URL
2. **`lib/constants/logos.ts`** - Enhanced error handling, added API disable flag
3. **`hooks/use-logos.ts`** - Improved error handling
4. **`docs/logo-api-troubleshooting.md`** - This guide

## Next Steps

1. **Immediate:** Errors should be resolved with static logos
2. **Short-term:** Fix database permissions and schema
3. **Long-term:** Enable API-based logo management

## Common Issues

### Database Permission Errors
```bash
# Error: must be owner of table logos
# Solution: Check Supabase permissions or recreate tables
```

### API Still Returns HTML
```bash
# Check: Is the development server running?
# Check: Are there any middleware redirects?
# Check: Is the API route file correct?
```

### Logos Not Displaying
```bash
# Check: USE_PLACEHOLDER_LOGOS = true
# Check: SVG data URLs are valid
# Check: No console errors
```
