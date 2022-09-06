import React, { useState, useEffect } from 'react';
global.Buffer = global.Buffer || require('buffer').Buffer
import { ActivityIndicator, RefreshControl, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
// import { RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Button, Card, List, Menu, Switch, Text, useTheme, TextInput } from 'react-native-paper';
import { getCongVanTrinhKy, HcthCongVanTrinhKyGet } from './redux';

import { renderScrollView } from '@/Utils/component';

import T from '@/Utils/common';

import styles from './styles';
import commonStyles from '../../../Asset/Styles/styles';
import style from '../notification/style';
import DocumentPicker, { types } from 'react-native-document-picker';
import axios from 'axios';
import fs from 'react-native-fs';
import forge from 'node-forge';
import signer from "node-signpdf";
import { Buffer } from 'buffer';
import SignPDF from '@/Utils/signPdf/SignPdf';
import { PDFDocument } from 'pdf-lib';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';


const KeyList = ({ navigation }) => {
    const list = useSelector(state => state?.hcthCongVanTrinhKy?.item?.canBoKy ?? []);

    const { colors } = useTheme();
    const [isExpand, setIsExpand] = useState(true);
    const renderContent = () => {
        if (!list)
            return <ActivityIndicator size='large' color={colors.primary} style={commonStyles.mb20} />
        else if (!list.length)
            return <List.Item title={'Chưa có cán bộ ký'} />
        else {
            const item = list[0];
            return <List.Item key={0} title={`${item.hoNguoiTao} ${item.tenNguoiTao}`.normalizedName()} right={() => <Text variant='bodyMedium' style={commonStyles.alignSelfCenter}>{item.shccNguoiTao}</Text>} />

        };
    }


    return (
        <Card style={commonStyles.m5} elevation={4}>
            <List.Accordion id='key'
                title='Khoá được tạo'
                left={props => {
                    return <Ionicons {...props} size={20} style={commonStyles.m5} name='people-outline' />
                }}
                expanded={isExpand}
                onPress={() => setIsExpand(!isExpand)}>
                {renderContent()}
            </List.Accordion>
            <View style={styles.buttonView}>
                <TouchableOpacity style={{ ...styles.signIn, backgroundColor: colors.primary }} disabled={false} onPress={() => navigation.push('ScanQRCode', { navigation })}>
                    <Text style={{ ...styles.buttonText, color: colors.background}} >Tạo mới</Text>
                </TouchableOpacity>
            </View>
        </Card>
    );
}

const Key = (props) => {
    const { navigation, route } = props;
    const dispatch = useDispatch();

    const [context, setContext] = useState({});
    const [refreshing, setRefreshing] = useState(false);


    useEffect(() => {
        dispatch({ type: HcthCongVanTrinhKyGet, item: null });
        getData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        getData(() => setRefreshing(false));
    }

    const getData = (done) => {
        const congVanId = route?.params?.congVanTrinhKyId;
        dispatch(getCongVanTrinhKy(congVanId, context, done));
    }

    const onPickKey = async () => {
        const keyFile = await DocumentPicker.pick({
            presentationStyle: 'fullScreen',
            allowMultiSelection: false,
        });

        return fs.readFile(keyFile[0].uri, 'base64');
    }


    return renderScrollView({
        ...props,
        content: <>
            <KeyList navigation={navigation}/>
        </>,
        style: {},
        refreshControl: <RefreshControl colors={['#9Bd35A', '#689F38']} refreshing={refreshing} onRefresh={onRefresh} />
    });
}

export default Key;
