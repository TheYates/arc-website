-- Create banners table with optimized indexing
-- This script can be run manually in the database if Prisma migrations fail

CREATE TABLE IF NOT EXISTS "banners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "url" TEXT,
    "width" INTEGER NOT NULL DEFAULT 120,
    "height" INTEGER NOT NULL DEFAULT 60,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS "banners_is_active_idx" ON "banners"("is_active");
CREATE INDEX IF NOT EXISTS "banners_sort_order_idx" ON "banners"("sort_order");
CREATE INDEX IF NOT EXISTS "banners_created_at_idx" ON "banners"("created_at");
CREATE INDEX IF NOT EXISTS "banners_is_active_sort_order_idx" ON "banners"("is_active", "sort_order");

-- Insert sample data
INSERT INTO "banners" ("id", "name", "src", "alt", "url", "width", "height", "is_active", "sort_order", "created_at", "updated_at")
VALUES 
    ('banner-1', 'UTB', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMTIwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMGQ5NDg4Ii8+Cjx0ZXh0IHg9IjYwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VVRCPC90ZXh0Pgo8L3N2Zz4K', 'UTB Logo', 'https://utbghana.com', 120, 60, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('banner-2', 'NOVA', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMTIwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMGQ5NDg4Ci8+Cjx0ZXh0IHg9IjYwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tk9WQTwvdGV4dD4KPHN2Zz4K', 'NOVA Logo', 'https://novaghana.com', 120, 60, true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('banner-3', 'Pastosa', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMTIwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMGQ5NDg4Ci8+Cjx0ZXh0IHg9IjYwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UEFTVD9TQTwvdGV4dD4KPHN2Zz4K', 'Pastosa Logo', 'https://pastosa.com', 120, 60, true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Update trigger for updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_banners_updated_at 
    BEFORE UPDATE ON "banners" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
