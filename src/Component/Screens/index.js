/**
 * @format
 * @flow strict-local
 */

import React from 'react';
import type { Node } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from 'react-native-paper';
import Scan from './Scan';
import HomeScreen from './HomeScreen';
import DefaultTabScreen from './DefaultTabScreen';
import CongVanDen from './hcth/hcthCongVanDen/CongVanDen';
import ReadFile from './ReadFile';
import CongVanDenFilter from './hcth/hcthCongVanDen/CongVanDenFilter';

const Stack = createStackNavigator();

const DefaultScreen: () => Node = ({ navigation, route }) => {
    const { colors } = useTheme();
    return (
        <Stack.Navigator initialRouteName='Home' tabBarOptions={{ tabStyle: { height: 200 }, style: { backgroundColor: 'red' } }} screenOptions={{
            tabBarVisible: true, tabBarActiveTintColor: colors.primary,
            headerStyle: { backgroundColor: colors.primary },
            headerTitleStyle: { color: colors.white },
            headerTintColor: 'white',
        }}>
            <Stack.Screen options={{ headerShown: false }} name='Home' component={HomeScreen} />
            <Stack.Screen options={{ headerShown: false }} name='TabScreen' component={DefaultTabScreen} />
            <Stack.Screen options={{ headerTitle: 'Công văn đến' }} name='CongVanDen' component={CongVanDen} />
            <Stack.Screen options={{ headerTitle: '' }} name='ReadFile' component={ReadFile} />
            <Stack.Screen options={{ headerTitle: 'Công văn đến' }} name='FilterCongVanDen' component={CongVanDenFilter} />
        </Stack.Navigator>
    )
}

export default DefaultScreen;