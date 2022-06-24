/**
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState } from 'react';
import type { Node } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TouchableOpacity, TextInput, Platform, StyleSheet, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import * as Animatable from 'react-native-animatable';
import { useTheme } from 'react-native-paper';
import { login, googleSignin, verifyToken, getState } from '@/Store/settings';
import T from '@/Utils/common';
import { GoogleSignin, GoogleSigninButton, statusCodes, } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
    webClientId: '318805336792-3g9b03uc6tk8b6ra1v49otm7ajddb8oi.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
    offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
    // hostedDomain: '', // specifies a hosted domain restriction
    // forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
    // accountName: '', // [Android] specifies an account name on the device that should be used
    // iosClientId: '<FROM DEVELOPER CONSOLE>', // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
    // googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. GoogleService-Info-Staging
    // openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
    // profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
});

const HomeScreen: () => Node = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const settings = useSelector(state => state?.settings);
    const state = useSelector(state => state);
    const { colors } = useTheme();
    const style = T.style(colors);
    const [loginDisable, setLoginDisable] = useState(true);
    // const rollBackScreen = route.params && route.params.rollBackScreen ? route.params.rollBackScreen : 'ProfileScreen';
    // const hideHeader = route.params && route.params.hideHeader;

    const init = async () => {
        if (T.isDebug) {
            await T.verifyToken();
            if (!await T.hasCookie()) {
                alert('debugEmail khôn hợp lệ')
            }
            return getSystemState();
        } else {
            const currentUser = await GoogleSignin.getCurrentUser();
            if (currentUser) {
                await T.setCookie();
                if (await T.hasCookie()) {
                    return getSystemState();
                }
            }
            enableLogin();
        }
    }

    const getSystemState = () => {
        dispatch(getState());
    };

    const enableLogin = () => setLoginDisable(false);

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        if (settings) {
            navigation.navigate('TabScreen');
        } (!settings)
            enableLogin();
    }, [settings]);


    // // };
    const signin = async () => {
        const userInfo = await googleSignin();
        if (userInfo && await T.verifyToken(userInfo.idToken))
            getSystemState();
    }

    return (
        <View style={{ height: '100%', backgroundColor: colors.primary }}>
            <View style={{ ...style.container, backgroundColor: colors.primary, marginTop: 0 }}>
                <View style={{ height: 50 }} />
                <Animatable.View animation='fadeInUpBig' style={{ ...styles.mainArea, backgroundColor: colors.background }}>

                    <View style={{ backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }}>
                        <Image source={{ uri: 'https://hcmussh.edu.vn/img/favicon.png' }} style={{ width: 300, height: 200, backgroundColor: 'transparent' }} />
                    </View>

                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <TouchableOpacity style={{ ...styles.signIn, backgroundColor: colors.primary }} onPress={signin} disabled={loginDisable}>
                            <Text style={{ fontFamily: 'Work Sans', color: colors.background, fontSize: 19, fontWeight: 'bold' }} >Đăng nhập</Text>
                        </TouchableOpacity>
                    </View>


                </Animatable.View >
            </View >
        </View >
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    mainArea: {
        flex: 1,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 40
    },
    label: {
        fontFamily: 'Work Sans',
        color: '#999999',
        fontSize: 15
    },
    formInput: {
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#CCC',
        padding: 10,
        paddingBottom: Platform.OS === 'ios' ? 10 : 0
    },
    textInput: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
        color: '#333333',
        fontSize: 20
    },
    errorMsg: {
        color: '#FF0000',
        fontSize: 14,
        marginBottom: 10
    },
    signIn: {
        height: 50,
        width: '70%',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    logo: {
        width: 1000,
        heith: 300
    }
});
