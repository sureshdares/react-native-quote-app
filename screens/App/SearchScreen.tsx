import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthProvider';
import { supabase } from '../../lib/supabase';
import { debounce } from '../../utils/debounce';

interface Author {
    author: string;
    count: number;
}

interface RecentSearch {
    id: string;
    search_query: string;
    created_at: string;
}

export default function SearchScreen() {
    const navigation = useNavigation<any>();
    const { session } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
    const [popularAuthors, setPopularAuthors] = useState<Author[]>([]);
    const [trendingKeywords, setTrendingKeywords] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [filteredAuthors, setFilteredAuthors] = useState<Author[]>([]);
    const [filteredKeywords, setFilteredKeywords] = useState<string[]>([]);

    useEffect(() => {
        if (session) {
            loadData();
        }
    }, [session]);

    useEffect(() => {
        if (searchQuery.trim()) {
            const timeoutId = setTimeout(() => {
                filterData(searchQuery);
            }, 300);
            return () => clearTimeout(timeoutId);
        } else {
            setFilteredAuthors(popularAuthors);
            setFilteredKeywords(trendingKeywords);
        }
    }, [searchQuery, popularAuthors, trendingKeywords]);

    async function loadData() {
        if (!session?.user?.id) return;

        try {
            setLoading(true);
            await Promise.all([
                loadRecentSearches(),
                loadPopularAuthors(),
                loadTrendingKeywords()
            ]);
        } catch (error: any) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }

    async function loadRecentSearches() {
        if (!session?.user?.id) return;

        try {
            const { data, error } = await supabase
                .from('recent_searches')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            setRecentSearches(data || []);
        } catch (error: any) {
            console.error('Error loading recent searches:', error);
        }
    }

    async function loadPopularAuthors() {
        try {
            const { data, error } = await supabase
                .from('quotes')
                .select('author')
                .limit(1000);

            if (error) throw error;

            // Count occurrences of each author
            const authorCounts: { [key: string]: number } = {};
            (data || []).forEach((quote: any) => {
                const author = quote.author;
                authorCounts[author] = (authorCounts[author] || 0) + 1;
            });

            // Convert to array and sort by count
            const authors: Author[] = Object.entries(authorCounts)
                .map(([author, count]) => ({ author, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            setPopularAuthors(authors);
            setFilteredAuthors(authors);
        } catch (error: any) {
            console.error('Error loading popular authors:', error);
        }
    }

    async function loadTrendingKeywords() {
        try {
            const { data, error } = await supabase
                .from('quotes')
                .select('tags')
                .limit(1000);

            if (error) throw error;

            // Count occurrences of each tag
            const tagCounts: { [key: string]: number } = {};
            (data || []).forEach((quote: any) => {
                if (quote.tags && Array.isArray(quote.tags)) {
                    quote.tags.forEach((tag: string) => {
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                    });
                }
            });

            // Convert to array and sort by count
            const keywords = Object.entries(tagCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([tag]) => tag);

            setTrendingKeywords(keywords);
            setFilteredKeywords(keywords);
        } catch (error: any) {
            console.error('Error loading trending keywords:', error);
        }
    }

    function filterData(query: string) {
        const lowerQuery = query.toLowerCase();

        // Filter authors
        const filtered = popularAuthors.filter(author =>
            author.author.toLowerCase().includes(lowerQuery)
        );
        setFilteredAuthors(filtered);

        // Filter keywords
        const filteredKw = trendingKeywords.filter(keyword =>
            keyword.toLowerCase().includes(lowerQuery)
        );
        setFilteredKeywords(filteredKw);
    }

    async function saveRecentSearch(query: string) {
        if (!session?.user?.id || !query.trim()) return;

        try {
            await supabase
                .from('recent_searches')
                .insert({
                    user_id: session.user.id,
                    search_query: query.trim()
                });

            loadRecentSearches();
        } catch (error: any) {
            console.error('Error saving recent search:', error);
        }
    }

    async function clearRecentSearch(searchId: string) {
        try {
            const { error } = await supabase
                .from('recent_searches')
                .delete()
                .eq('id', searchId)
                .eq('user_id', session?.user?.id);

            if (error) throw error;
            loadRecentSearches();
        } catch (error: any) {
            console.error('Error clearing recent search:', error);
            Alert.alert('Error', 'Failed to clear search');
        }
    }

    async function clearAllSearches() {
        try {
            const { error } = await supabase
                .from('recent_searches')
                .delete()
                .eq('user_id', session?.user?.id);

            if (error) throw error;
            setRecentSearches([]);
        } catch (error: any) {
            console.error('Error clearing all searches:', error);
            Alert.alert('Error', 'Failed to clear searches');
        }
    }

    const handleSearch = (query: string) => {
        if (query.trim()) {
            saveRecentSearch(query);
            navigation.navigate('SearchResults', { query: query.trim() });
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Search</Text>
                <TouchableOpacity 
                    style={styles.profileButton}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <View style={styles.profileIcon}>
                        <Text style={styles.profileIconText}>
                            {session?.user.email?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Search Bar */}
                <View style={styles.searchBarContainer}>
                    <View style={styles.searchBar}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by author, topic, or k"
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoCapitalize="none"
                            onSubmitEditing={() => handleSearch(searchQuery)}
                            returnKeyType="search"
                        />
                        <TouchableOpacity 
                            style={styles.filterButton}
                            onPress={() => handleSearch(searchQuery)}
                        >
                            <Text style={styles.filterIcon}>☰</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0F766E" />
                    </View>
                ) : (
                    <>
                        {/* Popular Authors */}
                        {filteredAuthors.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Popular Authors</Text>
                                    <TouchableOpacity>
                                        <Text style={styles.viewAllLink}>View All</Text>
                                    </TouchableOpacity>
                                </View>
                                <ScrollView 
                                    horizontal 
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.authorsContainer}
                                >
                                    {filteredAuthors.map((author, index) => (
                                        <TouchableOpacity 
                                            key={index} 
                                            style={styles.authorItem}
                                            onPress={() => navigation.navigate('CategoryFeed', { categoryName: author.author })}
                                        >
                                            <View style={styles.authorAvatar}>
                                                <Text style={styles.authorAvatarText}>
                                                    {author.author.charAt(0).toUpperCase()}
                                                </Text>
                                            </View>
                                            <Text style={styles.authorName}>{author.author}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        {/* Trending Keywords */}
                        {filteredKeywords.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Trending Keywords</Text>
                                <View style={styles.keywordsContainer}>
                                    {filteredKeywords.map((keyword, index) => (
                                        <TouchableOpacity 
                                            key={index} 
                                            style={styles.keywordButton}
                                            onPress={() => {
                                                const cleanKeyword = keyword.replace('#', '');
                                                setSearchQuery(cleanKeyword);
                                                handleSearch(cleanKeyword);
                                            }}
                                        >
                                            <Text style={styles.keywordText}>{keyword}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Recent Searches */}
                        {recentSearches.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Recent Searches</Text>
                                    <TouchableOpacity onPress={clearAllSearches}>
                                        <Text style={styles.clearAllLink}>Clear All</Text>
                                    </TouchableOpacity>
                                </View>
                                {recentSearches.map((search) => (
                                    <TouchableOpacity 
                                        key={search.id} 
                                        style={styles.recentSearchItem}
                                        onPress={() => {
                                            setSearchQuery(search.search_query);
                                            handleSearch(search.search_query);
                                        }}
                                    >
                                        <Text style={styles.historyIcon}>🕐</Text>
                                        <Text style={styles.recentSearchText}>{search.search_query}</Text>
                                        <TouchableOpacity 
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                clearRecentSearch(search.id);
                                            }}
                                            style={styles.clearButton}
                                        >
                                            <Text style={styles.clearIcon}>✕</Text>
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                ))}
                            </View>
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
        backgroundColor: '#FFFFFF',
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
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E0F2FE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#0F766E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileIconText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    searchBarContainer: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 52,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchIcon: {
        fontSize: 20,
        marginRight: 12,
        color: '#0F766E',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    filterButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    filterIcon: {
        fontSize: 18,
        color: '#111827',
    },
    section: {
        paddingHorizontal: 24,
        paddingTop: 32,
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
    viewAllLink: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F766E',
    },
    clearAllLink: {
        fontSize: 14,
        fontWeight: '500',
        color: '#9CA3AF',
    },
    authorsContainer: {
        paddingRight: 24,
    },
    authorItem: {
        alignItems: 'center',
        marginRight: 20,
    },
    authorAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#0F766E',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    authorAvatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    authorName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    keywordsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    keywordButton: {
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginBottom: 12,
    },
    keywordText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    recentSearchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    historyIcon: {
        fontSize: 18,
        marginRight: 12,
        color: '#9CA3AF',
    },
    recentSearchText: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    clearButton: {
        padding: 4,
    },
    clearIcon: {
        fontSize: 18,
        color: '#9CA3AF',
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
});
