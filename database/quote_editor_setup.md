# Quote Card Editor Setup Guide

## Overview
The Quote Card Editor allows users to create beautiful quote cards with different styles and share them or save to gallery.

## Database Tables Added

### 1. `quote_card_templates` Table
Stores custom quote card style templates created by users.
- `style_type`: Type of style (minimalist, nature, gradient, custom)
- `background_color`: Solid background color
- `background_image_url`: URL for background image
- `gradient_colors`: Array of gradient colors
- `text_color`: Text color
- `font_family`: Font family name
- `font_size`: Font size

### 2. `quote_card_saves` Table
Tracks saved quote cards created by users.
- `quote_id`: Reference to original quote
- `quote_text`: Denormalized quote text
- `quote_author`: Denormalized author
- `template_id`: Reference to template used
- `image_url`: URL of saved image

## Features Implemented

### ✅ Quote Card Editor Screen
- **Live Preview**: Real-time preview of quote card
- **Style Selection**: Three built-in styles:
  - **MINIMALIST**: Clean white background with elegant typography
  - **NATURE**: Blurred forest background with overlay
  - **GRADIENT**: Vibrant purple-to-orange gradient
- **Share Functionality**: Share as text or image
- **Save to Gallery**: Capture and save quote card as image

### ✅ Style Templates
1. **Minimalist Style**:
   - White background
   - Large quote icon
   - Clean typography
   - Author in uppercase

2. **Nature Style**:
   - Blurred forest background image
   - Dark overlay for readability
   - White text
   - Nature-themed aesthetic

3. **Gradient Style**:
   - Purple-to-orange gradient background
   - Bold uppercase text
   - Branding footer
   - Modern design

### ✅ Share Integration
- Share as text via system share sheet
- Share as image (PNG format)
- Works with Messages, WhatsApp, Mail, etc.
- Copy to clipboard fallback

### ✅ Navigation Integration
- Accessible from:
  - Home screen (daily quote and recent quotes)
  - Category feed screen
  - Favorites screen
- Share buttons navigate to Quote Editor

## Setup Instructions

### 1. Run Updated Schema
Execute the updated `database/schema.sql` in Supabase SQL Editor to create:
- `quote_card_templates` table
- `quote_card_saves` table
- RLS policies
- Indexes

### 2. Dependencies Installed
- `expo-sharing`: For sharing functionality
- `react-native-view-shot`: For capturing quote cards as images
- `expo-linear-gradient`: For gradient backgrounds

### 3. Permissions
The app will request necessary permissions for:
- Saving images to gallery
- Sharing content

## How It Works

1. **Opening Editor**:
   - User taps share button on any quote
   - Navigates to Quote Editor with quote data
   - Editor loads with default minimalist style

2. **Style Selection**:
   - User can tap style thumbnails
   - Live preview updates instantly
   - Selected style highlighted with border

3. **Sharing**:
   - **Share as Text**: Opens system share sheet with quote text
   - **Save to Gallery**: Captures card as PNG and saves/shares

4. **Saving**:
   - Quote cards can be saved to database
   - Tracks template used and quote reference
   - Stores image URL if uploaded

## Usage Examples

### From Home Screen
```typescript
navigation.navigate('QuoteEditor', {
    quote: {
        text: 'The only journey is the one within.',
        author: 'Rainer Maria Rilke'
    }
});
```

### From Category Feed
```typescript
navigation.navigate('QuoteEditor', {
    quote: {
        text: quote.text,
        author: quote.author
    }
});
```

## Future Enhancements
- Custom color picker
- Font selection
- Text alignment options
- More style templates
- Background image upload
- Export as different formats (JPG, PDF)
