# Lexis - Daily Quote App

A beautiful React Native app for discovering, saving, and sharing inspirational quotes with daily notifications, personalization, and widget support.

## Features

### Core Features
- ✅ **Daily Quote**: Get a new inspirational quote every day
- ✅ **Search & Discovery**: Search quotes by author, topic, or keyword
- ✅ **Favorites**: Save your favorite quotes
- ✅ **Collections**: Organize quotes into custom collections
- ✅ **Quote Card Editor**: Create beautiful quote cards with multiple styles
- ✅ **Personalization**: Dark/Light mode, accent colors, font size adjustment
- ✅ **Notifications**: Daily quote notifications at your preferred time
- ✅ **Widget Support**: Home screen widget for daily quotes (iOS/Android)

### Technical Features
- ✅ **Supabase Backend**: Real-time database, authentication, and storage
- ✅ **Clean Architecture**: MVVM pattern with separation of concerns
- ✅ **Theme System**: Dynamic theming with light/dark mode support
- ✅ **Error Handling**: Comprehensive error handling throughout
- ✅ **Type Safety**: Full TypeScript implementation
- ✅ **Localization Ready**: Centralized string constants

## Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account and project
- iOS Simulator (for iOS development) or Android Emulator (for Android development)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd my-supabase-app
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### 3. Database Setup

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Run the SQL scripts in order:
   - `database/schema.sql` - Creates all tables, RLS policies, and indexes
   - `database/mock_data.sql` - Inserts sample quotes (optional)

### 4. Run the App

```bash
# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

## Project Structure

```
my-supabase-app/
├── app.json                 # Expo configuration
├── App.tsx                  # Root component
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
│
├── assets/                 # Images, icons, fonts
│
├── constants/              # App-wide constants
│   └── strings.ts          # Localization strings
│
├── contexts/               # React Context providers
│   ├── AuthProvider.tsx    # Authentication context
│   └── ThemeProvider.tsx   # Theme management
│
├── database/               # Database scripts
│   ├── schema.sql          # Database schema
│   ├── mock_data.sql       # Sample data
│   └── README.md           # Database setup guide
│
├── lib/                    # Core libraries
│   └── supabase.ts         # Supabase client
│
├── navigation/             # Navigation configuration
│   └── index.tsx           # Main navigator
│
├── screens/                # Screen components
│   ├── Auth/               # Authentication screens
│   │   ├── LoginScreen.tsx
│   │   ├── SignUpScreen.tsx
│   │   └── ForgotPasswordScreen.tsx
│   └── App/                # Main app screens
│       ├── HomeScreen.tsx
│       ├── SearchScreen.tsx
│       ├── FavoritesScreen.tsx
│       ├── CollectionsScreen.tsx
│       ├── ProfileScreen.tsx
│       ├── QuoteEditorScreen.tsx
│       └── AppearanceScreen.tsx
│
├── utils/                  # Utility functions
│   ├── debounce.ts         # Debounce utility
│   ├── errorHandler.ts     # Error handling
│   ├── quoteHelpers.ts     # Quote operations
│   ├── dailyQuote.ts       # Daily quote logic
│   ├── notifications.ts    # Notification utilities
│   └── shareHelpers.ts     # Sharing utilities
│
└── widgets/                # Widget implementations
    └── DailyQuoteWidget.tsx
```

## Key Technologies

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform and tooling
- **TypeScript**: Type-safe JavaScript
- **Supabase**: Backend-as-a-Service (PostgreSQL, Auth, Storage)
- **React Navigation**: Navigation library
- **Expo Notifications**: Push notifications
- **React Native View Shot**: Image capture
- **Expo Linear Gradient**: Gradient backgrounds

## Configuration

### Theme Customization

The app supports:
- **Themes**: Light, Dark, System
- **Accent Colors**: Gold, Ocean, Forest, Teal
- **Font Size**: Adjustable from 12px to 24px

Settings are persisted locally and synced to user profile.

### Notification Setup

1. Configure notification preferences in app settings
2. Set preferred delivery time
3. Enable/disable daily quote notifications
4. Permissions are requested automatically

### Widget Setup

**Note**: Widget implementation requires native code. For Expo projects:
- iOS: Requires ejecting to bare workflow or using Expo config plugins
- Android: Requires native module or ejecting

See `widgets/DailyQuoteWidget.tsx` for widget structure.

## Database Schema

### Main Tables
- `quotes`: Quote content
- `favorites`: User's favorite quotes
- `collections`: User's quote collections
- `collection_quotes`: Junction table for quotes in collections
- `daily_quotes`: Daily quote assignments per user
- `notification_preferences`: User notification settings
- `user_preferences`: User appearance settings
- `quote_card_templates`: Custom quote card styles
- `quote_card_saves`: Saved quote card images
- `recent_searches`: User search history

All tables have Row Level Security (RLS) enabled for data protection.

## Error Handling

The app includes comprehensive error handling:
- Network errors
- Authentication errors
- Database errors
- User-friendly error messages
- Error logging for debugging

Use `utils/errorHandler.ts` for consistent error handling.

## Code Quality

- ✅ TypeScript for type safety
- ✅ Consistent naming conventions
- ✅ No hardcoded strings (uses `constants/strings.ts`)
- ✅ Error handling throughout
- ✅ Clean project structure
- ✅ Separation of concerns (MVVM pattern)

## Troubleshooting

### Common Issues

1. **Metro bundler errors**: Clear cache with `npx expo start -c`
2. **Supabase connection**: Verify `.env` file has correct credentials
3. **Notification permissions**: Check device settings
4. **Database errors**: Ensure schema is properly set up in Supabase

### Debugging

- Check Expo logs: `npx expo start`
- Check Supabase logs: Dashboard → Logs
- Enable React Native debugger
- Check device logs (iOS: Console.app, Android: logcat)

## Contributing

1. Follow TypeScript best practices
2. Use constants from `constants/strings.ts` for all user-facing text
3. Handle errors using `utils/errorHandler.ts`
4. Follow existing code structure and naming conventions
5. Test on both iOS and Android

## License

Private project - All rights reserved

## Version

**Version**: 2.4.0  
**Build**: 1082  
**Status**: Stable

---

For detailed database setup, see `database/README.md`  
For notification setup, see `database/notification_setup.md`  
For quote editor setup, see `database/quote_editor_setup.md`
