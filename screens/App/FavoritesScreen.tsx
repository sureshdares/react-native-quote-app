import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthProvider';
import { supabase } from '../../lib/supabase';

interface Favorite {
    id: string;
    quote_text: string;
    quote_author: string;
    created_at: string;
}

export default function FavoritesScreen() {
    const navigation = useNavigation<any>();
    const { session } = useAuth();
    const [selectedTab, setSelectedTab] = useState('All Favorites');
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session) {
            loadFavorites();
        }
    }, [session, selectedTab]);

    async function loadFavorites() {
        if (!session?.user?.id) return;

        try {
            setLoading(true);
            let query = supabase
                .from('favorites')
                .select('*')
                .eq('user_id', session.user.id);

            if (selectedTab === 'Recently Added') {
                query = query.order('created_at', { ascending: false }).limit(10);
            } else {
                query = query.order('created_at', { ascending: false });
            }

            const { data, error } = await query;

            if (error) throw error;
            setFavorites(data || []);
        } catch (error: any) {
            console.error('Error loading favorites:', error);
            Alert.alert('Error', 'Failed to load favorites');
        } finally {
            setLoading(false);
        }
    }

    async function removeFavorite(favoriteId: string) {
        try {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('id', favoriteId)
                .eq('user_id', session?.user?.id);

            if (error) throw error;
            loadFavorites();
        } catch (error: any) {
            console.error('Error removing favorite:', error);
            Alert.alert('Error', 'Failed to remove favorite');
        }
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Top Header */}
            <View style={styles.topHeader}>
                <Text style={styles.topHeaderText}>Search & Discovery</Text>
                <View style={styles.topHeaderRight}>
                    {/* <Text style={styles.codeIcon}>{'</>'}</Text> */}
                    <TouchableOpacity 
                        style={styles.profileIconSmall}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <Text style={styles.profileIconTextSmall}>
                            {session?.user.email?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerTitle}>Favorites</Text>
                    <Text style={styles.folderIcon}>📁</Text>
                </View>
                <TouchableOpacity 
                    style={styles.profileIcon}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Text style={styles.profileIconText}>
                        {session?.user.email?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 'All Favorites' && styles.tabActive]}
                        onPress={() => setSelectedTab('All Favorites')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'All Favorites' && styles.tabTextActive]}>
                            All Favorites
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 'Recently Added' && styles.tabActive]}
                        onPress={() => setSelectedTab('Recently Added')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'Recently Added' && styles.tabTextActive]}>
                            Recently Added
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Summary & Filter */}
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryText}>{favorites.length} quotes saved</Text>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterText}>Filter</Text>
                    </TouchableOpacity>
                </View>

                {/* Loading State */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0F766E" />
                    </View>
                ) : favorites.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No favorites yet</Text>
                        <Text style={styles.emptySubtext}>Start saving quotes you love!</Text>
                    </View>
                ) : (
                    /* Quote Cards */
                    favorites.map((item) => (
                        <View key={item.id} style={styles.quoteCard}>
                            <View style={styles.quoteHeader}>
                                <Text style={styles.quoteIcon}>"</Text>
                                <TouchableOpacity 
                                    style={styles.heartIcon}
                                    onPress={() => removeFavorite(item.id)}
                                >
                                    <Text style={styles.heartEmoji}>❤️</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.quoteText}>{item.quote_text}</Text>
                            <View style={styles.quoteFooter}>
                                <View style={styles.authorContainer}>
                                    <View style={styles.authorAvatar}>
                                        <Text style={styles.authorAvatarText}>
                                            {item.quote_author.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <Text style={styles.authorName}>{item.quote_author}</Text>
                                </View>
                                <TouchableOpacity 
                                    style={styles.shareButton}
                                    onPress={() => navigation.navigate('QuoteEditor', {
                                        quote: {
                                            text: item.quote_text,
                                            author: item.quote_author
                                        }
                                    })}
                                >
                                    <Text style={styles.shareIcon}>📤</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        backgroundColor: '#F3F4F6',
    },
    topHeaderText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    topHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    codeIcon: {
        fontSize: 18,
        color: '#6B7280',
        marginRight: 12,
    },
    profileIconSmall: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#0F766E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileIconTextSmall: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginRight: 8,
    },
    folderIcon: {
        fontSize: 20,
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
        padding: 16,
    },
    tabsContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: '#FFFFFF',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    tabTextActive: {
        color: '#0F766E',
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    summaryText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F766E',
    },
    quoteCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
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
    quoteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    quoteIcon: {
        fontSize: 48,
        color: '#E5E7EB',
        fontWeight: 'bold',
        lineHeight: 48,
    },
    heartIcon: {
        padding: 4,
    },
    heartEmoji: {
        fontSize: 20,
    },
    quoteText: {
        fontSize: 18,
        fontStyle: 'italic',
        color: '#111827',
        lineHeight: 26,
        marginBottom: 16,
    },
    quoteFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    authorAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#0F766E',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    authorAvatarText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    authorName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    shareButton: {
        padding: 8,
    },
    shareIcon: {
        fontSize: 20,
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
        color: '#111827',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#6B7280',
    },
});
