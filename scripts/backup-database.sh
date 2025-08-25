#!/bin/bash

# Database Backup Script
# Usage: ./scripts/backup-database.sh [backup-name]

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

# Get backup name or generate one with timestamp
BACKUP_NAME=${1:-"backup-$(date +%Y%m%d-%H%M%S)"}
BACKUP_DIR="backups"
BACKUP_FILE="$BACKUP_DIR/$BACKUP_NAME.sql"

# Create backups directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "🔄 Creating database backup..."
echo "📁 Backup location: $BACKUP_FILE"

# Extract database connection details from DATABASE_URL
# Format: postgresql://username:password@host:port/database
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

# Create backup using pg_dump
PGPASSWORD="$DB_PASS" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --verbose \
    --no-owner \
    --no-privileges \
    --format=plain \
    --file="$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: $BACKUP_FILE"
    echo "📊 Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"
    
    # List recent backups
    echo ""
    echo "📋 Recent backups:"
    ls -lth "$BACKUP_DIR"/*.sql 2>/dev/null | head -5 || echo "   No previous backups found"
else
    echo "❌ Backup failed!"
    exit 1
fi
