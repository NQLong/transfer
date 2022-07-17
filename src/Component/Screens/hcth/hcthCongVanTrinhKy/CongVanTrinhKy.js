import React, { useState, useEffect } from 'react';
import { ActivityIndicator, RefreshControl, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
// import { RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Button, Card, List, Menu, Switch, Text, useTheme, TextInput } from 'react-native-paper';
import { getCongVanTrinhKy, HcthCongVanTrinhKyGet } from './redux';

import { renderScrollView } from '@/Utils/component';

import T from '@/Utils/common';

import styles from './styles';
import commonStyles from '../../../../Asset/Styles/styles';
import style from '../../notification/style';



const FileList = ({ navigation }) => {
    const fileKy = useSelector(state => state.hcthCongVanTrinhKy?.item?.fileKy);
    const id = useSelector(state => state.hcthCongVanTrinhKy?.item?.congVanKy?.id);
    const { colors } = useTheme();
    const renderContent = () => {
        console.log(navigation);
        console.log(Array.isArray(fileKy));
        if (!fileKy) {
            console.log(typeof fileKy);
            return <ActivityIndicator size='large' color={colors.primary} style={commonStyles.mb20}></ActivityIndicator>
        } else {
            const items = fileKy.map((item, key) => {
                const
                    originalName = item.ten,
                    linkFile = `${T.config.API_URL}api/hcth/cong-van-cac-phong/download/${id}/${originalName}`,
                    style = {};
                if (key == 0) {
                    style.borderTopWidth = 0;
                }
                return <List.Item key={key} left={() => null} title={() => <TouchableOpacity onPress={() => navigation.push('ReadFile', { item, source: { uri: linkFile, cache: true } })}><Text variant="bodyMedium">{item.ten}</Text></TouchableOpacity>} />
            });
            return items;
        }
    }

    return <Card style={commonStyles.m5} elevation={4}>
        <List.Accordion id='files'
            title='Danh sach tep tin'
            left={props => {
                return <Ionicons {...props} size={20} style={commonStyles.m5} name='document-text-outline' /> 
            }}
            // onPress={() => }
        >
            {renderContent()}
        </List.Accordion>
    </Card>

}




const CongVanTrinhKy = (props) => {
    // console.log('abc')
    const { navigation, route } = props;
    const dispatch = useDispatch();
    const item = useSelector(state => {
        console.log(state?.hcthCongVanTrinhKy?.item)
        return state?.hcthCongVanTrinhKy?.item});
    const user = useSelector(state => state?.settings);

    const [context, setContext] = useState({});
    const [refreshing, setRefreshing] = useState(false);
    const { colors } = useTheme();


    useEffect(() => {
        dispatch({ type: HcthCongVanTrinhKyGet, item: null });
        getData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        getData(() => setRefreshing(false));
    }

    const getData = (done) => {
        // console.log('hello');
        const congVanId = route.params.congVanTrinhKyId;
        dispatch(getCongVanTrinhKy(congVanId, context, done));
    }

    return renderScrollView({
        ...props,
        content: <>
            {/* <Text>Hello</Text> */}
            <FileList navigation={navigation} />
        </>,
        style: {},
        refreshControl: <RefreshControl colors={['#9Bd35A', '#689F38']} refreshing={refreshing} onRefresh={onRefresh} />
    });
}

export default CongVanTrinhKy