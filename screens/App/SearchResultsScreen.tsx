import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
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

export default function SearchResultsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { session } = useAuth();
    const [searchQuery, setSearchQuery] = useState((route.params as any)?.query || '');
    const [results, setResults] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (searchQuery.trim()) {
            performSearch(searchQuery);
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery.trim()) {
                performSearch(searchQuery);
            } else {
                setResults([]);
                setHasSearched(false);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    async function performSearch(query: string) {
        if (!query.trim()) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        try {
            setLoading(true);
            setHasSearched(true);

            const { data, error } = await supabase
                .from('quotes')
                .select('*')
                .or(`text.ilike.%${query}%,author.ilike.%${query}%,category.ilike.%${query}%`)
                .limit(50);

            if (error) throw error;
            setResults(data || []);

            // Save to recent searches
            if (session?.user?.id) {
                await supabase
                    .from('recent_searches')
                    .insert({
                        user_id: session.user.id,
                        search_query: query.trim()
                    });
            }
        } catch (error: any) {
            console.error('Error searching:', error);
            Alert.alert('Error', 'Failed to search quotes');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.searchBar}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search quotes..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                    />
                </View>
                <TouchableOpacity style={styles.filterButton}>
                    <Text style={styles.filterIcon}>☰</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0F766E" />
                </View>
            ) : results.length > 0 ? (
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                >
                    {results.map((quote) => (
                        <View key={quote.id} style={styles.quoteCard}>
                            <Text style={styles.quoteText}>"{quote.text}"</Text>
                            <Text style={styles.quoteAuthor}>- {quote.author}</Text>
                            {quote.tags && quote.tags.length > 0 && (
                                <View style={styles.tagsContainer}>
                                    {quote.tags.slice(0, 3).map((tag, i) => (
                                        <Text key={i} style={styles.tag}>{tag}</Text>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>
            ) : hasSearched ? (
                <View style={styles.emptyStateContainer}>
                    {/* Empty State Illustration */}
                    <View style={styles.emptyIllustration}>
                        <View style={styles.emptyOuterCircle}>
                            <View style={styles.emptyInnerRect}>
                                <Text style={styles.emptySmiley}>😊</Text>
                            </View>
                        </View>
                    </View>

                    {/* Empty State Message */}
                    <Text style={styles.emptyTitle}>No quotes found</Text>
                    <Text style={styles.emptySubtitle}>
                        Try adjusting your filters or searching for a different keyword to find inspiration.
                    </Text>

                    {/* Action Buttons */}
                    <TouchableOpacity style={styles.resetButton}>
                        <Text style={styles.resetIcon}>🔄</Text>
                        <Text style={styles.resetButtonText}>Reset Filters</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.popularLink}
                        onPress={() => navigation.navigate('Discover')}
                    >
                        <Text style={styles.popularLinkText}>View popular quotes instead</Text>
                    </TouchableOpacity>
                </View>
            ) : null}
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
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 8,
        marginRight: 12,
    },
    backIcon: {
        fontSize: 24,
        color: '#111827',
        fontWeight: 'bold',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 44,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 12,
        color: '#0F766E',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    filterIcon: {
        fontSize: 18,
        color: '#111827',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quoteCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
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
    },
    tag: {
        fontSize: 12,
        color: '#0F766E',
        marginRight: 8,
        fontWeight: '500',
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyIllustration: {
        marginBottom: 32,
    },
    emptyOuterCircle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyInnerRect: {
        width: 120,
        height: 120,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        padding: 8,
    },
    emptySmiley: {
        fontSize: 24,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0F766E',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 16,
        minWidth: 200,
        justifyContent: 'center',
    },
    resetIcon: {
        fontSize: 18,
        marginRight: 8,
        color: '#FFFFFF',
    },
    resetButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    popularLink: {
        paddingVertical: 12,
    },
    popularLinkText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
});
