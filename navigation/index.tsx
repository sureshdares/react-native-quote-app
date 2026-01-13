import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthProvider';

// Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import SignUpScreen from '../screens/Auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import HomeScreen from '../screens/App/HomeScreen';
import SearchScreen from '../screens/App/SearchScreen';
import SearchResultsScreen from '../screens/App/SearchResultsScreen';
import CategoryFeedScreen from '../screens/App/CategoryFeedScreen';
import SavedScreen from '../screens/App/SavedScreen';
import AddToCollectionModal from '../screens/App/AddToCollectionModal';
import QuoteEditorScreen from '../screens/App/QuoteEditorScreen';
import AppearanceScreen from '../screens/App/AppearanceScreen';
import NotificationSettingsScreen from '../screens/App/NotificationSettingsScreen';
import MoreScreen from '../screens/App/MoreScreen';
import ProfileScreen from '../screens/App/ProfileScreen';
import { ActivityIndicator, View, Text, Platform } from 'react-native';

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthNavigator() {
    return (
        <AuthStack.Navigator 
            screenOptions={{ 
                headerShown: false,
                animation: 'slide_from_right' as const
            }}
        >
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="SignUp" component={SignUpScreen} />
            <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </AuthStack.Navigator>
    );
}

function TabNavigator() {
    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#0F766E',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#E5E7EB',
                    height: Platform.OS === 'ios' ? 88 : 64,
                    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}
        >
            <Tab.Screen 
                name="Home" 
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Text style={{ fontSize: 24, color }}>🏠</Text>
                    ),
                }}
            />
            <Tab.Screen 
                name="Discover" 
                component={SearchScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Text style={{ fontSize: 24, color: focused ? '#0F766E' : '#9CA3AF' }}>🧭</Text>
                    ),
                }}
            />
            <Tab.Screen 
                name="Saved" 
                component={SavedScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Text style={{ fontSize: 24, color }}>❤️</Text>
                    ),
                }}
            />
            <Tab.Screen 
                name="More" 
                component={MoreScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Text style={{ fontSize: 24, color }}>⚙️</Text>
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

function AppNavigator() {
    return (
        <AppStack.Navigator screenOptions={{ headerShown: false }}>
            <AppStack.Screen name="MainTabs" component={TabNavigator} />
            <AppStack.Screen name="Profile" component={ProfileScreen} />
            <AppStack.Screen name="SearchResults" component={SearchResultsScreen} />
            <AppStack.Screen name="CategoryFeed" component={CategoryFeedScreen} />
            <AppStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
            <AppStack.Screen 
                name="Appearance" 
                component={AppearanceScreen}
                options={{ headerShown: false }}
            />
            <AppStack.Screen 
                name="QuoteEditor" 
                component={QuoteEditorScreen}
                options={{ headerShown: false }}
            />
            <AppStack.Screen 
                name="AddToCollection" 
                component={AddToCollectionModal}
                options={{ presentation: 'transparentModal', animation: 'fade' }}
            />
        </AppStack.Navigator>
    );
}

export default function Navigation() {
    const { session, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0F766E" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {session ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
}
