-- Migration: 004_processed_events
-- Up
CREATE TABLE processed_events (
    event_id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    handler_name VARCHAR(100) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_processed_event UNIQUE (event_id, handler_name)
);

-- Enable RLS
ALTER TABLE processed_events ENABLE ROW LEVEL SECURITY;

-- Rollback
-- DROP TABLE IF EXISTS processed_events;
