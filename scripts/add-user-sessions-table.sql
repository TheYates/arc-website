-- Add UserSession table for JWT session management
-- Run this script when you have database access to add session storage
-- This will NOT affect any existing data

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);

-- Optional: Clean up any expired sessions that might exist
-- DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP;

COMMENT ON TABLE user_sessions IS 'Stores JWT session information for secure authentication';
COMMENT ON COLUMN user_sessions.id IS 'Unique identifier for the session';
COMMENT ON COLUMN user_sessions.user_id IS 'Reference to the user who owns this session';
COMMENT ON COLUMN user_sessions.session_token IS 'Unique session token for additional security';
COMMENT ON COLUMN user_sessions.expires_at IS 'When this session expires';
COMMENT ON COLUMN user_sessions.created_at IS 'When this session was created';
