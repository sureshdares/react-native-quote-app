import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import FavoritesScreen from './FavoritesScreen';
import CollectionsScreen from './CollectionsScreen';

const Tab = createMaterialTopTabNavigator();

export default function SavedScreen() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#0F766E',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarIndicatorStyle: {
                    backgroundColor: '#0F766E',
                },
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E7EB',
                },
                tabBarLabelStyle: {
                    fontSize: 14,
                    fontWeight: '600',
                    textTransform: 'none',
                },
            }}
        >
            <Tab.Screen 
                name="Favorites" 
                component={FavoritesScreen}
                options={{ title: 'Favorites' }}
            />
            <Tab.Screen 
                name="Collections" 
                component={CollectionsScreen}
                options={{ title: 'Collections' }}
            />
        </Tab.Navigator>
    );
}
