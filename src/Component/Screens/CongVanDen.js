import React, { Fragment, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TouchableOpacity, Text, View, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import T from '@/Utils/common';
import { useTheme } from 'react-native-paper';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;


const CongVanDen = ({ navigation }) => {
    let isProcessing = false;
    const settings = useSelector(state => state.settings || {});
    const { colors } = useTheme();



    return (
        <View>
            <Fragment>
                <Text style={{ fontFamily: 'Work Sans', color: colors.background, fontSize: 19, fontWeight: 'bold' }} >Đăng xuất</Text>

            </Fragment>
        </View>
    );
}

export default CongVanDen;
