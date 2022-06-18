/**
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState } from 'react';
import type { Node } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TouchableOpacity, TextInput, Platform, StyleSheet } from 'react-native';
// import Header from '@/Component/Common/Header';
import { useSelector, useDispatch } from 'react-redux';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from 'react-native-paper';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { login } from '@/Store/settings';
import T from '@/Utils/common';

const HomeScreen: () => Node = ({ navigation, route }) => {
    // const rollBackScreen = route.params && route.params.rollBackScreen ? route.params.rollBackScreen : 'ProfileScreen';
    // const hideHeader = route.params && route.params.hideHeader;
    const dispatch = useDispatch();
    const settings = useSelector(state => state.settings || {});
    const { colors } = useTheme();
    const style = T.style(colors);
    const [data, setData] = useState({
        cmnd: '',
        secretCode: ''
    });

    const init = async () => {
        if (settings.user) {
            navigation.navigate('Scanner');
        }
    };

    useEffect(() => {
        init();
    }, [settings]);



    const onCmndChange = (cmnd) => {
        setData({ ...data, cmnd: cmnd.replace(/[^0-9]/g, '') });
    };

    const onSecretCodeChange = (secretCode) => {
        setData({ ...data, secretCode });
    };

    const onLogin = async () => {
        if (data.cmnd.length == 0) {
            return T.alert('CMND/CCCD bị trống', 'CMND/CCCD không được để trống, vui lòng nhập!');
        }

        const user = await login({
            cmnd: data.cmnd,
            secretCode: data.secretCode
        });

        if (user.user) {
            let { cmnd, secretCode } = data;
            await AsyncStorage.setItem('data', JSON.stringify({ cmnd, secretCode }));

            dispatch({ type: 'system:UpdateState', state: { user: data } });
            T.socket.disconnect();
            T.socket.connect();
            T.socket.emit('system:join');
            navigation.navigate('Scanner');
        } else {
            T.alert('Không hợp lệ!', user.error || '');
        }
    };

    return (
        <View style={{ height: '100%', backgroundColor: colors.primary }}>
            <View style={{ ...style.container, backgroundColor: colors.primary, marginTop: 0 }}>
                <View style={{ height: 50 }} />
                <Animatable.View animation='fadeInUpBig' style={{ ...styles.mainArea, backgroundColor: colors.background }}>

                    <Text style={styles.label}>CMND/CCCD</Text>
                    <View style={styles.formInput}>
                        <Ionicons name='person-outline' color='#999999' size={20} />
                        <TextInput placeholder='Nhập CMND' placeholderTextColor='#999999' style={styles.textInput} autoCapitalize='none' value={data.cmnd} onChangeText={onCmndChange} />
                    </View>

                    <Text style={styles.label}>Mã bí mật</Text>
                    <View style={styles.formInput}>
                        <Ionicons name='key-outline' color='#999999' size={20} />
                        <TextInput placeholder='Nhập mã bí mật' placeholderTextColor='#999999' style={styles.textInput} autoCapitalize='none' value={data.secretCode} onChangeText={onSecretCodeChange} />
                    </View>


                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <TouchableOpacity style={{ ...styles.signIn, backgroundColor: colors.primary }} onPress={onLogin}>
                            {/* <LinearGradient colors={[colors.primary, '#41a2eb']} style={styles.signIn}> */}
                            <Text style={{ fontFamily: 'Work Sans', color: colors.background, fontSize: 19, fontWeight: 'bold' }} >Đăng nhập</Text>
                            {/* </LinearGradient> */}
                        </TouchableOpacity>
                    </View>
                </Animatable.View>
            </View>
        </View>
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
    }
});
