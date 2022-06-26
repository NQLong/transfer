import T from '@/Utils/common';
import { renderScrollView, Separator } from '@/Utils/componennt';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getHcthCongVanDenSearchPage } from './redux';


const CongVanDenPage = ({ navigation }) => {

    const hcthCongVanDen = useSelector(state => state?.hcthCongVanDen);
    const dispatch = useDispatch();
    const [filter, setFilter] = useState({ tab: 0 });

    const changeSearch = async () => {
        const { pageNumber = 5, pageSize = 50 } = hcthCongVanDen?.page || {};
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
                return <TouchableOpacity onPress={() => navigation.navigate('CongVanDen', { congVanDenId: item.id })} key={item.id} style={{ marginBottom: 20, width: '100%', backgroundColor: 'white', borderTopWidth: 1, borderBottomWidth: 1, padding: 10, borderColor: '#868FA0' }}>
                    <View style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: '#333333', }}>Số CV: {item.soCongVan || 'Chưa có'}</Text>
                        <Text style={{ color: '#333333', }}>{item.ngayNhan && T.dateToText(new Date(item.ngayNhan))}</Text>
                    </View>
                    <Separator height={1} style={{ marginTop: 5, marginBottom: 5 }} />
                    <View>
                        <Text style={{ color: '#333333', }}>{item.trichYeu}</Text>
                    </View>
                </TouchableOpacity >
            });
    }

    return renderScrollView({
        content: renderCongVanList(),
        style: { paddingTop: 10 }
    });
}

export default CongVanDenPage;


