import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function SignUpScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function signUpWithEmail() {
        setLoading(true);
        const { error, data } = await supabase.auth.signUp({
            email: email,
            password: password,
        });
        setLoading(false);

        if (error) {
            Alert.alert('Sign Up Failed', error.message);
        } else if (!data.session) {
            Alert.alert('Please check your inbox for email verification!');
        } else {
            // Session should auto-update via AuthContext
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

            {/* Sign Up Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Create Account</Text>

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

                {/* Password Input */}
                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            onChangeText={(text) => setPassword(text)}
                            value={password || ''}
                            placeholder="Enter your password"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TouchableOpacity 
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Text style={styles.eyeIconText}>{showPassword ? '👁' : '👁‍🗨'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Sign Up Button */}
                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={signUpWithEmail}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Sign Up</Text>
                    )}
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                    <View style={styles.dividerLine} />
                </View>
            </View>

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
                <Text style={styles.signInText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.signInLink}>Sign In</Text>
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
        marginBottom: 32,
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
    passwordInput: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
        paddingVertical: 14,
    },
    eyeIcon: {
        padding: 8,
        marginLeft: 8,
    },
    eyeIconText: {
        fontSize: 20,
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
    // Divider Styles
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 8,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
        marginHorizontal: 16,
    },
    // Sign In Link
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signInText: {
        fontSize: 14,
        color: '#6B7280',
    },
    signInLink: {
        fontSize: 14,
        color: '#0F766E',
        fontWeight: '600',
    },
});
