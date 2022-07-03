import T from '@/Utils/common';
import { renderScrollView, Separator } from '@/Utils/component';
import { objectTraps } from 'immer/dist/internal';
import React, { useEffect, useRef, useState } from 'react';
import { TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useTheme, Text } from 'react-native-paper';
import { Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { getHcthCongVanDenSearchPage, HcthCongVanDenSearchPage, getMoreCongVanDenPage, HcthCongVanDenSearch } from './redux';

const initPageNumber = 1;
const initPageSize = 20;

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
    const renderCongVanList = () => {
        if (!list)
            return refreshing ? null : <ActivityIndicator size="large" color={colors.primary} />;
        else if (list.lenth)
            return <Text>Chưa có danh sách công văn</Text>
        else
            return list.map((item, key) => {
                const boderBottom = {};
                if (key == list.lenth - 1)
                    boderBottom.borderBottomWidth = 1
                return <TouchableOpacity disabled={refreshing} onPress={() => navigation.navigate('CongVanDen', { congVanDenId: item.id })} key={item.id} style={{ marginBottom: 0, width: '100%', backgroundColor: 'white', borderTopWidth: 1, padding: 10, borderColor: '#868FA0', ...boderBottom }}>
                    <View style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: '#333333', fontWeight: 'bold' }}>{item.soCongVan || 'Chưa có'}</Text>
                        <Text style={{ color: '#333333', }}>{item.ngayNhan && T.dateToText(new Date(item.ngayNhan))}</Text>
                    </View>
                    <Separator height={1} style={{ marginTop: 5, marginBottom: 5 }} />
                    <View>
                        <Text style={{ color: '#333333', }}>{item.trichYeu}</Text>
                    </View>
                </TouchableOpacity >
            });
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
                console.log('load more')
                onLoadMore();
            }
        }
    });
}

export default CongVanDenPage;


