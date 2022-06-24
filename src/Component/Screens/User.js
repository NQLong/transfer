import React, { Fragment, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TouchableOpacity, Text, View, Dimensions, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import T from '@/Utils/common';
import { useTheme } from 'react-native-paper';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;


const User = ({ navigation }) => {
    const settings = useSelector(state => state?.settings);
    const dispatch = useDispatch();
    const { colors } = useTheme();
    const [disableLogout, setDisableLogout] = useState(false);

    const signOut = async () => {
        await setDisableLogout(true);
        await T.storage.clear();
        await T.clearCookie();
        await GoogleSignin.signOut();
        dispatch({ type: 'system:UpdateState', state: null });
        setDisableLogout(false);
    };



    return (
        <View>
            <Fragment>
                <View style={{ alignItems: 'center', marginTop: 50 }}>
                    <TouchableOpacity style={{ ...styles.signIn, backgroundColor: colors.primary }} onPress={signOut} disabled={disableLogout}>
                        <Text style={{ fontFamily: 'Work Sans', color: colors.background, fontSize: 19, fontWeight: 'bold' }} >Đăng xuất</Text>
                    </TouchableOpacity>
                </View>
            </Fragment>
        </View>
    );
}

export default User;

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
