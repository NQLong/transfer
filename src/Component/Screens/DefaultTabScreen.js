import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CongVanDenPage from './hcth/hcthCongVanDen/CongVanDenPage';
import CongVanTrinhKyPage from './hcth/hcthCongVanTrinhKy/CongVanTrinhKyPage';
import User from './User/User';
import Notification from './notification/Notification';
import { useTheme, Badge } from 'react-native-paper';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { addNotification } from './notification/redux';
import commonStyles from '../../Asset/Styles/styles';

import VanBanDiPage from './hcth/hcthVanBanDi/VanBanDiPage';

const Tab = createBottomTabNavigator();

export default DefaultScreenTabs = ({ navigation }) => {
    const settings = useSelector(state => state?.settings);
    const unreadNotification = useSelector(state => state?.notification);

    const notificationLength = unreadNotification?.page?.totalItem || 0;

    const dispatch = useDispatch();

    useEffect(() => {
        if (!settings) navigation.navigate('');

        T.socket.on('receive-notification', (email, notifyItem) => {
            const user = settings?.user || {};
            if (user.email && user.email == email) {
                dispatch(addNotification(notifyItem));
            }
        });
    }, [settings]);

    const { colors } = useTheme();

    return (
        <Tab.Navigator
            initialRouteName="congVanTrinhKy"
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                headerStyle: { backgroundColor: colors.primary },
                headerTitleStyle: { color: colors.white }
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
                    headerRight: () => (
                        <TouchableOpacity onPress={() => { navigation.navigate('FilterCongVanDen') }} style={{ width: 30, marginRight: 15 }}>
                            <Ionicons name='search-outline' color='white' style={{ fontSize: 25 }} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <Tab.Screen
                name="vanBanDiPage"
                component={VanBanDiPage}
                options={{
                    headerTitle: 'Văn bản đi',
                    tabBarLabel: 'Văn bản đi',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="reader-outline" color={color} size={size} />
                    ),
                    headerRight: () => (
                        <TouchableOpacity onPress={() => { navigation.navigate('VanBanDiFilter') }} style={{ width: 30, marginRight: 15 }}>
                            <Ionicons name='search-outline' color='white' style={{ fontSize: 25 }} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <Tab.Screen
                name="congVanTrinhKyPage"
                component={CongVanTrinhKyPage}
                options={{
                    headerTitle: 'Công văn trình ký',
                    tabBarLabel: 'Công văn trình ký',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="reader-outline" color={color} size={size} />
                    )
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
            <Tab.Screen
                name="notification"
                component={Notification}
                options={{
                    headerTitle: 'Thông báo',
                    tabBarLabel: 'Thông báo',
                    tabBarIcon: ({ color, size }) => (
                        <>
                            <Badge style={commonStyles.badgeBottomBar}>
                                {notificationLength > 99 ? '99+' : notificationLength}
                            </Badge>
                            <Ionicons name="notifications-outline" color={color} size={size} />
                        </>
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
