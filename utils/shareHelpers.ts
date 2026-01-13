import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

/**
 * Share quote as text
 */
export async function shareQuoteAsText(text: string, author: string): Promise<void> {
    try {
        const shareText = `"${text}"\n— ${author}`;
        const isAvailable = await Sharing.isAvailableAsync();
        
        if (isAvailable) {
            await Sharing.shareAsync(shareText);
        } else {
            // Fallback: Copy to clipboard
            if (Platform.OS === 'web') {
                navigator.clipboard.writeText(shareText);
                Alert.alert('Success', 'Quote copied to clipboard');
            } else {
                Alert.alert('Info', 'Sharing not available on this device');
            }
        }
    } catch (error: any) {
        console.error('Error sharing quote:', error);
        if (error.code !== 'E_USER_CANCELLED') {
            Alert.alert('Error', 'Failed to share quote');
        }
    }
}

/**
 * Share quote with system share sheet
 */
export async function shareWithSystemSheet(text: string, author: string, imageUri?: string): Promise<void> {
    try {
        const shareText = `"${text}"\n— ${author}`;
        const isAvailable = await Sharing.isAvailableAsync();
        
        if (isAvailable) {
            if (imageUri) {
                await Sharing.shareAsync(imageUri, {
                    mimeType: 'image/png',
                    dialogTitle: 'Share Quote',
                });
            } else {
                await Sharing.shareAsync(shareText);
            }
        } else {
            Alert.alert('Info', 'Sharing not available on this device');
        }
    } catch (error: any) {
        console.error('Error sharing:', error);
        if (error.code !== 'E_USER_CANCELLED') {
            Alert.alert('Error', 'Failed to share');
        }
    }
}
