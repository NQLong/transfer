import T from '@/Utils/common';
import { renderScrollView, Separator } from '@/Utils/component';
import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme } from 'react-native-paper';

import { useDispatch, useSelector } from 'react-redux';
import { getHcthCongVanDenSearchPage, HcthCongVanDenSearchPage, getMoreCongVanDenPage } from './redux';

const initPageNumber = 1;
const initPageSize = 20;

const CongVanDenPage = (props) => {
    const { navigation, route } = props;
    const hcthCongVanDen = useSelector(state => state?.hcthCongVanDen);
    const dispatch = useDispatch();
    const [filter, setFilter] = useState({ tab: 0 });
    const [refreshing, setRefreshing] = useState(false);
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const scrollView = useRef(null);

    const onRefresh = () => {
        setRefreshing(true);
        getData(initPageNumber, initPageSize, '', () => setRefreshing(false));
    }


    const changeSearch = async (done) => {
        const { pageNumber = initPageNumber, pageSize = initPageSize } = hcthCongVanDen?.page || {};
        const { pageCondition = '', congVanYear } = route.params || {};
        setFilter({congVanYear});
        getData(pageNumber, pageSize, pageCondition, done);
    };

    const getData = (pageNumber, pageSize, pageCondition, done) => {
        dispatch(getHcthCongVanDenSearchPage(pageNumber, pageSize, pageCondition, filter, done));
    };


    useEffect(() => {
        // console.log('hello');
        setRefreshing(true)
        changeSearch(() => setRefreshing(false));
    }, [route.params])

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

    onLoadMore = () => {
        const { pageNumber, pageSize, pageTotal } = hcthCongVanDen?.page || {};
        if (!pageNumber || !pageSize || pageNumber == pageTotal) return;
        setIsLoading(true);
        // scrollView.current?.scrollToEnd({animated: true});
        return dispatch(getMoreCongVanDenPage(pageNumber + 1, pageSize, '', filter, () => setIsLoading(false)));
    }

    return renderScrollView({
        ...props,
        content: <>
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


