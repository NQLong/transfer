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
import HomeScreen from './HomeScreen/HomeScreen'
import DefaultTabScreen from './DefaultTabScreen';
import CongVanDen from './hcth/hcthCongVanDen/CongVanDen';
import ReadFile from './ReadFile/ReadFile';
import CongVanDenFilter from './hcth/hcthCongVanDen/CongVanDenFilter';
import CongVanTrinhKy from './hcth/hcthCongVanTrinhKy/CongVanTrinhKy';
import CongVanTrinhKySign from './hcth/hcthCongVanTrinhKy/CongVanTrinhKySign';
import VanBanDi from './hcth/hcthVanBanDi/VanBanDi';

import VanBanDiFilter from './hcth/hcthVanBanDi/VanBanDiFilter';
import ScanQRCode from './ScanQRCode/ScanQRCode';
import SelectSignPosition from './SelectSignPos/SelectSignPos';
import PreviewSignFile from './PreviewSignFile/PreviewSignFile';
const Stack = createStackNavigator();

const DefaultScreen: () => Node = ({ navigation, route }) => {
    const { colors } = useTheme();
    return (
        <Stack.Navigator initialRouteName='Home' tabBarOptions={{ tabStyle: { height: 200 }, style: { backgroundColor: 'red' } }} screenOptions={{
            tabBarVisible: true, tabBarActiveTintColor: colors.primary,
            headerStyle: { backgroundColor: colors.primary },
            headerTitleStyle: { color: colors.white },
            headerTintColor: 'white',
            headerBackTitle: 'Trở lại'
        }}>
            <Stack.Screen options={{ headerShown: false }} name='Home' component={HomeScreen} />
            <Stack.Screen options={{ headerShown: false }} name='TabScreen' component={DefaultTabScreen} />
            <Stack.Screen options={{ headerTitle: 'Công văn đến' }} name='CongVanDen' component={CongVanDen} />
            <Stack.Screen options={{ headerTitle: '' }} name='ReadFile' component={ReadFile} />
            <Stack.Screen options={{ headerTitle: 'Chọn vị trí chữ ký' }} name='SelectSignPos' component={SelectSignPosition} />
            <Stack.Screen options={{ headerTitle: 'Xem lại chữ ký' }} name='PreviewSignFile' component={PreviewSignFile} />
            <Stack.Screen options={{ headerTitle: 'Công văn đến' }} name='FilterCongVanDen' component={CongVanDenFilter} />
            <Stack.Screen options={{ headerTitle: 'Công văn trình ký' }} name='CongVanTrinhKy' component={CongVanTrinhKy} />
            <Stack.Screen options={{ headerTitle: 'Công văn trình ký' }} name='CongVanTrinhKySign' component={CongVanTrinhKySign} />
            <Stack.Screen options={{ headerTitle: 'Lấy key'}} name="ScanQRCode" component={ScanQRCode}/>
            <Stack.Screen options={{ headerTitle: 'Văn bản đi' }} name='VanBanDi' component={VanBanDi} />
            <Stack.Screen options={{ headerTitle: 'Văn bản đi' }} name='VanBanDiFilter' component={VanBanDiFilter} />

        </Stack.Navigator>
    )
}

export default DefaultScreen;