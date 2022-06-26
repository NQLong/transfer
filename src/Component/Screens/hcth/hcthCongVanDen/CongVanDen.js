import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getCongVanDen } from './redux';

const CongVanDen = ({navigation, route}) => {
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
    return <View>
        <Text style={{ color: 'black' }}>abc</Text>
    </View >;
};

export default CongVanDen;
