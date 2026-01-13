import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthProvider';
import { supabase } from '../../lib/supabase';

interface Collection {
    id: string;
    name: string;
    icon: string;
    color: string;
    created_at: string;
    quote_count?: number;
}

export default function CollectionsScreen() {
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const { session } = useAuth();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session && isFocused) {
            loadCollections();
        }
    }, [session, isFocused]);

    async function loadCollections() {
        if (!session?.user?.id) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('collections')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Get quote counts for each collection
            const collectionsWithCounts = await Promise.all(
                (data || []).map(async (collection) => {
                    const { count, error: countError } = await supabase
                        .from('collection_quotes')
                        .select('*', { count: 'exact', head: true })
                        .eq('collection_id', collection.id);

                    if (countError) {
                        console.error('Error counting quotes:', countError);
                    }

                    return {
                        ...collection,
                        quote_count: count || 0
                    };
                })
            );

            setCollections(collectionsWithCounts);
        } catch (error: any) {
            console.error('Error loading collections:', error);
            Alert.alert('Error', 'Failed to load collections');
        } finally {
            setLoading(false);
        }
    }

    async function deleteCollection(collectionId: string) {
        try {
            const { error } = await supabase
                .from('collections')
                .delete()
                .eq('id', collectionId)
                .eq('user_id', session?.user?.id);

            if (error) throw error;
            loadCollections();
        } catch (error: any) {
            console.error('Error deleting collection:', error);
            Alert.alert('Error', 'Failed to delete collection');
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
                <Text style={styles.headerTitle}>Collections</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.menuIcon}>
                        <Text style={styles.menuIconText}>☰</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.profileIcon}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <Text style={styles.profileIconText}>
                            {session?.user.email?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.gridContainer}>
                    {/* New Collection Card */}
                    <TouchableOpacity 
                        style={styles.newCollectionCard}
                        onPress={() => navigation.navigate('AddToCollection', { createNew: true })}
                    >
                        <Text style={styles.plusIcon}>+</Text>
                        <Text style={styles.newCollectionText}>New Collection</Text>
                    </TouchableOpacity>

                    {/* Loading State */}
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#0F766E" />
                        </View>
                    ) : collections.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No collections yet</Text>
                            <Text style={styles.emptySubtext}>Create your first collection!</Text>
                        </View>
                    ) : (
                        /* Collection Cards */
                        collections.map((collection) => (
                            <TouchableOpacity 
                                key={collection.id} 
                                style={styles.collectionCard}
                                onPress={() => navigation.navigate('CollectionDetail', { collectionId: collection.id })}
                            >
                                <View style={[styles.collectionImage, { backgroundColor: collection.color || '#0F766E' }]}>
                                    <Text style={styles.collectionIcon}>{collection.icon || '📚'}</Text>
                                </View>
                                <Text style={styles.collectionName}>{collection.name}</Text>
                                <Text style={styles.collectionCount}>{collection.quote_count || 0} quotes</Text>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity 
                style={styles.fab}
                onPress={() => navigation.navigate('AddToCollection', { createNew: true })}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
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
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        padding: 8,
        marginRight: 12,
    },
    menuIconText: {
        fontSize: 20,
        color: '#111827',
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
        paddingBottom: 100,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    newCollectionCard: {
        width: '48%',
        aspectRatio: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    plusIcon: {
        fontSize: 48,
        color: '#0F766E',
        fontWeight: '300',
        marginBottom: 8,
    },
    newCollectionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F766E',
    },
    collectionCard: {
        width: '48%',
        aspectRatio: 1,
        marginBottom: 16,
    },
    collectionImage: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    collectionIcon: {
        fontSize: 48,
    },
    collectionName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    collectionCount: {
        fontSize: 14,
        color: '#6B7280',
    },
    fab: {
        position: 'absolute',
        bottom: 100,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#0F766E',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    fabIcon: {
        fontSize: 32,
        color: '#FFFFFF',
        fontWeight: '300',
    },
    loadingContainer: {
        width: '100%',
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyContainer: {
        width: '100%',
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
