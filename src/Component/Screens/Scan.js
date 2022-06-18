import React, { Fragment, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TouchableOpacity, Text, View, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import DeviceInfo from 'react-native-device-info';
import { checkQr, updateHoSo } from '@/Store/settings';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;
const styles = {
    cameraBackground: {
        flex: 1,
        justifyContent: 'flex-start',
        backgroundColor: '#28a745'
    },
    container: {
        flex: 1,
        height: deviceHeight,
        marginTop: -250
    },
    markerStyle: {
        borderColor: "#ffffff",
        top: -40
    },
    buttonFlash: {
        alignSelf: 'flex-end',
        marginLeft: deviceWidth / 2 + 120,
        marginTop: 250
    },
    topContent: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 18,
        zIndex: 999,
        color: 'white'
    },
    bottomContent: {
        width: deviceWidth,
        height: 200
    }
};


const Scan: () => Node = ({ navigation }) => {
    let isProcessing = false;
    const settings = useSelector(state => state.settings || {});

    const alertConfirm = (data, result, notLatest = null) => {
        const title = 'XÁC NHẬN';
        const hoTen = result.student.hoTen.toUpperCase();
        T.alert(title, 'Vui lòng xác nhận trạng thái hồ sơ', [
            {
                text: 'Hợp lệ',
                onPress: async () => {
                    T.alert('Xác nhận', `Xác nhận hồ sơ TS ${hoTen.toUpperCase()} là \n HỢP LỆ ?`, [
                        {
                            text: 'Huỷ',
                            onPress: () => {
                                isProcessing = false;
                            }
                        }, {
                            text: 'Xác nhận',
                            style: 'destructive',
                            onPress: async () => {
                                await updateHoSo(settings, data, true, notLatest);
                                isProcessing = false;
                            }
                        }
                    ])

                }
            }, {
                text: 'Không hợp lệ',
                style: 'destructive',
                onPress: async () => {
                    T.alert('Xác nhận', `Xác nhận hồ sơ TS ${hoTen.toUpperCase()} là \n KHÔNG HỢP LỆ ?`, [
                        {
                            text: 'Huỷ',
                            onPress: () => {
                                isProcessing = false;
                            }
                        }, {
                            text: 'Xác nhận',
                            style: 'destructive',
                            onPress: async () => {
                                await updateHoSo(settings, data, false, notLatest);
                                isProcessing = false;
                            }
                        }
                    ])

                }
            }, {
                text: 'Huỷ',
                onPress: () => {
                    isProcessing = false;
                }
            }]);
    }

    const onSuccess = async (e) => {
        if (!isProcessing) {
            isProcessing = true;
            const data = e.data;
            const result = await checkQr(settings, data);
            if (result.error) {
                T.alert('Lỗi', result.error, [{
                    text: 'OK',
                    onPress: () => {
                        isProcessing = false;
                    }
                }]);

            } else if (result.warning) {
                T.alert('CẢNH BÁO', `ĐÂY KHÔNG PHẢI BẢN DỮ LIỆU CUỐI CÙNG CỦA THÍ SINH: ${result.student.hoTen.toUpperCase()}`, [{
                    text: 'Vẫn chấp nhận',
                    style: 'destructive',
                    onPress: () => alertConfirm(data, result, 'notLatest')
                }, {
                    text: 'Huỷ',
                    onPress: () => {
                        isProcessing = false;
                    }
                }]);
            } else alertConfirm(data, result);
        }
    };

    const init = async () => {
        if (!settings.user) {
            navigation.navigate('Home', { rollBackScreen: 'Home' });
            return;
        }
    }

    useEffect(() => {
        init();
    }, [settings]);

    return (
        <View style={styles.cameraBackground}>
            <Fragment>
                <QRCodeScanner reactivate={true} reactivateTimeout={2000} showMarker={true} cameraStyle={styles.container} markerStyle={styles.markerStyle} onRead={onSuccess} vibrate={false}
                />
            </Fragment>
        </View>
    );
}

export default Scan;
