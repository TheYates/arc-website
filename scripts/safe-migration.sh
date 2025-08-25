#!/bin/bash

# Safe Migration Script - Always backup before migrations
# Usage: ./scripts/safe-migration.sh [migration-name]

set -e

MIGRATION_NAME=${1:-"migration-$(date +%Y%m%d-%H%M%S)"}

echo "🛡️  Safe Migration Process"
echo "=========================="

# Step 1: Create backup
echo "📦 Step 1: Creating backup before migration..."
./scripts/backup-database.sh "pre-migration-$MIGRATION_NAME"

if [ $? -ne 0 ]; then
    echo "❌ Backup failed! Aborting migration for safety."
    exit 1
fi

echo ""
echo "✅ Backup completed successfully!"
echo ""

# Step 2: Show pending migrations
echo "📋 Step 2: Checking pending migrations..."
npx prisma migrate status

echo ""
read -p "Proceed with migration? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Migration cancelled"
    exit 0
fi

# Step 3: Apply migrations
echo "🔄 Step 3: Applying migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo "📊 Database is now up to date"
else
    echo "❌ Migration failed!"
    echo "🔄 You can restore from backup using:"
    echo "   ./scripts/restore-database.sh backups/pre-migration-$MIGRATION_NAME.sql"
    exit 1
fi

# Step 4: Generate Prisma client
echo "🔄 Step 4: Generating Prisma client..."
npx prisma generate

echo ""
echo "🎉 Safe migration completed successfully!"
echo "💾 Backup saved as: backups/pre-migration-$MIGRATION_NAME.sql"
