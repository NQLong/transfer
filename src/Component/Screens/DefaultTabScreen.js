import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CongVanDenPage from './hcth/hcthCongVanDen/CongVanDenPage';
import User from './User';
import { useTheme } from 'react-native-paper';

const Tab = createBottomTabNavigator();

export default DefaultScreenTabs = ({ navigation }) => {
    const settings = useSelector(state => state?.settings);
    const dispatch = useDispatch();
    useEffect(() => { if (!settings) navigation.navigate('Home') }, [settings]);
    const { colors } = useTheme();

    return (
        <Tab.Navigator
            initialRouteName="congVanDenPage"
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                headerStyle: {backgroundColor: colors.primary},
                headerTitleStyle: {color: colors.white}
            }}
        >
            <Tab.Screen
                name="congVanDenPage"
                component={CongVanDenPage}
                options={{
                    headerTitle: 'Công văn đến',
                    tabBarLabel: 'Công văn đến',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="document-text-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="user"
                component={User}
                options={{
                    headerTitle: 'Trang cá nhân',
                    tabBarLabel: 'Trang cá nhân',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-circle-outline" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
