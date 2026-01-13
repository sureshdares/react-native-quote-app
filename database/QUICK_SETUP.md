# Quick Database Setup Guide

If you're getting errors about missing tables, run these SQL scripts in your Supabase SQL Editor in this order:

## Step 1: Run Main Schema
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the entire contents of `database/schema.sql`
3. Click "Run" to execute

## Step 2: If Tables Are Still Missing

If you get errors about specific tables, run these individual migration scripts:

### For `daily_quotes` table error:
Run `database/migration_daily_quotes.sql`

### For `user_preferences` table error:
Run `database/migration_user_preferences.sql`

### For `notification_preferences` table error:
The table should be in the main schema. If missing, check the schema.sql file.

## Step 3: Verify Tables Exist

Run this query to check if tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'quotes',
    'daily_quotes',
    'user_preferences',
    'notification_preferences',
    'favorites',
    'collections',
    'collection_quotes',
    'quote_card_templates',
    'quote_card_saves',
    'recent_searches'
)
ORDER BY table_name;
```

All tables should appear in the results.

## Common Issues

### Error: "Could not find the table 'public.daily_quotes'"
**Solution**: Run `database/migration_daily_quotes.sql`

### Error: "relation does not exist"
**Solution**: Make sure you've run the schema.sql file completely

### Error: "permission denied"
**Solution**: Make sure RLS policies are created. Check the schema.sql file for all CREATE POLICY statements.

## After Running Migrations

1. Restart your Expo app
2. Clear Metro cache: `npx expo start -c`
3. Test the daily quote feature
