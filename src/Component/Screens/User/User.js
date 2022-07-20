import { signOut, switchUser, SelectAdapter_FwCanBo} from '@/Store/settings';
import { MenuItem, Tile, FormSelect } from '@/Utils/component';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, FlatList } from 'react-native';
import { useTheme, Card, List, Text, Dialog, TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import commonStyles from '../../../Asset/Styles/styles'; 
import styles from './styles';

const User = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const user = useSelector(state => state?.settings?.user);
    const { colors } = useTheme();
    const [disableLogout, setDisableLogout] = useState(false);
    const [isShowUserModal, setShowUserModal] = useState(false);
    const [inputSearch, setInputSearch] = useState('');
    const [userData, setUserData] = useState([]);
    const onSignOut = async () => {
        await setDisableLogout(true);
        dispatch(signOut(() => setDisableLogout(false)));
    };

    const onHideModal = () => {
        setShowUserModal(false);
        setInputSearch('');
    };

    const onSwitchUser = (user) => {
        dispatch(switchUser(user.id, () => {
            setShowUserModal(false);
            navigation.navigate('congVanDenPage');
        }));
    }

    useEffect(() => {
        const dataSource = SelectAdapter_FwCanBo;
        T.get(dataSource.url, { params: dataSource.data({ term: inputSearch }) })
        .then(response => dataSource.processResults(response))
        .then(({ results }) => setUserData(results)).catch(error => { T.alert('Lỗi', 'Không lấy được danh sách người dùng'); console.error(error) });
    }, [inputSearch])

    const renderItem = ({ item }) => {
        return <TouchableOpacity onPress={() => onSwitchUser(item)}><List.Item title={item.text}/></TouchableOpacity>
    }


    return (
        <>
            <ScrollView>
                <Card style={commonStyles.m5} elevation={4}>
                    <List.Item title={'Họ và tên'} right={() => <Text style={commonStyles.alignSelfCenter} variant='bodyMedium'>{`${user?.lastName || ''} ${user?.firstName || ''}`.trim().normalizedName()}</Text>} />
                    <List.Item title={'Email'} right={() => <Text style={commonStyles.alignSelfCenter} variant='bodyMedium'>{user?.email}</Text>} />
                    <View style={styles.buttonView}>
                        <TouchableOpacity style={{ ...styles.signIn, backgroundColor: colors.primary }} onPress={() => setShowUserModal(true)} disabled={disableLogout}>
                            <Text style={{ ...styles.buttonText, color: colors.background}} >Switch user</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.buttonView}>
                        <TouchableOpacity style={{ ...styles.signIn, backgroundColor: colors.primary }} onPress={onSignOut} disabled={disableLogout}>
                            <Text style={{ ...styles.buttonText, color: colors.background}} >Đăng xuất</Text>
                        </TouchableOpacity>
                    </View>
                </Card>
            </ScrollView>
            <Dialog visible={isShowUserModal} onDismiss={onHideModal}>
                        <Dialog.Title>Chọn user</Dialog.Title>
                        <Dialog.Content>
                            <TextInput theme={{ roundness: 20 }} mode='outlined' placeholder='Tìm kiếm' value={inputSearch} onChangeText={value => setInputSearch(value)} />
                        </Dialog.Content>
                        <Dialog.ScrollArea style={{ maxHeight: '70%' }}>
                            <FlatList
                                data={userData}
                                renderItem={renderItem}
                                keyExtractor={item => item.id}
                            />
                        </Dialog.ScrollArea>
                        <Dialog.Actions>
                            {null}
                        </Dialog.Actions>
                </Dialog>
        </>
    );
}

export default User;



