-- Database optimization script for notification performance
-- Run this to add missing indexes for better query performance

-- Add composite index for the most common notification query pattern
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_notifications_user_read_created" 
ON "in_app_notifications" ("user_id", "is_read", "created_at" DESC);

-- Add composite index for user notifications with expiration filter
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_notifications_user_expires_created" 
ON "in_app_notifications" ("user_id", "expires_at", "created_at" DESC);

-- Add index for notification cleanup jobs (expired notifications)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_notifications_expires_cleanup" 
ON "in_app_notifications" ("expires_at") 
WHERE "expires_at" IS NOT NULL;

-- Add partial index for unread notifications (most commonly queried)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_notifications_unread_only" 
ON "in_app_notifications" ("user_id", "created_at" DESC) 
WHERE "is_read" = false;

-- Add index for service request notifications (if they're commonly queried)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_notifications_service_request" 
ON "in_app_notifications" ("service_request_id") 
WHERE "service_request_id" IS NOT NULL;

-- Add index for schedule notifications (if they're commonly queried)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_notifications_schedule" 
ON "in_app_notifications" ("schedule_id") 
WHERE "schedule_id" IS NOT NULL;

-- Statistics update for better query planning
ANALYZE "in_app_notifications";

-- Performance recommendations:
-- 1. Consider archiving notifications older than 6 months
-- 2. Set up automatic cleanup of expired notifications
-- 3. Consider pagination for large result sets
-- 4. Use read replicas for read-heavy notification queries

VACUUM ANALYZE "in_app_notifications";