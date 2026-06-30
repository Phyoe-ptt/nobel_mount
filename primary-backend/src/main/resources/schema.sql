-- Drop tables if they exist for clean initialization
DROP TABLE IF EXISTS facebook_messages CASCADE;
DROP TABLE IF EXISTS video_jobs CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Facebook Inbox Messages
CREATE TABLE facebook_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id VARCHAR(255) NOT NULL,
    recipient_id VARCHAR(255) NOT NULL,
    message_text TEXT,
    is_from_ai BOOLEAN DEFAULT FALSE,
    requires_human BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Roles & Permissions (RBAC)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    permissions JSONB
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL
);

-- Content Queue (State Machine)
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    script_or_audio TEXT,
    state VARCHAR(50) DEFAULT 'DRAFT', -- 'DRAFT', 'PENDING', 'PUBLISHED', 'FAILED'
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    scheduled_for TIMESTAMP,
    video_url TEXT,
    is_autopilot BOOLEAN DEFAULT FALSE,
    error_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Video Generation Pipeline State
CREATE TABLE video_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    state VARCHAR(50) DEFAULT 'queued', -- 'queued', 'synthesizing', 'transcribing', 'planning', 'fetching_assets', 'rendering', 'done', 'error'
    progress_percent INT DEFAULT 0,
    result_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert initial Mock Data
INSERT INTO roles (id, name, permissions) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Super Admin', '["CREATE_HUMAN", "MANAGE_AUTOPILOT", "VIEW_QUEUE"]'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Marketing Staff', '["VIEW_QUEUE"]');
