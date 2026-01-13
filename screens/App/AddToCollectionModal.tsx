import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView, Platform, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthProvider';
import { supabase } from '../../lib/supabase';

interface Collection {
    id: string;
    name: string;
    icon: string;
    quote_count?: number;
}

export default function AddToCollectionModal() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { session } = useAuth();
    const { createNew: initialCreateNew, quoteId, quoteText, quoteAuthor } = (route.params as any) || {};
    const [isCreateMode, setIsCreateMode] = useState(!!initialCreateNew);
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingCollections, setLoadingCollections] = useState(true);

    useEffect(() => {
        if (session && !isCreateMode) {
            loadCollections();
        } else {
            setLoadingCollections(false);
        }
    }, [session, isCreateMode]);

    async function loadCollections() {
        if (!session?.user?.id) return;

        try {
            setLoadingCollections(true);
            const { data, error } = await supabase
                .from('collections')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Get quote counts
            const collectionsWithCounts = await Promise.all(
                (data || []).map(async (collection) => {
                    const { count } = await supabase
                        .from('collection_quotes')
                        .select('*', { count: 'exact', head: true })
                        .eq('collection_id', collection.id);

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
            setLoadingCollections(false);
        }
    }

    async function handleDone() {
        if (!session?.user?.id) {
            Alert.alert('Error', 'You must be logged in');
            return;
        }

        if (isCreateMode) {
            if (!newCollectionName.trim()) {
                Alert.alert('Error', 'Please enter a collection name');
                return;
            }
            await createCollection();
        } else if (selectedCollection && quoteText && quoteAuthor) {
            await addToCollection();
        } else if (!isCreateMode && !selectedCollection) {
            Alert.alert('Info', 'Please select a collection or create a new one');
            return;
        } else {
            navigation.goBack();
        }
    }

    async function createCollection() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('collections')
                .insert({
                    user_id: session?.user?.id,
                    name: newCollectionName.trim(),
                    icon: '📚',
                    color: '#0F766E'
                })
                .select()
                .single();

            if (error) throw error;

            // If we have a quote to add, add it to the new collection
            if (quoteId && quoteText && quoteAuthor && data) {
                await supabase
                    .from('collection_quotes')
                    .insert({
                        collection_id: data.id,
                        quote_id: quoteId,
                        quote_text: quoteText,
                        quote_author: quoteAuthor
                    });
            }

            Alert.alert('Success', 'Collection created successfully!');
            navigation.goBack();
        } catch (error: any) {
            console.error('Error creating collection:', error);
            Alert.alert('Error', error.message || 'Failed to create collection');
        } finally {
            setLoading(false);
        }
    }

    async function addToCollection() {
        if (!selectedCollection || !quoteText || !quoteAuthor) return;

        try {
            setLoading(true);
            const { error } = await supabase
                .from('collection_quotes')
                .insert({
                    collection_id: selectedCollection,
                    quote_text: quoteText,
                    quote_author: quoteAuthor
                });

            if (error) {
                if (error.code === '23505') {
                    Alert.alert('Info', 'This quote is already in the collection');
                } else {
                    throw error;
                }
            } else {
                Alert.alert('Success', 'Quote added to collection!');
            }

            navigation.goBack();
        } catch (error: any) {
            console.error('Error adding to collection:', error);
            Alert.alert('Error', error.message || 'Failed to add quote to collection');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal
            visible={true}
            transparent={true}
            animationType="fade"
            onRequestClose={() => navigation.goBack()}
        >
            <KeyboardAvoidingView 
                style={styles.modalOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => navigation.goBack()}
                >
                    <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalContainer}>
                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {isCreateMode ? 'Create New Collection' : 'Add to Collection'}
                        </Text>
                        <TouchableOpacity 
                            onPress={handleDone}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#0F766E" />
                            ) : (
                                <Text style={styles.doneButton}>Done</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <ScrollView 
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {isCreateMode ? (
                            <View style={styles.createContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Collection name"
                                    placeholderTextColor="#9CA3AF"
                                    value={newCollectionName}
                                    onChangeText={setNewCollectionName}
                                    autoFocus
                                    editable={!loading}
                                />
                                {loading && (
                                    <View style={styles.loadingOverlay}>
                                        <ActivityIndicator size="small" color="#0F766E" />
                                    </View>
                                )}
                            </View>
                        ) : loadingCollections ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#0F766E" />
                            </View>
                        ) : (
                            <>
                                {/* Collection List */}
                                {collections.length === 0 ? (
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyText}>No collections yet</Text>
                                    </View>
                                ) : (
                                    collections.map((collection) => (
                                        <TouchableOpacity
                                            key={collection.id}
                                            style={styles.collectionItem}
                                            onPress={() => setSelectedCollection(collection.id)}
                                            disabled={loading}
                                        >
                                            <View style={styles.collectionItemLeft}>
                                                <Text style={styles.collectionIcon}>{collection.icon || '📚'}</Text>
                                                <View style={styles.collectionInfo}>
                                                    <Text style={styles.collectionItemName}>{collection.name}</Text>
                                                    <Text style={styles.collectionItemCount}>
                                                        {collection.quote_count || 0} quotes
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={[
                                                styles.radioButton,
                                                selectedCollection === collection.id && styles.radioButtonSelected
                                            ]}>
                                                {selectedCollection === collection.id && (
                                                    <View style={styles.radioButtonInner} />
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                )}

                                {/* Create New Collection Button */}
                                <TouchableOpacity 
                                    style={styles.createNewButton}
                                    onPress={() => setIsCreateMode(true)}
                                    disabled={loading}
                                >
                                    <Text style={styles.createNewIcon}>+</Text>
                                    <Text style={styles.createNewText}>Create New Collection</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </ScrollView>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        maxWidth: 400,
        maxHeight: '80%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    doneButton: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0F766E',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    collectionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    collectionItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    collectionIcon: {
        fontSize: 24,
        marginRight: 16,
    },
    collectionInfo: {
        flex: 1,
    },
    collectionItemName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 4,
    },
    collectionItemCount: {
        fontSize: 14,
        color: '#6B7280',
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonSelected: {
        borderColor: '#0F766E',
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#0F766E',
    },
    createNewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        marginTop: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    createNewIcon: {
        fontSize: 24,
        color: '#0F766E',
        marginRight: 8,
        fontWeight: '300',
    },
    createNewText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0F766E',
    },
    createContainer: {
        paddingVertical: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
    },
});
