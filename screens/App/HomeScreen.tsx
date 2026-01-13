import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthProvider';
import { supabase } from '../../lib/supabase';
import { getDailyQuote } from '../../utils/dailyQuote';
import { addToFavorites } from '../../utils/quoteHelpers';

interface Quote {
    id: string;
    text: string;
    author: string;
    category: string;
    tags: string[] | null;
}

interface Category {
    name: string;
    icon: string;
    count: number;
}

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const { session } = useAuth();
    const [dailyQuote, setDailyQuote] = useState<Quote | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [recentQuotes, setRecentQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [likes, setLikes] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        if (session) {
            loadData();
        }
    }, [session]);

    async function loadData() {
        if (!session?.user?.id) return;

        try {
            setLoading(true);
            await Promise.all([
                loadDailyQuote(),
                loadCategories(),
                loadRecentQuotes()
            ]);
        } catch (error: any) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }

    async function loadDailyQuote() {
        if (!session?.user?.id) return;

        const quote = await getDailyQuote(session.user.id);
        setDailyQuote(quote);
    }

    async function loadCategories() {
        try {
            const { data, error } = await supabase
                .from('quotes')
                .select('category')
                .limit(1000);

            if (error) throw error;

            // Count quotes per category
            const categoryCounts: { [key: string]: number } = {};
            (data || []).forEach((quote: any) => {
                if (quote.category) {
                    categoryCounts[quote.category] = (categoryCounts[quote.category] || 0) + 1;
                }
            });

            // Map to category objects with icons
            const categoryIcons: { [key: string]: string } = {
                'Philosophy': '📜',
                'Inspiration': '✨',
                'Motivation': '🚀',
                'Wisdom': '💡',
                'Humor': '😄',
                'Life': '🌱',
                'Science': '🔬',
                'Spirituality': '🕯️',
                'Mindfulness': '🧘',
                'Productivity': '⚡'
            };

            const cats: Category[] = Object.entries(categoryCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([name, count]) => ({
                    name,
                    icon: categoryIcons[name] || '📚',
                    count
                }));

            setCategories(cats);
        } catch (error: any) {
            console.error('Error loading categories:', error);
        }
    }

    async function loadRecentQuotes() {
        try {
            const { data, error } = await supabase
                .from('quotes')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            setRecentQuotes(data || []);

            // Initialize likes (in real app, get from database)
            const initialLikes: { [key: string]: number } = {};
            (data || []).forEach((quote: Quote) => {
                initialLikes[quote.id] = Math.floor(Math.random() * 1000) + 100;
            });
            setLikes(initialLikes);
        } catch (error: any) {
            console.error('Error loading recent quotes:', error);
        }
    }

    async function handleLike(quote: Quote) {
        if (!session?.user?.id) {
            Alert.alert('Please login', 'You need to be logged in to like quotes');
            return;
        }

        try {
            await addToFavorites(session.user.id, quote);
            setLikes(prev => ({
                ...prev,
                [quote.id]: (prev[quote.id] || 0) + 1
            }));
            Alert.alert('Success', 'Added to favorites!');
        } catch (error: any) {
            console.error('Error adding to favorites:', error);
        }
    }

    function formatLikeCount(count: number): string {
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k`;
        }
        return count.toString();
    }

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity 
                        style={styles.profileIcon}
                        onPress={() => navigation.navigate('Profile')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.profileIconText}>
                            {session?.user.email?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>For You</Text>
                </View>
                <TouchableOpacity 
                    onPress={() => navigation.navigate('NotificationSettings')}
                    style={styles.settingsButton}
                >
                    <Text style={styles.settingsIcon}>⚙️</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0F766E" />
                </View>
            ) : (
                <>
                    {/* Daily Inspiration Card */}
                    <View style={styles.dailyCard}>
                        {dailyQuote ? (
                            <View style={styles.dailyCardContent}>
                                <Text style={styles.dailyLabel}>DAILY INSPIRATION</Text>
                                <Text style={styles.dailyQuote}>"{dailyQuote.text}"</Text>
                                <Text style={styles.dailyAuthor}>— {dailyQuote.author}</Text>
                                <View style={styles.dailyActions}>
                                    <TouchableOpacity 
                                        style={styles.actionButton}
                                        onPress={() => handleLike(dailyQuote)}
                                    >
                                        <Text style={styles.actionIcon}>❤️</Text>
                                        <Text style={styles.actionText}>1.2k</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionButton}>
                                        <Text style={styles.actionIcon}>💬</Text>
                                        <Text style={styles.actionText}>84</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={styles.actionButton}
                                        onPress={() => navigation.navigate('QuoteEditor', {
                                            quote: {
                                                text: dailyQuote.text,
                                                author: dailyQuote.author
                                            }
                                        })}
                                    >
                                        <Text style={styles.actionIcon}>📤</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.dailyCardPlaceholder}>
                                <ActivityIndicator size="large" color="#FFFFFF" />
                            </View>
                        )}
                    </View>

                    {/* Explore Categories */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Explore Categories</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAllLink}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categoriesContainer}
                        >
                            {categories.map((category, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.categoryButton, index === 0 && styles.categoryButtonActive]}
                                    onPress={() => navigation.navigate('CategoryFeed', { categoryName: category.name })}
                                >
                                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                                    <Text style={[styles.categoryText, index === 0 && styles.categoryTextActive]}>
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Recent Classics */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recent Classics</Text>
                        {recentQuotes.map((quote) => (
                            <View key={quote.id} style={styles.quoteCard}>
                                <Text style={styles.quoteCategory}>{quote.category?.toUpperCase() || 'QUOTE'}</Text>
                                <Text style={styles.quoteText}>"{quote.text}"</Text>
                                <Text style={styles.quoteAuthor}>— {quote.author}</Text>
                                <View style={styles.quoteActions}>
                                    <TouchableOpacity 
                                        style={styles.quoteActionButton}
                                        onPress={() => handleLike(quote)}
                                    >
                                        <Text style={styles.quoteActionIcon}>❤️</Text>
                                        <Text style={styles.quoteActionText}>{formatLikeCount(likes[quote.id] || 0)}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={styles.quoteActionButton}
                                        onPress={() => navigation.navigate('QuoteEditor', {
                                            quote: {
                                                text: quote.text,
                                                author: quote.author
                                            }
                                        })}
                                    >
                                        <Text style={styles.quoteActionIcon}>📤</Text>
                                        <Text style={styles.quoteActionText}>{Math.floor(Math.random() * 200) + 50}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    contentContainer: {
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    profileIconText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    settingsButton: {
        padding: 8,
    },
    settingsIcon: {
        fontSize: 24,
        color: '#111827',
    },
    loadingContainer: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    dailyCard: {
        marginHorizontal: 24,
        marginTop: 16,
        marginBottom: 24,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#0F766E',
        minHeight: 280,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    dailyCardPlaceholder: {
        marginHorizontal: 24,
        marginTop: 16,
        marginBottom: 24,
        borderRadius: 20,
        backgroundColor: '#0F766E',
        minHeight: 280,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dailyCardContent: {
        padding: 24,
        flex: 1,
        justifyContent: 'space-between',
    },
    dailyLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 1,
        marginBottom: 16,
        opacity: 0.9,
    },
    dailyQuote: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        lineHeight: 34,
        marginBottom: 16,
    },
    dailyAuthor: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '500',
        marginBottom: 20,
        opacity: 0.9,
    },
    dailyActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 24,
    },
    actionIcon: {
        fontSize: 20,
        marginRight: 6,
    },
    actionText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    section: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    seeAllLink: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F766E',
    },
    categoriesContainer: {
        paddingRight: 24,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    categoryButtonActive: {
        backgroundColor: '#EF4444',
        borderColor: '#EF4444',
    },
    categoryIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    categoryTextActive: {
        color: '#FFFFFF',
    },
    quoteCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    quoteCategory: {
        fontSize: 12,
        fontWeight: '600',
        color: '#0F766E',
        letterSpacing: 1,
        marginBottom: 12,
    },
    quoteText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#111827',
        lineHeight: 26,
        marginBottom: 12,
    },
    quoteAuthor: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
        fontWeight: '500',
    },
    quoteActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quoteActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    quoteActionIcon: {
        fontSize: 18,
        marginRight: 6,
    },
    quoteActionText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
});
