import React, { useEffect, useRef, useState } from 'react';
import T from '@/Utils/common';
import { Card, IconButton, Text, useTheme, Badge, Chip } from 'react-native-paper';
import { ActivityIndicator, RefreshControl, View, ScrollView } from 'react-native';

import { renderScrollView } from '@/Utils/component';
import { useDispatch, useSelector } from 'react-redux';


import commonStyles from '../../../../Asset/Styles/styles';
import styles from './styles';
import { getHcthVanBanDiSearchPage, getMoreHcthVanBanDiPage, HcthVanBanDiSearch } from './redux';
// import { FlatList } from 'react-native-gesture-handler';
// import styles from '../hcthCongVanDen/styles';


const initPageNumber = 1;
const initPageSize = 20;

const capVanBan = {
    TRUONG: {
        id: 'TRUONG',
        text: 'Trường',
        color: '#007bff'
    },
    DON_VI: {
        id: 'DON_VI',
        text: 'Đơn vị',
        color: '#28a745'
    }
}

const trangThaiCongVanDi = {
    NHAP: { id: 1, text: 'Nháp', color: '#17a2b8' },
    XEM_XET: { id: 6, text: 'Xem xét', color: '#007bff' },
    CHO_KIEM_TRA: { id: 2, text: 'Chờ kiểm tra', color: '#007bff' },
    CHO_DUYET: { id: 3, text: 'Chờ duyệt', color: '#007bff' },
    TRA_LAI: { id: 4, text: 'Trả lại', color: '#dc3545' },
    DA_XEM_XET: { id: 5, text: 'Đã xem xét', color: '#28a745' },
    DA_DUYET: { id: 7, text: 'Đã duyệt', color: '#28a745' },
    CHO_PHAN_PHOI: { id: 8, text: 'Chờ phân phối', color: '#007bff' },
    CHO_KY: { id: 9, text: 'Chờ ký', color: '#007bff' },
    DA_PHAN_PHOI: { id: 10, text: 'Đã phân phối', color: '#28a745' },
    TRA_LAI_PHONG: { id: 11, text: 'Trả lại (Đơn vị)', color: '#dc3545' },
    TRA_LAI_HCTH: { id: 12, text: 'Trả lại (HCTH)', color: '#dc3545' },
}


const VanBanDiPage = (props) => {
    const { navigation } = props;

    const user = useSelector(state => state?.settings?.user);
    const hcthVanBanDi = useSelector(state => {
        console.log(state?.hcthVanBanDi);
        return state?.hcthVanBanDi;
    });
    const search = useSelector(state => state?.hcthVanBanDi?.search);

    const dispatch = useDispatch();

    const filter = search || {};
    const [refreshing, setRefreshing] = useState(false);
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const scrollView = useRef(null);

    useEffect(() => {
        onRefresh();
    }, [search, user]);

    const onRefresh = () => {
        setRefreshing(true);
        getData(initPageNumber, initPageSize, () => {
            setRefreshing(false);
            setIsLoading(false);
        });
    }

    const onLoadMore = () => {
        const { pageNumber, pageSize, pageTotal } = hcthVanBanDi?.page || {};
        if (!pageNumber || !pageSize || pageNumber == pageTotal) return;
        setIsLoading(true);
        return dispatch(getMoreHcthVanBanDiPage(pageNumber + 1, pageSize, '', filter, () => setIsLoading(false)));
    }

    const getData = (pageNumber, pageSize, done) => {
        const dataFilter = {
            status: filter.status || '',
        };

        setIsLoading(true);
        dispatch(getHcthVanBanDiSearchPage(pageNumber, pageSize, filter.searchTerm, dataFilter, done));
    }

    const onRemoveSearchItem = (key) => {
        filter[key] = '';
        dispatch({ type: HcthVanBanDiSearch, search: filter });
        onRefresh();
    }

    const list = hcthVanBanDi?.page?.list;

    const renderItem = (item, index) => {

        let statusObj = Object.values(trangThaiCongVanDi).reduce((group, item) =>
        ({
            ...group,
            [item.id]: item
        }), {});
        return (
            <Card elevation={4} key={index} style={{ ...styles.cardItem, backgroundColor: 'white' }} onPress={() => navigation.push('VanBanDi', { vanBanDiId: item.id })} >
                <Card.Title title={item.soCongVan || 'Chưa có'} titleStyle={styles.cardTitle}
                    subtitle={item.trichYeu || 'Chưa có'}
                    right={(props) => <Text {...props} style={styles.dateLabel}>{T.dateToText(item.ngayTao, 'dd/mm/yyyy')}</Text>}
                    rightStyle={styles.rightSide}
                />
                <Card.Content>
                    <View style={styles.itemButtonIcon}>
                        <Text style={{ ...styles.trangThaiText, color: item.loaiCongVan ? capVanBan[item.loaiCongVan].color : 'black' }}>{item.loaiCongVan ? capVanBan[item.loaiCongVan].text : ''}</Text>
                    </View>
                    <Badge style={{ ...styles.statusLabel, backgroundColor: statusObj[item.trangThai]?.color || 'black' }}>{statusObj[item.trangThai]?.text || 'Chưa có'}</Badge>
                </Card.Content>
            </Card>
        );
    }

    const renderList = () => {
        if (!list) {
            return refreshing ? null : <ActivityIndicator size="large" color={colors.primary} />;
        } else if (list.length == 0) {
            return <Text>Chưa có danh sách văn bản đi</Text>
        } else {
            return list.map((item, index) => renderItem(item, index));
        }
    }


    const renderFilter = () => {
        const filterLabel = { status: 'Trạng thái', searchTerm: 'Tìm kiếm' };
        const textValue = filter.textValue || {};
        const filterData = [];

        Object.keys(filter).forEach(key => {
            if (filter[key] && filterLabel[key] && textValue[key]) {
                filterData.push({ key, label: filterLabel[key], value: textValue[key] });
            }
        });

        console.log(filterData);

        return <ScrollView horizontal style={{ flex: 1, paddingLeft: 10 }} >
            {filterData.map(item => <Chip key={item.key} style={commonStyles.chipItem} mode='outlined' onClose={() => onRemoveSearchItem(item.key)} >
                {
                    <Text style={commonStyles.fs12} numberOfLines={1} ellipsizeMode='tail'>{`${item.label}: ${item.value}`}</Text>
                }
            </Chip>)}
        </ScrollView>
    }

    // FlatList
    return renderScrollView({
        ...props,
        content: <>
            {renderFilter()}
            {renderList()}
            {isLoading && <ActivityIndicator size="large" color={colors.primary} style={{ ...commonStyles.activityIndicator, marginTop: 20 }} />}
        </>,
        style: { marginTop: 12 },
        ref: scrollView,
        refreshControl: <RefreshControl colors={["#9Bd35A", "#689F38"]} refreshing={refreshing} onRefresh={onRefresh} />,
        onScroll: ({ nativeEvent }) => {
            if (T.isCloseToBottom(nativeEvent)) {
                onLoadMore();
            }
        }
    });

};

export default VanBanDiPage;