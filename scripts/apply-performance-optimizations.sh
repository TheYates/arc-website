#!/bin/bash

# Performance Optimization Script for ARC Website
# This script applies database optimizations for notification performance

echo "🚀 Starting ARC Website Performance Optimization..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo "Please set your DATABASE_URL and try again"
    exit 1
fi

echo "📊 Applying database optimizations..."

# Apply the notification optimizations
psql "$DATABASE_URL" -f scripts/optimize-notifications-db.sql

if [ $? -eq 0 ]; then
    echo "✅ Database optimizations applied successfully!"
    echo ""
    echo "📈 Performance improvements applied:"
    echo "   • Optimized notification database indexes"
    echo "   • Added composite indexes for common query patterns"
    echo "   • Improved query performance for user notifications"
    echo ""
    echo "🎯 Expected improvements:"
    echo "   • Notification API response time: 2-25s → 100-500ms"
    echo "   • Reduced database load by 50-70%"
    echo "   • Cleaner console logs with less middleware spam"
    echo ""
    echo "🔄 Next steps:"
    echo "   1. Monitor API response times in your application"
    echo "   2. Check that notification polling is less frequent"
    echo "   3. Verify reduced console logging"
    echo ""
    echo "📖 For more details, see: docs/PERFORMANCE_OPTIMIZATION.md"
else
    echo "❌ Failed to apply database optimizations"
    echo "Please check your database connection and try again"
    exit 1
fi

echo "✨ Performance optimization complete!"