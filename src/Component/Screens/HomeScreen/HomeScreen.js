/**
 * @format
 * @flow strict-local
 */

import { getState, signOut } from '@/Store/settings';
import T from '@/Utils/common';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import type { Node } from 'react';
import React, { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import commonStyles from '../../../Asset/Styles/styles';

import styles from './styles';

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


    const init = async () => {
        if (T.isDebug) {
            // if (!await T.verifyToken() || !await T.hasCookie()) {
            //     dispatch(signOut());
            //     alert('debugEmail khôn hợp lệ');
            // } else
            return getSystemState();
        } else {
            let currentUser;
            try {
                currentUser = await GoogleSignin.getCurrentUser();
            } catch {
                currentUser = null;
            }
            if (currentUser) {
                await T.setCookie();
                if (await T.hasCookie()) {
                    return getSystemState();
                }
                dispatch(signOut());
            }
            enableLogin();
        }
    }

    const getSystemState = (done) => {
        dispatch(getState(done));
    };

    const enableLogin = () => setLoginDisable(false);

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        if (settings?.user?.email) {
            navigation.navigate('TabScreen');
        } else
            enableLogin();
    }, [settings]);



    // // };
    const signin = async () => {
        try {
            const userInfo = await T.googleSignin();
            if (userInfo && await T.verifyToken(userInfo.idToken))
                getSystemState();
            else dispatch(signOut());
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <View style={{ ...styles.container, backgroundColor: colors.primary }}>
            <View style={{ ...style.container, backgroundColor: colors.primary, marginTop: 0 }}>
                <View style={commonStyles.height50} />
                <Animatable.View animation='fadeInUpBig' style={{ ...styles.mainArea, backgroundColor: colors.background }}>

                    <View style={styles.imageView}>
                        <Image source={require('../../../Asset/Img/hcmussh.png')} style={styles.image} />
                    </View>

                    <View style={styles.buttonView}>
                        <TouchableOpacity style={{ ...styles.signIn, backgroundColor: colors.primary }} onPress={signin} disabled={loginDisable}>
                            <Text style={{ ...styles.loginText, color: colors.background }} >Đăng nhập</Text>
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
