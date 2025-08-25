#!/bin/bash

# Database Restore Script
# Usage: ./scripts/restore-database.sh <backup-file>

set -e

if [ $# -eq 0 ]; then
    echo "❌ Usage: $0 <backup-file>"
    echo "📋 Available backups:"
    ls -1 backups/*.sql 2>/dev/null || echo "   No backups found"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

echo "⚠️  WARNING: This will replace ALL data in your database!"
echo "📁 Backup file: $BACKUP_FILE"
echo "📊 Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Restore cancelled"
    exit 0
fi

echo "🔄 Restoring database from backup..."

# Extract database connection details
DB_URL="$DATABASE_URL"

if [[ $DB_URL =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASS="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
else
    echo "❌ Could not parse DATABASE_URL"
    exit 1
fi

# Restore using psql
PGPASSWORD="$DB_PASS" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully from $BACKUP_FILE"
else
    echo "❌ Restore failed!"
    exit 1
fi
