import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'gold' | 'ocean' | 'forest' | 'teal';

interface ThemeColors {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
}

interface ThemeContextType {
    theme: ThemeMode;
    accentColor: AccentColor;
    fontSize: number;
    setTheme: (theme: ThemeMode) => Promise<void>;
    setAccentColor: (color: AccentColor) => Promise<void>;
    setFontSize: (size: number) => Promise<void>;
    colors: ThemeColors;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const accentColorMap: Record<AccentColor, { light: string; dark: string }> = {
    gold: { light: '#F59E0B', dark: '#FBBF24' },
    ocean: { light: '#3B82F6', dark: '#60A5FA' },
    forest: { light: '#10B981', dark: '#34D399' },
    teal: { light: '#0F766E', dark: '#14B8A6' },
};

const lightColors: Omit<ThemeColors, 'accent'> = {
    primary: '#111827',
    secondary: '#6B7280',
    background: '#FFFFFF',
    surface: '#F3F4F6',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
};

const darkColors: Omit<ThemeColors, 'accent'> = {
    primary: '#F9FAFB',
    secondary: '#9CA3AF',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useColorScheme();
    const { session } = useAuth();
    
    const [theme, setThemeState] = useState<ThemeMode>('system');
    const [accentColor, setAccentColorState] = useState<AccentColor>('teal');
    const [fontSize, setFontSizeState] = useState<number>(16);

    const isDark = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');
    const accentColors = accentColorMap[accentColor];
    const baseColors = isDark ? darkColors : lightColors;
    
    const colors: ThemeColors = {
        ...baseColors,
        accent: isDark ? accentColors.dark : accentColors.light,
    };

    useEffect(() => {
        loadSettings();
    }, [session]);

    async function loadSettings() {
        try {
            // Load from local storage first
            const localTheme = await AsyncStorage.getItem('theme');
            const localAccent = await AsyncStorage.getItem('accentColor');
            const localFontSize = await AsyncStorage.getItem('fontSize');

            if (localTheme) setThemeState(localTheme as ThemeMode);
            if (localAccent) setAccentColorState(localAccent as AccentColor);
            if (localFontSize) setFontSizeState(parseInt(localFontSize, 10));

            // Sync from database if logged in
            if (session?.user?.id) {
                const { data } = await supabase
                    .from('user_preferences')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .single();

                if (data) {
                    if (data.theme) setThemeState(data.theme as ThemeMode);
                    if (data.accent_color) setAccentColorState(data.accent_color as AccentColor);
                    if (data.font_size) setFontSizeState(data.font_size);
                }
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async function setTheme(newTheme: ThemeMode) {
        setThemeState(newTheme);
        await AsyncStorage.setItem('theme', newTheme);
        
        if (session?.user?.id) {
            await supabase
                .from('user_preferences')
                .upsert({
                    user_id: session.user.id,
                    theme: newTheme,
                }, { onConflict: 'user_id' });
        }
    }

    async function setAccentColor(newColor: AccentColor) {
        setAccentColorState(newColor);
        await AsyncStorage.setItem('accentColor', newColor);
        
        if (session?.user?.id) {
            await supabase
                .from('user_preferences')
                .upsert({
                    user_id: session.user.id,
                    accent_color: newColor,
                }, { onConflict: 'user_id' });
        }
    }

    async function setFontSize(newSize: number) {
        setFontSizeState(newSize);
        await AsyncStorage.setItem('fontSize', newSize.toString());
        
        if (session?.user?.id) {
            await supabase
                .from('user_preferences')
                .upsert({
                    user_id: session.user.id,
                    font_size: newSize,
                }, { onConflict: 'user_id' });
        }
    }

    return (
        <ThemeContext.Provider
            value={{
                theme,
                accentColor,
                fontSize,
                setTheme,
                setAccentColor,
                setFontSize,
                colors,
                isDark,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
