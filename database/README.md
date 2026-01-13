# Database Setup Instructions

## Step 1: Run the Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Run the query to create all tables, policies, and indexes

## Step 2: Insert Mock Data

1. In the SQL Editor, run the contents of `mock_data.sql`
2. This will insert sample quotes into the database

## Step 3: Insert User-Specific Mock Data

After a user signs up, you can run these queries to add mock data for that user:

### Get User ID
First, get the user's UUID from the auth.users table:
```sql
SELECT id, email FROM auth.users;
```

### Insert Collections for a User
Replace `USER_ID_HERE` with the actual user UUID:

```sql
INSERT INTO collections (user_id, name, icon, color) VALUES
('USER_ID_HERE', 'Morning Motivation', '☀️', '#0F766E'),
('USER_ID_HERE', 'Stoic Philosophy', '📜', '#059669'),
('USER_ID_HERE', 'Growth Mindset', '⭐', '#047857'),
('USER_ID_HERE', 'Nature & Earth', '🌳', '#065F46'),
('USER_ID_HERE', 'Work Inspiration', '💼', '#064E3B');
```

### Insert Favorites for a User
```sql
INSERT INTO favorites (user_id, quote_id, quote_text, quote_author) 
SELECT 
    'USER_ID_HERE',
    id,
    text,
    author
FROM quotes
WHERE id IN (
    SELECT id FROM quotes ORDER BY RANDOM() LIMIT 5
);
```

### Add Quotes to a Collection
```sql
INSERT INTO collection_quotes (collection_id, quote_id, quote_text, quote_author)
SELECT 
    (SELECT id FROM collections WHERE user_id = 'USER_ID_HERE' AND name = 'Morning Motivation' LIMIT 1),
    id,
    text,
    author
FROM quotes
WHERE category = 'Inspiration'
LIMIT 5;
```

## Database Tables

### `quotes`
Stores all available quotes in the system.

### `collections`
User-created collections for organizing quotes.

### `favorites`
User's favorite quotes (one-to-many relationship).

### `collection_quotes`
Junction table linking quotes to collections.

## Row Level Security (RLS)

All tables have RLS enabled. Users can only:
- View their own collections and favorites
- Create/update/delete their own data
- View quotes in their own collections
