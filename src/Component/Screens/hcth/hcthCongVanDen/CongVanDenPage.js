import React, { useEffect, useRef, useState } from 'react';
import T from '@/Utils/common';
import { renderScrollView } from '@/Utils/component';
import { ActivityIndicator, RefreshControl, StyleSheet, ScrollView } from 'react-native';
import { Chip, Text, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { getHcthCongVanDenSearchPage, getMoreCongVanDenPage, HcthCongVanDenSearch } from './redux';

const initPageNumber = 1;
const initPageSize = 20;

const statusList = {
    MOI: { id: 0, text: 'Nháp', color: '#17a2b8' },
    CHO_DUYET: { id: 1, text: 'Chờ duyệt', color: '#007bff' },
    TRA_LAI_BGH: { id: 2, text: 'Trả lại', color: '#dc3545' },
    CHO_PHAN_PHOI: { id: 3, text: 'Chờ phân phối', color: '#ffc107' },
    TRA_LAI_HCTH: { id: 4, text: 'Trả lại (HCTH)', color: '#dc3545' },
    DA_PHAN_PHOI: { id: 5, text: 'Đã phân phối', color: '#28a745' },
};

const CongVanDenPage = (props) => {
    const { navigation, route } = props;
    const hcthCongVanDen = useSelector(state => state?.hcthCongVanDen);
    const dispatch = useDispatch();
    const filter = useSelector(state => state.hcthCongVanDen?.search) || {};
    const [refreshing, setRefreshing] = useState(false);
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const scrollView = useRef(null);

    /**
     * initial
     */
    useEffect(() => {
        onRefresh();
    }, [])


    /**
     * onUpdate: reload when there is any change in search object
     */
    useEffect(() => {
        onRefresh();
    }, [filter]);

    /** 
     * handle function
     */

    const onRemoveSearchItem = (key) => {
        filter[key] = '';
        dispatch({ type: HcthCongVanDenSearch, search: filter });
        onRefresh();
    }

    const onRefresh = () => {
        setRefreshing(true);
        getData(initPageNumber, initPageSize, () => setRefreshing(false));
    }

    onLoadMore = () => {
        const { pageNumber, pageSize, pageTotal } = hcthCongVanDen?.page || {};
        if (!pageNumber || !pageSize || pageNumber == pageTotal) return;
        setIsLoading(true);
        // scrollView.current?.scrollToEnd({animated: true});
        return dispatch(getMoreCongVanDenPage(pageNumber + 1, pageSize, '', filter, () => setIsLoading(false)));
    }


    /**
     * util function
     */
    const getData = (pageNumber, pageSize, done) => {
        const dataFilter = {
            congVanYear: filter.congVanYear || '',
            donViNhanCongVan: filter.donViNhanCongVan || '',
            status: filter.status || '',
        }
        dispatch(getHcthCongVanDenSearchPage(pageNumber, pageSize, filter.searchTerm || '', dataFilter, done));
    };



    /**
     * render functions
     */
    const list = hcthCongVanDen?.page?.list;

    const renderCongVanDenItem = (item, index) => {
        let statusObj = Object.values(statusList).reduce((acc, ele) => ({ ...acc, [ele.id]: ele }), {});
        return (
            <Card elevation={4} key={item.id} style={{ ...styles.cardItem, borderLeftColor: statusObj[item.trangThai].color }} onPress={() => navigation.navigate('CongVanDen', { congVanDenId: item.id })}>
                <Card.Title title={item.soCongVan || 'Chưa có'} titleStyle={styles.cardTitle} subtitle={item.trichYeu}
                    right={(props) => <Text {...props} style={styles.dateLabel}>{T.dateToText(item.ngayCongVan, 'dd/mm/yyyy')}</Text>}
                    rightStyle={styles.rightSide}
                    subtitleNumberOfLines={2} />
                <Card.Content>
                    <Badge style={{ ...styles.statusLabel, backgroundColor: statusObj[item.trangThai].color }}>{statusObj[item.trangThai].text}</Badge>
                </Card.Content>
            </Card>
        )
    }
    const renderCongVanList = () => {
        if (!list)
            return refreshing ? null : <ActivityIndicator size="large" color={colors.primary} />;
        else if (list.lenth)
            return <Text>Chưa có danh sách công văn</Text>
        else
            return list.map((item, index) => renderCongVanDenItem(item, index));
    }


    const renderFilter = () => {
        const filterLabel = { congVanYear: 'Thời gian', donViNhanCongVan: 'Đơn vị nhận', searchTerm: 'Tìm kiếm', status: 'Trạng thái', donViGuiCongVan: 'Đơn vị gửi công văn' }
        const textValue = filter.textValue || {};
        const filterData = [];
        Object.keys(filter).forEach(key => {
            if (filter[key] && filterLabel[key] && textValue[key])
                filterData.push({ key, label: filterLabel[key], value: textValue[key].toString() });
        });
        return <ScrollView horizontal style={{ flex: 1, padding: 10 }}>
            {filterData.map(item => <Chip key={item.key} style={{ flex: 1, padding: 5, justifyContent: 'center', marginRight: 10 }} onClose={() => onRemoveSearchItem(item.key)} mode='outlined'>{`${item.label}: ${item.value}`}</Chip>)}
        </ScrollView>
    };

    return renderScrollView({
        ...props,
        content: <>
            {renderFilter()}
            {renderCongVanList()}
            {isLoading && <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 20, marginTop: 20 }} />}
        </>,
        style: {},
        refreshControl: <RefreshControl colors={["#9Bd35A", "#689F38"]} refreshing={refreshing} onRefresh={onRefresh} />,
        ref: scrollView,
        onScroll: ({ nativeEvent }) => {
            if (T.isCloseToBottom(nativeEvent)) {
                console.log('load more');
                onLoadMore();
            }
        }
    });
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        alignItems: 'center',
        padding: 10
    },
    cardItem: {
        borderRadius: 10,
        margin: 10,
        borderLeftWidth: 3
    },
    cardTitle: {
        fontSize: 14,
        color: 'black',
        textTransform: 'uppercase'
    },
    cardContent: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    statusLabel: {
        fontSize: 12,
        paddingLeft: 15,
        paddingRight: 15
    },
    rightSide: {
        display: 'flex',
        marginTop: -25,
        marginRight: 20,
        alignItems: 'flex-start',
    },
    dateLabel: {
        marginTop: 0,
        fontSize: 12,
    }
});

export default CongVanDenPage;


