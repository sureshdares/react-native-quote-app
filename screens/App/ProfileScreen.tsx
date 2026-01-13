import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthProvider';
import { useTheme } from '../../contexts/ThemeProvider';
import { Strings } from '../../constants/strings';

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const { session } = useAuth();
    const { colors } = useTheme();
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [website, setWebsite] = useState('');
    const [fullName, setFullName] = useState('');
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        if (session) {
            setUserId(session.user.id);
            getProfile(session.user.id);
        }
    }, [session]);

    async function getProfile(id: string) {
        try {
            setLoading(true);
            const { data, error, status } = await supabase
                .from('profiles')
                .select(`username, website, full_name, avatar_url`)
                .eq('id', id)
                .single();

            if (error && status !== 406) {
                // 406 means data is missing, which is fine for a new user
                console.log('Error loading profile', error);
            }

            if (data) {
                setUsername(data.username || '');
                setWebsite(data.website || '');
                setFullName(data.full_name || '');
            }
        } catch (error: any) {
            console.log('Error loading profile details:', error.message);
        } finally {
            setLoading(false);
        }
    }

    async function updateProfile() {
        if (!userId) return;

        try {
            setLoading(true);
            const updates = {
                id: userId,
                username,
                website,
                full_name: fullName,
                updated_at: new Date(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) {
                throw error;
            }
            Alert.alert('Success', 'Profile updated!');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            {/* Header with Back Button */}
            <View style={styles.topHeader}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                            {fullName ? fullName.charAt(0).toUpperCase() : (session?.user.email?.charAt(0).toUpperCase() || '?')}
                        </Text>
                    </View>
                    <Text style={styles.title}>Profile</Text>
                    <Text style={styles.email}>{session?.user.email}</Text>
                </View>

            {/* Profile Card */}
            <View style={styles.card}>
                {/* Email Input */}
                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Email</Text>
                    <View style={[styles.inputContainer, styles.disabledInputContainer]}>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={session?.user.email || ''}
                            editable={false}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>
                </View>

                {/* Full Name Input */}
                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Full Name</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={fullName || ''}
                            onChangeText={setFullName}
                            placeholder="John Doe"
                            placeholderTextColor="#9CA3AF"
                            autoCapitalize="words"
                            autoCorrect={false}
                        />
                    </View>
                </View>

                {/* Username Input */}
                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Username</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={username || ''}
                            onChangeText={setUsername}
                            placeholder="johndoe"
                            placeholderTextColor="#9CA3AF"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>
                </View>

                {/* Website Input */}
                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Website</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={website || ''}
                            onChangeText={setWebsite}
                            placeholder="https://example.com"
                            placeholderTextColor="#9CA3AF"
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="url"
                        />
                    </View>
                </View>

                {/* Update Profile Button */}
                <TouchableOpacity
                    style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
                    onPress={updateProfile}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Update Profile</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Appearance Button */}
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Appearance')}
                activeOpacity={0.8}
            >
                <View style={styles.settingsRow}>
                    <Text style={styles.settingsLabel}>Appearance</Text>
                    <Text style={styles.settingsArrow}>→</Text>
                </View>
            </TouchableOpacity>

            {/* Sign Out Button */}
            <TouchableOpacity
                style={styles.signOutButton}
                onPress={() => supabase.auth.signOut()}
                activeOpacity={0.8}
            >
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
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
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
    },
    // Header Styles
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#0F766E',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 40,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    email: {
        fontSize: 16,
        color: '#6B7280',
    },
    // Card Styles
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
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
    // Input Styles
    inputWrapper: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
        minHeight: 52,
    },
    disabledInputContainer: {
        backgroundColor: '#F9FAFB',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
        paddingVertical: 14,
    },
    disabledInput: {
        color: '#9CA3AF',
    },
    // Button Styles
    button: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    primaryButton: {
        backgroundColor: '#0F766E',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // Sign Out Button
    signOutButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#EF4444',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
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
    signOutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
    },
    settingsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingsLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
    },
    settingsArrow: {
        fontSize: 20,
        color: '#6B7280',
    },
});
