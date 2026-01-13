import { Alert } from 'react-native';
import { Strings } from '../constants/strings';

export interface AppError {
    code?: string;
    message: string;
    details?: any;
}

/**
 * Handle and display errors to users
 */
export function handleError(error: any, customMessage?: string): void {
    console.error('Error:', error);
    
    let message = customMessage || Strings.ERROR_UNKNOWN;
    
    if (error?.message) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    }
    
    // Handle specific error codes
    if (error?.code) {
        switch (error.code) {
            case 'PGRST116':
                // No rows found - not necessarily an error
                return;
            case '23505':
                // Unique constraint violation
                message = 'This item already exists';
                break;
            case '23503':
                // Foreign key violation
                message = 'Invalid reference';
                break;
            case 'ENOTFOUND':
            case 'ECONNREFUSED':
                message = Strings.ERROR_NETWORK;
                break;
        }
    }
    
    Alert.alert(Strings.ERROR, message);
}

/**
 * Handle API errors specifically
 */
export function handleApiError(error: any): void {
    if (error?.status === 401) {
        Alert.alert(Strings.ERROR, 'Please log in to continue');
    } else if (error?.status === 403) {
        Alert.alert(Strings.ERROR, 'You do not have permission to perform this action');
    } else if (error?.status === 404) {
        Alert.alert(Strings.ERROR, 'Resource not found');
    } else if (error?.status >= 500) {
        Alert.alert(Strings.ERROR, 'Server error. Please try again later.');
    } else {
        handleError(error);
    }
}

/**
 * Create a standardized error object
 */
export function createError(message: string, code?: string, details?: any): AppError {
    return {
        code,
        message,
        details,
    };
}
