import React, { Fragment, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TouchableOpacity, Text, View, Dimensions, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import T from '@/Utils/common';
import { useTheme } from 'react-native-paper';
import { renderScrollView } from '@/Utils/componennt';
import { getHcthCongVanDenSearchPage } from './redux'
const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

const CongVanDen = ({ naviagation, route }) => {

    const hcthCongVanDen = useSelector(state => state?.hcthCongVanDen);
    const state = useSelector(state => state);
    console.log({ hcthCongVanDen });
    const dispatch = useDispatch();
    const [filter, setFilter] = useState({ tab: 0 });

    const changeSearch = async () => {
        const { pageNumber = 5, pageSize = 50 } = hcthCongVanDen?.page || {};
        console.log(pageNumber, pageSize);
        getData(pageNumber, pageSize, '');
    };

    const getData = (pageNumber, pageSize, pageCondition) => {
        dispatch(getHcthCongVanDenSearchPage(pageNumber, pageSize, pageCondition, filter));
    };

    useEffect(() => {
        changeSearch();
    }, []);

    const list = hcthCongVanDen?.page?.list;

    const renderCongVanList = () => {
        if (!list)
            return null;
        else if (list.lenth)
            return <Text>Chưa có danh sách công văn</Text>
        else
            return list.map((item) => {
                console.log(item);
                return <View key={item.id} style={{ marginBottom: 20, width: '100%', backgroundColor: 'white', borderTopWidth: 1, borderBottomWidth: 1 }}>
                    <View style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.innerText}>{item.soCongVan}</Text>
                        <Text style={{ color: '#333333', }}>{item.soDen}</Text>
                    </View>
                    <View>
                        <Text style={{ color: '#333333', }}>{item.trichYeu}</Text>
                    </View>
                </View >
            });
    }

    return renderScrollView({
        content: renderCongVanList(),
        style: { paddingTop: 10 }
    });
}

export default CongVanDen;

const styles = StyleSheet.create({
    baseText: {
        fontWeight: 'bold'
    },
    innerText: {
        color: 'black'
    }
});
