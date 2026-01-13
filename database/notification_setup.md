# Daily Quote & Notifications Setup Guide

## Database Tables Added

### 1. `daily_quotes` Table
Tracks the daily quote assigned to each user per day.
- Ensures same quote per day for consistency
- Uses date as seed for quote selection

### 2. `notification_preferences` Table
Stores user notification settings.
- `daily_quote_enabled`: Boolean toggle
- `notification_time`: Time in HH:MM:SS format
- `timezone`: User's timezone

## Features Implemented

### ✅ Quote of the Day
- Prominently displayed on home screen
- Changes daily using date-based selection
- Loaded from database
- Beautiful card design with actions

### ✅ Daily Quote Logic
- Uses date as seed for consistent daily selection
- Same quote for same day across app restarts
- Automatically selects new quote each day
- Stored in `daily_quotes` table

### ✅ Local Push Notifications
- Uses `expo-notifications` package
- Scheduled daily at user's preferred time
- Shows quote text and author
- Repeats daily automatically

### ✅ Notification Settings
- Toggle to enable/disable daily quotes
- Time picker for preferred delivery time
- AM/PM selection
- Preview of notification
- Saves to database
- Schedules notifications automatically

## Setup Instructions

### 1. Run Updated Schema
Execute the updated `database/schema.sql` in Supabase SQL Editor to create:
- `daily_quotes` table
- `notification_preferences` table
- RLS policies
- Indexes

### 2. App Configuration
The `app.json` has been updated with:
- Notification plugin configuration
- Android permissions
- Notification channel setup

### 3. Permissions
The app will automatically request notification permissions when:
- User opens notification settings
- User enables daily quote notifications

## How It Works

1. **Daily Quote Selection**:
   - Uses current date as seed
   - Selects quote from database based on date
   - Ensures same quote for same day
   - Stores in `daily_quotes` table

2. **Notification Scheduling**:
   - User sets preferred time in settings
   - App schedules notification at that time
   - Notification repeats daily
   - Uses local device time

3. **Settings Persistence**:
   - All preferences saved to database
   - Loaded on app start
   - Syncs across devices (if same user)

## Testing

1. **Test Daily Quote**:
   - Open home screen
   - Should see daily quote card
   - Quote should be same throughout the day

2. **Test Notifications**:
   - Go to Notification Settings
   - Enable daily quote notifications
   - Set time to 1-2 minutes from now
   - Save settings
   - Wait for notification

3. **Test Time Change**:
   - Change notification time
   - Save settings
   - Previous notification canceled
   - New notification scheduled

## Notification Preview

The notification will show:
- Title: "Daily Inspiration"
- Body: Quote text and author
- Time: User's preferred time
- Repeats: Daily
