-- Fix ownership for only existing tables
-- Run this in your Supabase SQL Editor

-- First, let's see what tables actually exist
SELECT tablename, tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Transfer ownership of existing tables only
-- Only run these for tables that exist (check the output above first)

-- If 'users' table exists:
ALTER TABLE users OWNER TO prisma;

-- If 'services' table exists:
-- ALTER TABLE services OWNER TO prisma;

-- If 'applications' table exists:
-- ALTER TABLE applications OWNER TO prisma;

-- Transfer ownership of sequences (for auto-increment IDs)
DO $$
DECLARE
    seq_name TEXT;
BEGIN
    FOR seq_name IN 
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public'
    LOOP
        EXECUTE 'ALTER SEQUENCE ' || seq_name || ' OWNER TO prisma';
    END LOOP;
END $$;

-- Grant additional permissions to ensure everything works
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO prisma;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO prisma;

-- Verify final ownership
SELECT tablename, tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
