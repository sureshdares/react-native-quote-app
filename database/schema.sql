-- Create quotes table (if not exists)
CREATE TABLE IF NOT EXISTS quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '📚',
    color TEXT DEFAULT '#0F766E',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Create favorites table (user's favorite quotes)
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
    quote_text TEXT NOT NULL,
    quote_author TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, quote_id)
);

-- Create collection_quotes table (quotes in collections)
CREATE TABLE IF NOT EXISTS collection_quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
    quote_text TEXT NOT NULL,
    quote_author TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(collection_id, quote_id)
);

-- Enable Row Level Security
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collections
CREATE POLICY "Users can view their own collections"
    ON collections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections"
    ON collections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
    ON collections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
    ON collections FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for favorites
CREATE POLICY "Users can view their own favorites"
    ON favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
    ON favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
    ON favorites FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for collection_quotes
CREATE POLICY "Users can view quotes in their collections"
    ON collection_quotes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM collections
            WHERE collections.id = collection_quotes.collection_id
            AND collections.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert quotes in their collections"
    ON collection_quotes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM collections
            WHERE collections.id = collection_quotes.collection_id
            AND collections.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete quotes from their collections"
    ON collection_quotes FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM collections
            WHERE collections.id = collection_quotes.collection_id
            AND collections.user_id = auth.uid()
        )
    );

-- Create recent_searches table
CREATE TABLE IF NOT EXISTS recent_searches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_quotes table (tracks daily quote per user)
CREATE TABLE IF NOT EXISTS daily_quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    daily_quote_enabled BOOLEAN DEFAULT true,
    notification_time TIME DEFAULT '08:00:00',
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create quote_card_templates table (for storing user's custom quote card styles)
CREATE TABLE IF NOT EXISTS quote_card_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    style_type TEXT NOT NULL CHECK (style_type IN ('minimalist', 'nature', 'gradient', 'custom')),
    background_color TEXT,
    background_image_url TEXT,
    gradient_colors TEXT[],
    text_color TEXT DEFAULT '#111827',
    font_family TEXT,
    font_size INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quote_card_saves table (tracks saved quote cards)
CREATE TABLE IF NOT EXISTS quote_card_saves (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
    quote_text TEXT NOT NULL,
    quote_author TEXT NOT NULL,
    template_id UUID REFERENCES quote_card_templates(id) ON DELETE SET NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table (stores user appearance and settings)
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    accent_color TEXT DEFAULT 'teal' CHECK (accent_color IN ('gold', 'ocean', 'forest', 'teal')),
    font_size INT DEFAULT 16 CHECK (font_size >= 12 AND font_size <= 24),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS for recent_searches
ALTER TABLE recent_searches ENABLE ROW LEVEL SECURITY;

-- Enable RLS for daily_quotes
ALTER TABLE daily_quotes ENABLE ROW LEVEL SECURITY;

-- Enable RLS for notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Enable RLS for quote_card_templates
ALTER TABLE quote_card_templates ENABLE ROW LEVEL SECURITY;

-- Enable RLS for quote_card_saves
ALTER TABLE quote_card_saves ENABLE ROW LEVEL SECURITY;

-- Enable RLS for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recent_searches
CREATE POLICY "Users can view their own recent searches"
    ON recent_searches FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recent searches"
    ON recent_searches FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recent searches"
    ON recent_searches FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collection_quotes_collection_id ON collection_quotes(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_quotes_created_at ON collection_quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recent_searches_user_id ON recent_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_searches_created_at ON recent_searches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_category ON quotes(category);
CREATE INDEX IF NOT EXISTS idx_quotes_author ON quotes(author);
CREATE INDEX IF NOT EXISTS idx_quotes_text ON quotes USING gin(to_tsvector('english', text));
CREATE INDEX IF NOT EXISTS idx_daily_quotes_user_date ON daily_quotes(user_id, date);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_quote_card_templates_user_id ON quote_card_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_quote_card_saves_user_id ON quote_card_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_quote_card_saves_quote_id ON quote_card_saves(quote_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- RLS Policies for daily_quotes
CREATE POLICY "Users can view their own daily quotes"
    ON daily_quotes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily quotes"
    ON daily_quotes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notification_preferences
CREATE POLICY "Users can view their own notification preferences"
    ON notification_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
    ON notification_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
    ON notification_preferences FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for quote_card_templates
CREATE POLICY "Users can view their own quote card templates"
    ON quote_card_templates FOR SELECT
    USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can create their own quote card templates"
    ON quote_card_templates FOR INSERT
    WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can update their own quote card templates"
    ON quote_card_templates FOR UPDATE
    USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can delete their own quote card templates"
    ON quote_card_templates FOR DELETE
    USING (user_id IS NULL OR auth.uid() = user_id);

-- RLS Policies for quote_card_saves
CREATE POLICY "Users can view their own saved quote cards"
    ON quote_card_saves FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved quote cards"
    ON quote_card_saves FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved quote cards"
    ON quote_card_saves FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
    ON user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON user_preferences FOR UPDATE
    USING (auth.uid() = user_id);

-- Function to get collection quote count
CREATE OR REPLACE FUNCTION get_collection_quote_count(collection_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM collection_quotes
        WHERE collection_id = collection_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
