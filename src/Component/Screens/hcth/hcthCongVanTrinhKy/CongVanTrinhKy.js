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
import commonStyles from '../../../../Asset/Styles/styles';
import style from '../../notification/style';
import DocumentPicker, { types } from 'react-native-document-picker';
import axios from 'axios';
import fs from 'react-native-fs';
import forge from 'node-forge';
import signer from "node-signpdf";
import { Buffer } from 'buffer';
import SignPDF from '@/Utils/signPdf/SignPdf';
import { PDFDocument } from 'pdf-lib';

const CanBoNhan = () => {
    const list = useSelector(state => state?.hcthCongVanTrinhKy?.item?.canBoKy);
    const { colors } = useTheme();
    const [isExpand, setIsExpand] = useState(true);
    const renderContent = () => {
        if (!list)
            return <ActivityIndicator size='large' color={colors.primary} style={commonStyles.mb20} />
        else if (!list.length)
            return <List.Item title={'Chưa có cán bộ ký'} />
        else {
            const items = list.map((item, key) => {
                return <List.Item key={key} title={`${item.hoCanBoNhan} ${item.tenCanBoNhan}`.normalizedName()} right={() => <Text variant='bodyMedium' style={commonStyles.alignSelfCenter}>{item.nguoiKy}</Text>} />
            });
            return items;
        };
    }


    return (
        <Card style={commonStyles.m5} elevation={4}>
            <List.Accordion id='canBoNhan'
                title='Cán bộ ký'
                left={props => {
                    return <Ionicons {...props} size={20} style={commonStyles.m5} name='people-outline' />
                }}
                expanded={isExpand}
                onPress={() => setIsExpand(!isExpand)}>
                {renderContent()}
            </List.Accordion>
        </Card>
    );
}

const CanBoTao = () => {
    const list = useSelector(state => state?.hcthCongVanTrinhKy?.item?.canBoKy);
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
            <List.Accordion id='canBoTao'
                title='Cán bộ tạo'
                left={props => {
                    return <Ionicons {...props} size={20} style={commonStyles.m5} name='people-outline' />
                }}
                expanded={isExpand}
                onPress={() => setIsExpand(!isExpand)}>
                {renderContent()}
            </List.Accordion>
        </Card>
    );
}

const FileList = ({ navigation }) => {
    const fileKy = useSelector(state => state.hcthCongVanTrinhKy?.item?.fileKy);
    const id = useSelector(state => state.hcthCongVanTrinhKy?.item?.congVanKy?.id);
    const { colors } = useTheme();
    const [isExpand, setIsExpand] = useState(true);
    const renderContent = () => {
        console.log(Array.isArray(fileKy));
        if (!fileKy) {
            return <ActivityIndicator size='large' color={colors.primary} style={commonStyles.mb20}></ActivityIndicator>
        } else {
            const items = fileKy.map((item, key) => {
                const
                    originalName = item.ten,
                    linkFile = `${T.config.API_URL}api/hcth/cong-van-cac-phong/download/${id}/${originalName}`,
                    style = {};
                if (key == 0) {
                    style.borderTopWidth = 0;
                }
                return <List.Item key={key} left={() => null} title={() => <TouchableOpacity onPress={() => navigation.push('ReadFile', { item, source: { uri: linkFile, cache: true } })}><Text variant="bodyMedium">{item.ten}</Text></TouchableOpacity>} />
            });
            return items;
        }
    }

    return <Card style={commonStyles.m5} elevation={4}>
        <List.Accordion id='files'
            title='Tệp tin'
            left={props => {
                return <Ionicons {...props} size={20} style={commonStyles.m5} name='document-text-outline' />
            }}
            expanded={isExpand}
            onPress={() => setIsExpand(!isExpand)}
        >
            {renderContent()}
        </List.Accordion>
    </Card>

}

const CongVanTrinhKy = (props) => {
    const { navigation, route } = props;
    const dispatch = useDispatch();
    const item = useSelector(state => state?.hcthCongVanTrinhKy?.item);
    const id = useSelector(state => state.hcthCongVanTrinhKy?.item?.congVanKy?.id);
    const fileKy = useSelector(state => state.hcthCongVanTrinhKy?.item?.fileKy);

    const [context, setContext] = useState({});
    const [refreshing, setRefreshing] = useState(false);
    const { colors } = useTheme();


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

        console.log(keyFile);
        return fs.readFile(keyFile[0].uri, 'base64');
    }

    const confirmSign = async () => {
        try {
            const congVanId = route?.params?.congVanTrinhKyId;
            console.log(congVanId);
            const key = await onPickKey();
            const file = fileKy[0],
                linkFile = `${T.config.API_URL}api/hcth/cong-van-cac-phong/download/${id}/${file.ten}`;
            navigation.push('ReadFile', { id: congVanId, key, file, source: { uri: linkFile, cache: true } });
            
        } catch (error) {
            console.error(error);
        }
    }

    return renderScrollView({
        ...props,
        content: <>
            <CanBoTao />
            <CanBoNhan />
            <FileList navigation={navigation} />
            {
            
                <View style={styles.buttonView}>
                    <TouchableOpacity style={{ ...styles.selectKey, backgroundColor: colors.primary }} onPress={confirmSign}>
                        <Text style={{ ...styles.buttonText, color: colors.background }} >Ký</Text>
                    </TouchableOpacity>
                </View>
            }
        </>,
        style: {},
        refreshControl: <RefreshControl colors={['#9Bd35A', '#689F38']} refreshing={refreshing} onRefresh={onRefresh} />
    });
}

export default CongVanTrinhKy;
