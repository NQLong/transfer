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

const TuyenSinh = createStackNavigator();

const DefaultScreen: () => Node = ({ navigation, route }) => {
    const { colors } = useTheme();
    return (
        <TuyenSinh.Navigator initialRouteName='Home' tabBarOptions={{ tabStyle: { height: 200 }, style: { backgroundColor: 'red' } }} screenOptions={{ headerShown: false, tabBarVisible: true }}>
            <TuyenSinh.Screen name='Home' component={HomeScreen} />
            <TuyenSinh.Screen name='TabScreen' component={DefaultTabScreen} />
        </TuyenSinh.Navigator>
    )
}

export default DefaultScreen;