import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthProvider';
import { useTheme } from '../../contexts/ThemeProvider';
import { Strings } from '../../constants/strings';

export default function MoreScreen() {
    const navigation = useNavigation<any>();
    const { session } = useAuth();
    const { colors } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>More</Text>
                    <TouchableOpacity 
                        style={styles.profileButton}
                        onPress={() => navigation.navigate('Profile')}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.profileIcon, { backgroundColor: colors.accent }]}>
                            <Text style={styles.profileIconText}>
                                {session?.user.email?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Settings Options */}
                <View style={styles.optionsContainer}>
                    <TouchableOpacity 
                        style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => navigation.navigate('Profile')}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.optionIcon]}>👤</Text>
                        <View style={styles.optionContent}>
                            <Text style={[styles.optionTitle, { color: colors.text }]}>{Strings.PROFILE}</Text>
                            <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>View and edit your profile</Text>
                        </View>
                        <Text style={[styles.optionArrow, { color: colors.textSecondary }]}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => navigation.navigate('Appearance')}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.optionIcon]}>🎨</Text>
                        <View style={styles.optionContent}>
                            <Text style={[styles.optionTitle, { color: colors.text }]}>{Strings.APPEARANCE}</Text>
                            <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>Customize theme and colors</Text>
                        </View>
                        <Text style={[styles.optionArrow, { color: colors.textSecondary }]}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => navigation.navigate('NotificationSettings')}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.optionIcon]}>🔔</Text>
                        <View style={styles.optionContent}>
                            <Text style={[styles.optionTitle, { color: colors.text }]}>{Strings.NOTIFICATIONS}</Text>
                            <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>Manage notification settings</Text>
                        </View>
                        <Text style={[styles.optionArrow, { color: colors.textSecondary }]}>→</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    profileButton: {
        padding: 4,
    },
    profileIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileIconText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    optionsContainer: {
        padding: 20,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    optionIcon: {
        fontSize: 24,
        marginRight: 16,
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    optionSubtitle: {
        fontSize: 14,
    },
    optionArrow: {
        fontSize: 20,
        marginLeft: 12,
    },
});
