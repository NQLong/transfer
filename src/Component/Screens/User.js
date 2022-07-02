import { signOut } from '@/Store/settings';
import { MenuItem, Tile } from '@/Utils/component';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme, Card, List, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';



const User = () => {
    const dispatch = useDispatch();
    const user = useSelector(state => state?.settings?.user);
    const { colors } = useTheme();
    const [disableLogout, setDisableLogout] = useState(false);

    const onSignOut = async () => {
        await setDisableLogout(true);
        dispatch(signOut(() => setDisableLogout(false)));
    };



    return (
        <ScrollView>
            <Card style={{ margin: 5 }} elevation={4}>
                <List.Item title={'Họ và tên'} right={() => <Text style={{ alignSelf: 'center' }} variant='bodyMedium'>{`${user?.lastName || ''} ${user?.firstName || ''}`.trim().normalizedName()}</Text>} />
                <List.Item title={'Email'} right={() => <Text style={{ alignSelf: 'center' }} variant='bodyMedium'>{user?.email}</Text>} />
                <View style={{ alignItems: 'center', marginTop: 20, flex: 1, marginBottom: 20 }}>
                    <TouchableOpacity style={{ ...styles.signIn, backgroundColor: colors.primary }} onPress={onSignOut} disabled={disableLogout}>
                        <Text style={{ fontFamily: 'Work Sans', color: colors.background, fontSize: 19, fontWeight: 'bold' }} >Đăng xuất</Text>
                    </TouchableOpacity>
                </View>
            </Card>
        </ScrollView>
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
