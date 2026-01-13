-- Migration script to create daily_quotes table if it doesn't exist
-- Run this in your Supabase SQL Editor if you're getting "table not found" errors

-- Create daily_quotes table (tracks daily quote per user)
CREATE TABLE IF NOT EXISTS daily_quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Enable RLS for daily_quotes
ALTER TABLE daily_quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_quotes
CREATE POLICY "Users can view their own daily quotes"
    ON daily_quotes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily quotes"
    ON daily_quotes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_daily_quotes_user_date ON daily_quotes(user_id, date);
