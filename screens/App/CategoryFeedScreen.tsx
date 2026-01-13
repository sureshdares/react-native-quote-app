import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthProvider';

interface Quote {
    id: string;
    text: string;
    author: string;
    category: string;
    tags: string[] | null;
}

export default function CategoryFeedScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { session } = useAuth();
    const categoryName = (route.params as any)?.categoryName || 'Humor';
    const [selectedTab, setSelectedTab] = useState('All ' + categoryName);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [featuredQuote, setFeaturedQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);
    const [categoryTabs, setCategoryTabs] = useState<string[]>([]);

    useEffect(() => {
        loadCategoryData();
    }, [categoryName]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadQuotes(selectedTab);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [selectedTab, categoryName]);

    async function loadCategoryData() {
        try {
            setLoading(true);
            
            // Get unique tags for this category to create tabs
            const { data: tagsData, error: tagsError } = await supabase
                .from('quotes')
                .select('tags')
                .ilike('category', `%${categoryName}%`)
                .limit(100);

            if (!tagsError && tagsData) {
                const allTags = new Set<string>();
                tagsData.forEach((quote: any) => {
                    if (quote.tags && Array.isArray(quote.tags)) {
                        quote.tags.forEach((tag: string) => {
                            if (tag.toLowerCase().includes('witty') || 
                                tag.toLowerCase().includes('sarcastic') || 
                                tag.toLowerCase().includes('punny') ||
                                tag.toLowerCase().includes('surreal')) {
                                allTags.add(tag);
                            }
                        });
                    }
                });

                const tabs = [`All ${categoryName}`, ...Array.from(allTags).slice(0, 3).map(t => t.replace('#', ''))];
                setCategoryTabs(tabs.length > 1 ? tabs : [`All ${categoryName}`, 'All']);
            } else {
                setCategoryTabs([`All ${categoryName}`, 'All']);
            }

            // Load featured quote (random quote from category)
            await loadFeaturedQuote();
            await loadQuotes(selectedTab);
        } catch (error: any) {
            console.error('Error loading category data:', error);
            Alert.alert('Error', 'Failed to load quotes');
        } finally {
            setLoading(false);
        }
    }

    async function loadFeaturedQuote() {
        try {
            const { data, error } = await supabase
                .from('quotes')
                .select('*')
                .ilike('category', `%${categoryName}%`)
                .limit(1)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data && data.length > 0) {
                setFeaturedQuote(data[0]);
            }
        } catch (error: any) {
            console.error('Error loading featured quote:', error);
        }
    }

    async function loadQuotes(tab: string) {
        try {
            let query = supabase
                .from('quotes')
                .select('*')
                .ilike('category', `%${categoryName}%`);

            // Filter by tag if not "All"
            if (tab !== `All ${categoryName}` && tab !== 'All') {
                query = query.contains('tags', [`#${tab}`]);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            setQuotes(data || []);
        } catch (error: any) {
            console.error('Error loading quotes:', error);
            Alert.alert('Error', 'Failed to load quotes');
        }
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: '#0F766E' }]}>
                <View style={styles.headerLeft}>
                    <View style={styles.quoteIcon}>
                        <Text style={styles.quoteIconText}>""</Text>
                    </View>
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{categoryName}</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('Discover')}
                        style={styles.headerIcon}
                    >
                        <Text style={styles.iconText}>🔍</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.headerIcon}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <View style={styles.profileIconSmall}>
                            <Text style={styles.profileIconTextSmall}>
                                {session?.user.email?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0F766E" />
                    </View>
                ) : (
                    <>
                        {/* Featured Quote Card */}
                        {featuredQuote && (
                            <View style={styles.featuredCard}>
                                <Text style={styles.featuredLabel}>FEATURED TODAY</Text>
                                <Text style={styles.featuredQuote}>
                                    "{featuredQuote.text}"
                                </Text>
                                <Text style={styles.featuredAuthor}>- {featuredQuote.author}</Text>
                            </View>
                        )}

                        {/* Category Tabs */}
                        {categoryTabs.length > 0 && (
                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.tabsContainer}
                            >
                                {categoryTabs.map((tab) => (
                                    <TouchableOpacity
                                        key={tab}
                                        style={[
                                            styles.tab,
                                            selectedTab === tab && styles.tabActive
                                        ]}
                                        onPress={() => setSelectedTab(tab)}
                                    >
                                        <Text style={[
                                            styles.tabText,
                                            selectedTab === tab && styles.tabTextActive
                                        ]}>
                                            {tab}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        {/* Quote Cards */}
                        {quotes.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No quotes found</Text>
                            </View>
                        ) : (
                            quotes.map((quote, index) => (
                    <View key={quote.id} style={styles.quoteCard}>
                        {quote.hasIllustration && (
                            <View style={styles.illustrationContainer}>
                                <View style={styles.illustration}>
                                    <Text style={styles.illustrationEmoji}>🌱</Text>
                                </View>
                            </View>
                        )}
                        <Text style={styles.quoteText}>"{quote.text}"</Text>
                        <Text style={styles.quoteAuthor}>- {quote.author}</Text>
                        {quote.tags && quote.tags.length > 0 && (
                            <View style={styles.tagsContainer}>
                                {quote.tags.slice(0, 3).map((tag, i) => (
                                    <Text key={i} style={styles.tag}>{tag}</Text>
                                ))}
                            </View>
                        )}
                        <View style={styles.quoteFooter}>
                            {quote.likes && (
                                <View style={styles.footerItem}>
                                    <Text style={styles.footerIcon}>❤️</Text>
                                    <Text style={styles.footerText}>{quote.likes > 1000 ? `${(quote.likes / 1000).toFixed(1)}k` : quote.likes}</Text>
                                </View>
                            )}
                            {quote.views && (
                                <View style={styles.footerItem}>
                                    <Text style={styles.footerIcon}>👁</Text>
                                    <Text style={styles.footerText}>{quote.views}</Text>
                                </View>
                            )}
                            {quote.hasCopy && (
                                <TouchableOpacity style={styles.copyButton}>
                                    <Text style={styles.copyButtonText}>Copy</Text>
                                </TouchableOpacity>
                            )}
                            {!quote.hasCopy && (
                                <TouchableOpacity 
                                    style={styles.shareButton}
                                    onPress={() => navigation.navigate('QuoteEditor', {
                                        quote: {
                                            text: quote.text,
                                            author: quote.author
                                        }
                                    })}
                                >
                                    <Text style={styles.shareIcon}>📤</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                            ))
                        )}
                    </>
                )}
            </ScrollView>
        </View>
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
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    quoteIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    quoteIconText: {
        fontSize: 24,
        color: '#0F766E',
        fontWeight: 'bold',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    backIcon: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        padding: 8,
        marginLeft: 8,
    },
    iconText: {
        fontSize: 20,
        color: '#FFFFFF',
    },
    profileIconSmall: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileIconTextSmall: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F766E',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    featuredCard: {
        backgroundColor: '#FED7AA',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
    },
    featuredLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 12,
        letterSpacing: 1,
    },
    featuredQuote: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
        lineHeight: 32,
    },
    featuredAuthor: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },
    tabsContainer: {
        paddingRight: 16,
        marginBottom: 24,
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    tabActive: {
        backgroundColor: '#0F766E',
        borderColor: '#0F766E',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    tabTextActive: {
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
    illustrationContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    illustration: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
    },
    illustrationEmoji: {
        fontSize: 60,
    },
    quoteText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 12,
        lineHeight: 26,
    },
    quoteAuthor: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 12,
        fontWeight: '500',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    tag: {
        fontSize: 12,
        color: '#0F766E',
        marginRight: 8,
        fontWeight: '500',
    },
    quoteFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerIcon: {
        fontSize: 18,
        marginRight: 6,
    },
    footerText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    copyButton: {
        backgroundColor: '#111827',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    copyButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    shareButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#0F766E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareIcon: {
        fontSize: 20,
        color: '#FFFFFF',
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyContainer: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6B7280',
    },
});
