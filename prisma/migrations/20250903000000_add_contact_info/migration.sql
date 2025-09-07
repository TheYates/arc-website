-- CreateTable
CREATE TABLE "contact_info" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "support_hours" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_info_pkey" PRIMARY KEY ("id")
);

-- Insert default contact information
INSERT INTO "contact_info" ("id", "phone", "email", "address", "support_hours")
VALUES (
    gen_random_uuid()::text,
    '+233 XX XXX XXXX',
    'info@alpharescue.com',
    'Accra, Ghana',
    'Mon-Fri, 8AM-6PM'
);
