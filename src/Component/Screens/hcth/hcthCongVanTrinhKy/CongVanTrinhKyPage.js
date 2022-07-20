import React, { useEffect, useRef, useState } from 'react';
import T from '@/Utils/common';
import { renderScrollView, AdminModal } from '@/Utils/component';
import { ActivityIndicator, RefreshControl, StyleSheet, ScrollView, View } from 'react-native';
import { Chip, Text, useTheme, Card, Badge, IconButton, Avatar, Paragraph, Title, Button, Menu } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { getHcthCongVanTrinhKySearchPage, getMoreHcthCongVanTrinhKyPage } from './redux';
// import { renderScrollView, AdminModal } from '@/Utils/component';

import commonStyles from '../../../../Asset/Styles/styles';
import styles from './styles';

const initPageNumber = 1;
const initPageSize = 10;

const trangThaiCongVanTrinhKy = {
    CHO_KY: {
        id: 'CHO_KY',
        text: 'Chờ ký',
        color: '#007bff'
    },
    DA_KY: {
        id: 'DA_KY',
        text: 'Đã ký',
        color: '#28a745'
    }
}


const CongVanTrinhKyPage = (props) => {
    const { navigation, route } = props;
    const hcthCongVanTrinhKy = useSelector(state => {
        return state?.hcthCongVanTrinhKy;
    });
    const user = useSelector(state => state?.settings?.user);

    const dispatch = useDispatch();

    const filter = {};
    const [refreshing, setRefreshing] = useState(false);
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const scrollView = useRef(null);
    // const signModal = useRef(null);



    useEffect(() => {
        onRefresh();
    }, [user]);

    const onRefresh = () => {
        setRefreshing(true);
        getData(initPageNumber, initPageSize, () => {
            setRefreshing(false)
            setIsLoading(false);
        });
    }

    const onLoadMore = () => {
        const { pageNumber, pageSize, pageTotal } = hcthCongVanTrinhKy?.page || {};
        if (!pageNumber || !pageSize || pageNumber == pageTotal) return;
        setIsLoading(true);
        return dispatch(getMoreHcthCongVanTrinhKyPage(pageNumber + 1, pageSize, '', filter, () => setIsLoading(false)));
    }

    // function

    const getData = (pageNumber, pageSize, done) => {
        const dataFilter = {};

        setIsLoading(true);
        dispatch(getHcthCongVanTrinhKySearchPage(pageNumber, pageSize, '', dataFilter, done));
    }

    // render functions

    const list = hcthCongVanTrinhKy?.page?.list;

    const renderItem = (item, index) => {
        return (
            <Card elevation={4} key={index} style={{ ...styles.cardItem, backgroundColor: 'white' }} onPress={() => navigation.push('CongVanTrinhKy', {congVanTrinhKyId: item.id})}>
                <Card.Title title={item.trichYeu || 'Chưa có'} titleStyle={styles.cardTitle} subtitle={item.tenFileCongVan || 'Chưa có'}
                subtitleNumberOfLines={3}
                right={(props) => <Text {...props} style={styles.dateLabel}>{T.dateToText(item.thoiGian, 'dd/mm/yyyy')}</Text>}
                rightStyle={styles.rightSide}
                />
                
                <Card.Content>
                    <View style={styles.itemButtonIcon}>
                        <Text style={{...styles.trangThaiText, color: item.trangThai ? trangThaiCongVanTrinhKy[item.trangThai].color : '#007bff' }}>{item.trangThai ? trangThaiCongVanTrinhKy[item.trangThai].text : 'Chờ ký'}</Text>
                        <IconButton {...props} 
                            icon="pen" 
                            size={22}
                        />
                    </View>
                </Card.Content>

            </Card>
        )
    }


    const renderList = () => {
        if (!list) 
            return refreshing ? null : <ActivityIndicator size="large" color={colors.primary} />;
        else if (list.length == 0)
            return <Text>Chưa có danh sách công văn</Text>
        else {
            return list.map((item, index) => renderItem(item, index));
        }
    }

    return renderScrollView({
        ...props,
        content: <>
            {renderList()}
            {isLoading && <ActivityIndicator size="large" color={colors.primary} style={{ ...commonStyles.activityIndicator, marginTop: 20}}/>}
        </>,
        style: {marginTop: 20},
        refreshControl: <RefreshControl colors={["#9Bd35A", "#689F38"]} refreshing={refreshing} onRefresh={onRefresh} />,
        ref: scrollView,
        onScroll: ({ nativeEvent }) => {
            if (T.isCloseToBottom(nativeEvent)) {
                onLoadMore();
            }
        }
    });
}


export default CongVanTrinhKyPage;