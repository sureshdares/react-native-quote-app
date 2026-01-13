import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Switch, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthProvider';
import { supabase } from '../../lib/supabase';
import { requestNotificationPermissions, scheduleDailyNotification, cancelAllNotifications } from '../../utils/notifications';
import { getDailyQuote } from '../../utils/dailyQuote';

export default function NotificationSettingsScreen() {
    const navigation = useNavigation<any>();
    const { session } = useAuth();
    const [dailyQuoteEnabled, setDailyQuoteEnabled] = useState(true);
    const [hour, setHour] = useState(8);
    const [minute, setMinute] = useState(0);
    const [isAM, setIsAM] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [permissionsGranted, setPermissionsGranted] = useState(false);

    useEffect(() => {
        if (session) {
            loadSettings();
            checkPermissions();
        }
    }, [session]);

    async function checkPermissions() {
        const granted = await requestNotificationPermissions();
        setPermissionsGranted(granted);
        if (!granted) {
            Alert.alert(
                'Permissions Required',
                'Please enable notifications in your device settings to receive daily quotes.',
                [{ text: 'OK' }]
            );
        }
    }

    async function loadSettings() {
        if (!session?.user?.id) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('notification_preferences')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (data) {
                setDailyQuoteEnabled(data.daily_quote_enabled);
                const timeParts = data.notification_time.split(':');
                const hour24 = parseInt(timeParts[0]);
                setHour(hour24 % 12 || 12);
                setMinute(parseInt(timeParts[1]));
                setIsAM(hour24 < 12);
            }
        } catch (error: any) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    }

    async function saveSettings() {
        if (!session?.user?.id) return;

        try {
            setSaving(true);

            // Convert to 24-hour format
            let hour24 = hour;
            if (!isAM && hour !== 12) hour24 = hour + 12;
            if (isAM && hour === 12) hour24 = 0;

            const timeString = `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;

            // Upsert notification preferences
            const { error: prefsError } = await supabase
                .from('notification_preferences')
                .upsert({
                    user_id: session.user.id,
                    daily_quote_enabled: dailyQuoteEnabled,
                    notification_time: timeString,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                });

            if (prefsError) throw prefsError;

            // Schedule or cancel notifications
            if (dailyQuoteEnabled && permissionsGranted) {
                // Get today's quote for preview
                const quote = await getDailyQuote(session.user.id);
                if (quote) {
                    await scheduleDailyNotification(hour24, minute, quote.text, quote.author);
                }
            } else {
                await cancelAllNotifications();
            }

            Alert.alert('Success', 'Notification settings saved!');
            navigation.goBack();
        } catch (error: any) {
            console.error('Error saving settings:', error);
            Alert.alert('Error', 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    }

    function adjustHour(delta: number) {
        setHour(prev => {
            let newHour = prev + delta;
            if (newHour > 12) newHour = 1;
            if (newHour < 1) newHour = 12;
            return newHour;
        });
    }

    function adjustMinute(delta: number) {
        setMinute(prev => {
            let newMinute = prev + delta;
            if (newMinute >= 60) newMinute = 0;
            if (newMinute < 0) newMinute = 59;
            return newMinute;
        });
    }

    function getPreviewDate(): string {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const today = new Date();
        const nextMonday = new Date(today);
        nextMonday.setDate(today.getDate() + (1 + 7 - today.getDay()) % 7);
        return `${days[nextMonday.getDay()]}, ${months[nextMonday.getMonth()]} ${nextMonday.getDate()}`;
    }

    const previewTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${isAM ? 'AM' : 'PM'}`;

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={loadSettings}>
                    <Text style={styles.resetLink}>Reset</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0F766E" />
                </View>
            ) : (
                <>
                    {/* Info Banner */}
                    <View style={styles.infoBanner}>
                        <Text style={styles.infoIcon}>ℹ️</Text>
                        <Text style={styles.infoText}>
                            {permissionsGranted 
                                ? 'System notifications are enabled for this app.'
                                : 'Please enable notifications in device settings.'}
                        </Text>
                    </View>

                    {/* Daily Quote Notifications Toggle */}
                    <View style={styles.section}>
                        <View style={styles.toggleRow}>
                            <View style={styles.toggleLeft}>
                                <Text style={styles.toggleTitle}>Daily Quote Notifications</Text>
                                <Text style={styles.toggleSubtitle}>Fresh inspiration every morning</Text>
                            </View>
                            <Switch
                                value={dailyQuoteEnabled}
                                onValueChange={setDailyQuoteEnabled}
                                trackColor={{ false: '#E5E7EB', true: '#0F766E' }}
                                thumbColor={dailyQuoteEnabled ? '#FFFFFF' : '#9CA3AF'}
                            />
                        </View>
                    </View>

                    {/* Delivery Time */}
                    {dailyQuoteEnabled && (
                        <>
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionIcon}>🕐</Text>
                                    <Text style={styles.sectionTitle}>Delivery Time</Text>
                                </View>

                                {/* Time Picker */}
                                <View style={styles.timePickerContainer}>
                                    <View style={styles.timePicker}>
                                        <TouchableOpacity 
                                            style={styles.timeButton}
                                            onPress={() => adjustHour(1)}
                                        >
                                            <Text style={styles.timeButtonText}>▲</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.timeDisplay}>{hour.toString().padStart(2, '0')}</Text>
                                        <TouchableOpacity 
                                            style={styles.timeButton}
                                            onPress={() => adjustHour(-1)}
                                        >
                                            <Text style={styles.timeButtonText}>▼</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.timeSeparator}>:</Text>

                                    <View style={styles.timePicker}>
                                        <TouchableOpacity 
                                            style={styles.timeButton}
                                            onPress={() => adjustMinute(15)}
                                        >
                                            <Text style={styles.timeButtonText}>▲</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.timeDisplay}>{minute.toString().padStart(2, '0')}</Text>
                                        <TouchableOpacity 
                                            style={styles.timeButton}
                                            onPress={() => adjustMinute(-15)}
                                        >
                                            <Text style={styles.timeButtonText}>▼</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.amPmContainer}>
                                        <TouchableOpacity
                                            style={[styles.amPmButton, isAM && styles.amPmButtonActive]}
                                            onPress={() => setIsAM(true)}
                                        >
                                            <Text style={[styles.amPmText, isAM && styles.amPmTextActive]}>AM</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.amPmButton, !isAM && styles.amPmButtonActive]}
                                            onPress={() => setIsAM(false)}
                                        >
                                            <Text style={[styles.amPmText, !isAM && styles.amPmTextActive]}>PM</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <Text style={styles.localTimeLabel}>LOCAL TIME</Text>
                            </View>

                            {/* Notification Preview */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionIcon}>🔔</Text>
                                    <Text style={styles.sectionTitle}>Notification Preview</Text>
                                </View>

                                <View style={styles.previewContainer}>
                                    <Text style={styles.previewTime}>{previewTime}</Text>
                                    <Text style={styles.previewDate}>{getPreviewDate()}</Text>

                                    <View style={styles.previewCard}>
                                        <View style={styles.previewCardHeader}>
                                            <Text style={styles.previewLabel}>DAILY INSPIRATION</Text>
                                            <Text style={styles.previewTag}>now</Text>
                                        </View>
                                        <Text style={styles.previewTitle}>Your Daily Wisdom</Text>
                                        <Text style={styles.previewQuote}>
                                            "The best way to predict the future is to create it."
                                        </Text>
                                        <Text style={styles.previewAuthor}>— Peter Drucker</Text>
                                    </View>
                                </View>

                                <Text style={styles.footerText}>
                                    Quotes are curated based on your selected interests and delivered according to your local device time.
                                </Text>
                            </View>
                        </>
                    )}

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                        onPress={saveSettings}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Settings</Text>
                        )}
                    </TouchableOpacity>
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    contentContainer: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
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
    resetLink: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0F766E',
    },
    loadingContainer: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E0F2FE',
        padding: 16,
        marginHorizontal: 24,
        marginTop: 16,
        borderRadius: 12,
    },
    infoIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#0369A1',
        lineHeight: 20,
    },
    section: {
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    toggleLeft: {
        flex: 1,
    },
    toggleTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    toggleSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    timePickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    timePicker: {
        alignItems: 'center',
    },
    timeButton: {
        padding: 8,
        marginVertical: 4,
    },
    timeButtonText: {
        fontSize: 16,
        color: '#0F766E',
        fontWeight: 'bold',
    },
    timeDisplay: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#111827',
        minWidth: 60,
        textAlign: 'center',
    },
    timeSeparator: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#111827',
        marginHorizontal: 8,
    },
    amPmContainer: {
        marginLeft: 20,
    },
    amPmButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        marginBottom: 8,
    },
    amPmButtonActive: {
        backgroundColor: '#0F766E',
    },
    amPmText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    amPmTextActive: {
        color: '#FFFFFF',
    },
    localTimeLabel: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
    },
    previewContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    previewTime: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    previewDate: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 24,
    },
    previewCard: {
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        padding: 20,
        width: '100%',
    },
    previewCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    previewLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        letterSpacing: 1,
    },
    previewTag: {
        fontSize: 12,
        fontWeight: '600',
        color: '#0F766E',
    },
    previewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    previewQuote: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 24,
        marginBottom: 8,
    },
    previewAuthor: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    footerText: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        textAlign: 'center',
    },
    saveButton: {
        backgroundColor: '#0F766E',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 24,
        marginTop: 32,
        minHeight: 52,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
