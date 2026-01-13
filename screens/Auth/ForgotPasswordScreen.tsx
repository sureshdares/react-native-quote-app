import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function ForgotPasswordScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    async function sendResetEmail() {
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            // redirectTo: 'myapp://reset-password', // Deep linking needed for this to work fully in app
        });
        setLoading(false);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Success', 'Check your email for the password reset link.');
            navigation.goBack();
        }
    }

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            {/* App Branding Section */}
            <View style={styles.brandingContainer}>
                <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>""</Text>
                </View>
                <Text style={styles.appName}>Lexis</Text>
                <Text style={styles.tagline}>Discover wisdom in every word.</Text>
            </View>

            {/* Reset Password Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Reset Password</Text>
                <Text style={styles.subtitle}>Enter your email to receive a password reset link.</Text>

                {/* Email Input */}
                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            onChangeText={(text) => setEmail(text)}
                            value={email || ''}
                            placeholder="name@company.com"
                            placeholderTextColor="#9CA3AF"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            autoCorrect={false}
                        />
                    </View>
                </View>

                {/* Send Reset Link Button */}
                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={sendResetEmail}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Send Reset Link</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Back to Sign In Link */}
            <View style={styles.backContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backLink}>Back to Sign In</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    contentContainer: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    // Branding Section
    brandingContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: '#0F766E',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconText: {
        fontSize: 32,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '400',
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
    cardTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 32,
        lineHeight: 24,
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
    input: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
        paddingVertical: 14,
    },
    // Button Styles
    button: {
        backgroundColor: '#0F766E',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        minHeight: 52,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    // Back Link
    backContainer: {
        alignItems: 'center',
    },
    backLink: {
        fontSize: 14,
        color: '#0F766E',
        fontWeight: '600',
    },
});
