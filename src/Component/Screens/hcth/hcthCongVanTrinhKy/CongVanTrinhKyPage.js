import React, { useEffect, useRef, useState } from 'react';
import T from '@/Utils/common';
import { renderScrollView } from '@/Utils/component';
import { ActivityIndicator, RefreshControl, StyleSheet, ScrollView, View } from 'react-native';
import { Chip, Text, useTheme, Card, Badge } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { getHcthCongVanTrinhKySearchPage } from './redux';

const initPageNumber = 1;
const initPageSize = 20;

const CongVanTrinhKyPage = (props) => {
    const { navigation, route } = props;
    const hcthCongVanTrinhKy = useSelector(state => {
        return state?.hcthCongVanTrinhKy;
    });
    const dispatch = useDispatch();
    const filter = {};
    const [refreshing, setRefreshing] = useState(false);
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const scrollView = useRef(null);

    useEffect(() => {
        // getData(initPageNumber, initPageSize, () => setRefreshing(false));
        onRefresh();
        // renderList();
    });

    const onRefresh = () => {
        setRefreshing(true);
        getData(initPageNumber, initPageSize, () => setRefreshing(false));
        // console.log
    }

    const getData = (pageNumber, pageSize, done) => {
        const dataFilter = {};

        dispatch(getHcthCongVanTrinhKySearchPage(pageNumber, pageSize, '', dataFilter, done));
    }

    const list = hcthCongVanTrinhKy?.page?.list;

    const renderItem = (item, index) => {
        return (
            <Card elevation={4} key={item.id} style={{ ...styles.cardItem }}>
                <Card.Title tilte={item.congVanId || 'Chưa có'} titleStyle={styles.cardTitle} subtitle={item.trichYeu}>

                </Card.Title>
                
                <Card.Content>
                    <Badge>
                        {item.loaiCongVan}
                    </Badge>
                </Card.Content>

            </Card>
        )
    }


    const renderList = () => {
        if (!list) 
            return refreshing ? null : <ActivityIndicator size="large" color={colors.primary} />;
        else if (list.length == 0)
            return <Text>Chua co danh sach cong van</Text>
        else {
            // console.log(hcthCongVanTrinhKy?.page?.totalItem);
            return list.map((item, index) => renderItem(item, index));
        }
    }

    return renderScrollView({
        ...props,
        content: <>
            {renderList()}
            {isLoading && <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 20, marginTop: 20}}/>}
        </>,
        style: {},
        refreshControl: <RefreshControl colors={["#9Bd35A", "#689F38"]} refreshing={refreshing} onRefresh={onRefresh} />,
        ref: scrollView,
        onScroll: ({ nativeEvent }) => {
            if (T.isCloseToBottom(nativeEvent)) {
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

export default CongVanTrinhKyPage;