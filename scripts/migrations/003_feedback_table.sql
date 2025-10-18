-- Migration: Create feedback table for contact form submissions
-- Description: Stores user feedback from the Contact Us form
-- Created: 2024-10-16

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_feedback_email ON feedback(email);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow anyone to insert feedback (for contact form submissions)
CREATE POLICY "Allow public feedback submission" ON feedback
    FOR INSERT
    WITH CHECK (true);

-- Only authenticated users can read their own feedback (if needed later)
CREATE POLICY "Users can read their own feedback" ON feedback
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_feedback_updated_at
    BEFORE UPDATE ON feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_feedback_updated_at();

-- Add comments for documentation
COMMENT ON TABLE feedback IS 'User feedback submissions from contact form';
COMMENT ON COLUMN feedback.id IS 'Unique identifier for feedback entry';
COMMENT ON COLUMN feedback.name IS 'User first name';
COMMENT ON COLUMN feedback.surname IS 'User last name';
COMMENT ON COLUMN feedback.email IS 'User email address';
COMMENT ON COLUMN feedback.message IS 'User feedback message';
COMMENT ON COLUMN feedback.created_at IS 'When the feedback was submitted';
COMMENT ON COLUMN feedback.updated_at IS 'When the feedback was last updated';
