import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme, ThemeMode, AccentColor } from '../../contexts/ThemeProvider';

export default function AppearanceScreen() {
    const navigation = useNavigation<any>();
    const { theme, accentColor, fontSize, setTheme, setAccentColor, setFontSize, colors, isDark } = useTheme();

    const accentColors: { name: AccentColor; label: string; color: string }[] = [
        { name: 'gold', label: 'GOLD', color: '#F59E0B' },
        { name: 'ocean', label: 'OCEAN', color: '#3B82F6' },
        { name: 'forest', label: 'FOREST', color: '#10B981' },
        { name: 'teal', label: 'TEAL', color: '#0F766E' },
    ];

    const previewQuote = {
        text: 'The only way to do great work is to love what you do.',
        author: 'Steve Jobs',
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Appearance</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Preview Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PREVIEW</Text>
                    <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.previewQuote, { color: colors.text, fontSize: fontSize + 4 }]}>
                            {previewQuote.text}
                        </Text>
                        <Text style={[styles.previewAuthor, { color: colors.accent }]}>
                            — {previewQuote.author.toUpperCase()}
                        </Text>
                    </View>
                </View>

                {/* Theme Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>THEME</Text>
                    <View style={styles.optionsContainer}>
                        {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                            <TouchableOpacity
                                key={mode}
                                style={[
                                    styles.radioOption,
                                    { borderColor: colors.border },
                                    theme === mode && { borderColor: colors.accent, backgroundColor: colors.surface }
                                ]}
                                onPress={() => setTheme(mode)}
                            >
                                <View style={styles.radioCircle}>
                                    {theme === mode && (
                                        <View style={[styles.radioInner, { backgroundColor: colors.accent }]} />
                                    )}
                                </View>
                                <Text style={[styles.radioLabel, { color: colors.text }]}>
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Accent Color Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ACCENT COLOR</Text>
                    <View style={styles.colorContainer}>
                        {accentColors.map((colorOption) => (
                            <TouchableOpacity
                                key={colorOption.name}
                                style={styles.colorOption}
                                onPress={() => setAccentColor(colorOption.name)}
                            >
                                <View
                                    style={[
                                        styles.colorSwatch,
                                        { backgroundColor: colorOption.color },
                                        accentColor === colorOption.name && styles.colorSwatchSelected
                                    ]}
                                >
                                    {accentColor === colorOption.name && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </View>
                                <Text style={[styles.colorLabel, { color: colors.text }]}>
                                    {colorOption.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Font Size Section */}
                <View style={styles.section}>
                    <View style={styles.fontSizeHeader}>
                        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>FONT SIZE</Text>
                        <Text style={[styles.dynamicLabel, { color: colors.accent }]}>DYNAMIC</Text>
                    </View>
                    <View style={styles.sliderContainer}>
                        <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>Tr</Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={12}
                            maximumValue={24}
                            value={fontSize}
                            onValueChange={setFontSize}
                            minimumTrackTintColor={colors.accent}
                            maximumTrackTintColor={colors.border}
                            thumbTintColor={colors.accent}
                        />
                        <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>Tt</Text>
                    </View>
                    <Text style={[styles.fontSizeNote, { color: colors.textSecondary }]}>
                        Text will adjust across all quotes and widgets.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
    },
    backIcon: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    placeholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 32,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 16,
    },
    previewCard: {
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    previewQuote: {
        fontWeight: '500',
        lineHeight: 28,
        marginBottom: 12,
    },
    previewAuthor: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 1,
    },
    optionsContainer: {
        gap: 12,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    radioLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    colorContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    colorOption: {
        alignItems: 'center',
        width: '23%',
        marginBottom: 16,
    },
    colorSwatch: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 3,
        borderColor: 'transparent',
    },
    colorSwatchSelected: {
        borderColor: '#FFFFFF',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    colorLabel: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    fontSizeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    dynamicLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    slider: {
        flex: 1,
        height: 40,
        marginHorizontal: 12,
    },
    sliderLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    fontSizeNote: {
        fontSize: 14,
        lineHeight: 20,
    },
});
