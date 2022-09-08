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

    const { colors } = useTheme();
    const [isExpand, setIsExpand] = useState(true);


    return (
        <Card style={commonStyles.m5} elevation={4}>
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

    return renderScrollView({
        ...props,
        content: <>
            <KeyList navigation={navigation}/>
        </>,
        style: {}
    });
}

export default Key;
