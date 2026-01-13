import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return false;
        }

        // Configure channel for Android
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('daily-quotes', {
                name: 'Daily Quotes',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#0F766E',
            });
        }

        return true;
    } catch (error) {
        console.error('Error requesting notification permissions:', error);
        return false;
    }
}

/**
 * Schedule daily quote notification
 */
export async function scheduleDailyNotification(
    hour: number,
    minute: number,
    quoteText: string,
    quoteAuthor: string
): Promise<string | null> {
    try {
        // Cancel existing notifications
        await Notifications.cancelAllScheduledNotificationsAsync();

        // Schedule new notification
        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Daily Inspiration',
                body: `${quoteText} — ${quoteAuthor}`,
                data: { type: 'daily_quote', quoteText, quoteAuthor },
                sound: true,
            },
            trigger: {
                hour,
                minute,
                repeats: true,
            },
        });

        return notificationId;
    } catch (error) {
        console.error('Error scheduling notification:', error);
        return null;
    }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
        console.error('Error canceling notifications:', error);
    }
}

/**
 * Get scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
        return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
        console.error('Error getting scheduled notifications:', error);
        return [];
    }
}
