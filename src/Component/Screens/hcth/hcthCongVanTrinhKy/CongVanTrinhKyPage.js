import React, { useEffect, useRef, useState } from 'react';
import T from '@/Utils/common';
import { renderScrollView, AdminModal } from '@/Utils/component';
import { ActivityIndicator, RefreshControl, StyleSheet, ScrollView, View } from 'react-native';
import { Chip, Text, useTheme, Card, Badge, IconButton, Avatar, Paragraph, Title, Button, Menu } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { getHcthCongVanTrinhKySearchPage } from './redux';
// import { renderScrollView, AdminModal } from '@/Utils/component';

import commonStyles from '../../../../Asset/Styles/styles';
import styles from './styles';

const initPageNumber = 1;
const initPageSize = 20;

// class SignModal
// class SignModal extends AdminModal {
//     onShow = (item) => {
//         this.setState({ item });
//     }

//     signDocument = () => {
//         // TODO: upload file
//         this.hide();
//     }

//     // sign = ()
//     render = () => {
//         return this.renderModal({
//             title: 'Ký công văn',
//             content: <>
//                 <Text>Bạn có muốn ký công văn này không?</Text>
//             </>,
//             button: [<Button key={1} onPress={this.signDocument}>Ký</Button>]
//         });
//     }

// }


const CongVanTrinhKyPage = (props) => {
    const { navigation, route } = props;
    const hcthCongVanTrinhKy = useSelector(state => {
        return state?.hcthCongVanTrinhKy;
    });
    const user = useSelector(state => state?.settings?.user);

    const dispatch = useDispatch();

    // const filter = {};
    const [refreshing, setRefreshing] = useState(false);
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const scrollView = useRef(null);
    const signModal = useRef(null);



    useEffect(() => {
        // getData(initPageNumber, initPageSize, () => setRefreshing(false));
        onRefresh();
        // renderList();
    }, [user]);

    const onRefresh = () => {
        setRefreshing(true);
        getData(initPageNumber, initPageSize, () => {
            setRefreshing(false)
            setIsLoading(false);
        });
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
        // console.log(item.nguoiTao);
        return (
            <Card elevation={4} key={index} style={{ ...styles.cardItem, backgroundColor: 'white' }}>
                <Card.Title title={item.trichYeu || 'Chưa có'} titleStyle={styles.cardTitle} subtitle={item.tenFileCongVan || 'Chưa có'}
                subtitleNumberOfLines={3}
                right={(props) => <Text {...props} style={styles.dateLabel}>{T.dateToText(item.thoiGian, 'dd/mm/yyyy')}</Text>}
                rightStyle={styles.rightSide}
                />
                
                <Card.Content>
                    <View style={styles.itemButtonIcon}>
                        <IconButton {...props} 
                            icon="pen" 
                            size={22}
                            onPress={() => signModal.current?.show(item)}
                        />
                    </View>
                </Card.Content>

            </Card>
        )
    }


    const renderList = () => {
        // console.log(list);
        if (!list) 
            return refreshing ? null : <ActivityIndicator size="large" color={colors.primary} />;
        else if (list.length == 0)
            return <Text>Chưa có danh sách công văn</Text>
        else {
            // console.log(list.length);
            return list.map((item, index) => renderItem(item, index));
        }
    }

    return renderScrollView({
        ...props,
        content: <>
            {renderList()}
            {isLoading && <ActivityIndicator size="large" color={colors.primary} style={{ ...commonStyles.activityIndicator, marginTop: 20}}/>}
            <SignModal ref={signModal}/>
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