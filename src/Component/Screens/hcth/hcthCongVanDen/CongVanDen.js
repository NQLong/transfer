import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getCongVanDen } from './redux';

import { Menu, MenuItem } from '@/Utils/componennt';
import { ScrollView } from 'react-native-gesture-handler';
import T from '@/Utils/common';

const CongVanDen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const item = useSelector(state => state?.hcthCongVanDen?.item);
    const [context, setContext] = useState({});
    const getData = () => {
        const congVanId = route.params.congVanDenId || 1701;
        dispatch(getCongVanDen(congVanId, context));
    };
    useEffect(() => {
        getData();
    }, []);

    console.log(item);
    const genneralInfo = () => {
        return <Menu style={{ marginTop: 10, backgroundColor: 'white' }}>
            <MenuItem title='Số công văn' value={item?.soCongVan || 'Chưa có'} />
            <MenuItem title='Số đến' value={item?.soDen || 'Chưa có'} />
            <MenuItem title='Ngày công văn' value={item?.ngayCongVan ? T.dateToText(item.ngayCongVan) : 'Chưa có'} />
            <MenuItem title='Ngày nhận' value={item?.ngayNhan ? T.dateToText(item.ngayNhan) : 'Chưa có'} />
            <MenuItem title='Ngày hết hạn' value={item?.ngayHetHan ? T.dateToText(item.ngayHetHan) : 'Chưa có'} />
            <MenuItem title='Trích yếu' bottomValue={item?.trichYeu} />
        </Menu>
    }

    return <ScrollView style={{ flex: 1 }}>
        {genneralInfo()}
    </ScrollView >;
};

export default CongVanDen;
