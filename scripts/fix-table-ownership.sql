-- Fix table ownership for Prisma user
-- Run this in your Supabase SQL Editor

-- Transfer ownership of existing tables to prisma user
ALTER TABLE users OWNER TO prisma;
ALTER TABLE patients OWNER TO prisma;
ALTER TABLE services OWNER TO prisma;
ALTER TABLE applications OWNER TO prisma;

-- Also transfer ownership of sequences (for auto-increment IDs)
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

-- Verify ownership
SELECT tablename, tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
