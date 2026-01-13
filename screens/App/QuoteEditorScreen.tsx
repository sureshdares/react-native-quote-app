import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, Alert, ImageBackground, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;

interface Quote {
    text: string;
    author: string;
}

type StyleType = 'minimalist' | 'nature' | 'gradient';

interface StyleTemplate {
    id: string;
    name: string;
    type: StyleType;
    category?: string;
}

export default function QuoteEditorScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { quote, quoteText, quoteAuthor } = (route.params as any) || {};
    
    const quoteData: Quote = quote || {
        text: quoteText || 'The only journey is the one within.',
        author: quoteAuthor || 'Rainer Maria Rilke'
    };

    const [selectedStyle, setSelectedStyle] = useState<StyleType>('minimalist');
    const cardRef = useRef<View>(null);

    const styles: StyleTemplate[] = [
        { id: '1', name: 'MINIMALIST', type: 'minimalist', category: 'CLASSIC' },
        { id: '2', name: 'NATURE', type: 'nature', category: 'NATURE' },
        { id: '3', name: 'GRADIENT', type: 'gradient', category: 'ACTIVE STYLE' },
    ];

    async function saveToGallery() {
        if (!cardRef.current) {
            Alert.alert('Error', 'Unable to capture image');
            return;
        }

        try {
            const uri = await captureRef(cardRef.current, {
                format: 'png',
                quality: 1,
            });

            if (Platform.OS === 'ios') {
                // On iOS, we can use the native share sheet
                const isAvailable = await Sharing.isAvailableAsync();
                if (isAvailable) {
                    await Sharing.shareAsync(uri);
                } else {
                    Alert.alert('Success', 'Image saved to gallery');
                }
            } else {
                // On Android, save to gallery
                Alert.alert('Success', 'Image saved to gallery');
            }
        } catch (error: any) {
            console.error('Error saving image:', error);
            Alert.alert('Error', 'Failed to save image');
        }
    }

    async function shareAsText() {
        try {
            const shareText = `"${quoteData.text}"\n— ${quoteData.author}`;
            const isAvailable = await Sharing.isAvailableAsync();
            
            if (isAvailable) {
                await Sharing.shareAsync(shareText);
            } else {
                Alert.alert('Info', 'Sharing not available on this device');
            }
        } catch (error: any) {
            console.error('Error sharing:', error);
            Alert.alert('Error', 'Failed to share');
        }
    }

    function renderQuoteCard() {
        const cardStyle = {
            width: CARD_WIDTH,
            minHeight: 300,
            borderRadius: 20,
            padding: 32,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
            ...Platform.select({
                ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 12,
                },
                android: {
                    elevation: 8,
                },
            }),
        };

        switch (selectedStyle) {
            case 'minimalist':
                return (
                    <View ref={cardRef} collapsable={false} style={[cardStyle, { backgroundColor: '#FFFFFF' }]}>
                        <Text style={styles.quoteIconLarge}>"</Text>
                        <Text style={styles.quoteTextMinimal}>{quoteData.text}</Text>
                        <Text style={styles.authorTextMinimal}>— {quoteData.author.toUpperCase()}</Text>
                    </View>
                );

            case 'nature':
                return (
                    <View ref={cardRef} collapsable={false} style={[cardStyle, { backgroundColor: '#1F2937', overflow: 'hidden' }]}>
                        <ImageBackground
                            source={{ uri: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800' }}
                            style={StyleSheet.absoluteFill}
                            blurRadius={10}
                        >
                            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]} />
                            <View style={{ zIndex: 1 }}>
                                <Text style={styles.quoteTextNature}>"{quoteData.text}"</Text>
                                <Text style={styles.authorTextNature}>{quoteData.author.toUpperCase()}</Text>
                            </View>
                        </ImageBackground>
                    </View>
                );

            case 'gradient':
                return (
                    <View ref={cardRef} collapsable={false} style={[cardStyle, { overflow: 'hidden' }]}>
                        <LinearGradient
                            colors={['#8B5CF6', '#EC4899', '#F59E0B']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={StyleSheet.absoluteFill}
                        >
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={styles.quoteIconGradient}>"</Text>
                                <Text style={styles.quoteTextGradient}>{quoteData.text.toUpperCase()}</Text>
                                <Text style={styles.authorTextGradient}>— {quoteData.author.toUpperCase()}</Text>
                                <View style={styles.brandingContainer}>
                                    <Text style={styles.brandingText}>LUMINA EDITOR</Text>
                                    <Text style={styles.styleText}>STYLE: 03-GRADIENT</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>
                );

            default:
                return null;
        }
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editor</Text>
                <TouchableOpacity style={styles.menuButton}>
                    <Text style={styles.menuIcon}>⋯</Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Live Preview */}
                <View style={styles.previewContainer}>
                    {renderQuoteCard()}
                    <Text style={styles.previewLabel}>LIVE PREVIEW</Text>
                </View>

                {/* Styles Section */}
                <View style={styles.stylesSection}>
                    <Text style={styles.sectionTitle}>STYLES</Text>
                    <View style={styles.stylesGrid}>
                        {styles.map((style) => (
                            <TouchableOpacity
                                key={style.id}
                                style={[
                                    styles.styleThumbnail,
                                    selectedStyle === style.type && styles.styleThumbnailSelected
                                ]}
                                onPress={() => setSelectedStyle(style.type)}
                            >
                                {style.type === 'minimalist' && (
                                    <View style={[styles.thumbnailContent, { backgroundColor: '#FFFFFF' }]} />
                                )}
                                {style.type === 'nature' && (
                                    <ImageBackground
                                        source={{ uri: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200' }}
                                        style={styles.thumbnailContent}
                                        blurRadius={5}
                                    >
                                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.3)' }]} />
                                    </ImageBackground>
                                )}
                                {style.type === 'gradient' && (
                                    <LinearGradient
                                        colors={['#8B5CF6', '#EC4899', '#F59E0B']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.thumbnailContent}
                                    />
                                )}
                                {selectedStyle === style.type && (
                                    <View style={styles.selectedIndicator}>
                                        <Text style={styles.checkmark}>✓</Text>
                                    </View>
                                )}
                                <Text style={styles.styleLabel}>{style.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.bottomBar}>
                <TouchableOpacity 
                    style={styles.shareButton}
                    onPress={shareAsText}
                >
                    <Text style={styles.shareIcon}>📤</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={saveToGallery}
                >
                    <Text style={styles.saveButtonText}>Save to Gallery</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 8,
    },
    backIcon: {
        fontSize: 24,
        color: '#111827',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    menuButton: {
        padding: 8,
    },
    menuIcon: {
        fontSize: 24,
        color: '#111827',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    previewContainer: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    previewLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        letterSpacing: 1,
        marginTop: 16,
    },
    quoteIconLarge: {
        fontSize: 120,
        color: '#E5E7EB',
        fontWeight: 'bold',
        marginBottom: -20,
    },
    quoteTextMinimal: {
        fontSize: 24,
        fontWeight: '500',
        color: '#111827',
        textAlign: 'center',
        lineHeight: 34,
        marginBottom: 16,
    },
    authorTextMinimal: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
        letterSpacing: 1,
    },
    quoteTextNature: {
        fontSize: 22,
        fontWeight: '500',
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 32,
        marginBottom: 12,
    },
    authorTextNature: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 1,
        opacity: 0.9,
    },
    quoteIconGradient: {
        fontSize: 80,
        color: '#FFFFFF',
        fontWeight: 'bold',
        opacity: 0.8,
        marginBottom: -10,
    },
    quoteTextGradient: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 28,
        marginBottom: 12,
        letterSpacing: 1,
    },
    authorTextGradient: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 2,
        opacity: 0.9,
        marginBottom: 24,
    },
    brandingContainer: {
        marginTop: 24,
        alignItems: 'center',
    },
    brandingText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 2,
        opacity: 0.7,
        marginBottom: 4,
    },
    styleText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#FFFFFF',
        letterSpacing: 1,
        opacity: 0.6,
    },
    stylesSection: {
        paddingHorizontal: 20,
        paddingBottom: 32,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        letterSpacing: 1,
        marginBottom: 16,
    },
    stylesGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    styleThumbnail: {
        width: (SCREEN_WIDTH - 60) / 3,
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    styleThumbnailSelected: {
        borderColor: '#EF4444',
    },
    thumbnailContent: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    selectedIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    styleLabel: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        right: 8,
        fontSize: 10,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingVertical: 4,
        borderRadius: 4,
    },
    bottomBar: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        ...Platform.select({
            ios: {
                paddingBottom: 34,
            },
        }),
    },
    shareButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    shareIcon: {
        fontSize: 24,
    },
    saveButton: {
        flex: 1,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
