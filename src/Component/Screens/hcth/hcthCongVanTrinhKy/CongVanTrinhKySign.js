import React, { useEffect, useRef, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AdminModal, Comment, FormTextBox, renderScrollView, FormPasswordTextBox } from '@/Utils/component';
import { ActivityIndicator, RefreshControl, TouchableOpacity, View } from 'react-native';
import { Button, Card, List, Menu, Switch, Text, useTheme, TextInput } from 'react-native-paper';
import styles from '../../Key/styles';
import { getChuKyDienTuVanBanDi } from '../hcthCongVanTrinhKy/redux';
import T from '@/Utils/common';

import commonStyles from '../../../../Asset/Styles/styles';
import style from '../../notification/style';
import DocumentPicker, { types } from 'react-native-document-picker';
import axios from 'axios';
import fs from 'react-native-fs';
import forge from 'node-forge';
import signer from "node-signpdf";
import { Buffer } from 'buffer';
// import SignPDF from '@/Utils/signPdf/SignPdf';
import { PDFDocument } from 'pdf-lib';
import { useDispatch, useSelector } from 'react-redux';
import SignPDF from './SignPDF';

const RNFS = require('react-native-fs');

const CongVanTrinhKySign = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const { key, linkFile, fileIndex, x, y, scale, page, id, listSignFile } = route.params;

    const file = listSignFile[fileIndex];
    const user = useSelector(state => state?.settings?.user);
    const [passphrase, setPassphrase] = useState('');

    const { colors } = useTheme();


    const getFile = async (linkFile) => {
        try {
            const file = await T.get(linkFile, { 
                responseType: 'arraybuffer',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/pdf'
                }
             });

            return file;
        } catch (error) {
            console.error(error)
        }
    }

    const trySign = async (passphrase) => {
        try {
            const data = {
                x,
                y,
                scale,
                id: file.id, 
                name: 'Hieu', 
                location: 'HCM', 
                reason: 'Chữ kí phát hành', 
                page,
                signatureLevel: 2
            };

            dispatch(getChuKyDienTuVanBanDi(data, async (res) => {
                const signPdf = new SignPDF(
                    Buffer.from(res.data, 'base64'),
                    Buffer.from(key, 'base64')
                );
                
                const { pdf: pdfBuffer, signAt} = await signPdf.signPDF(passphrase);

                var path = fs.DocumentDirectoryPath + '/test.pdf';
                const uploadUrl = T.config.API_URL + 'user/upload';
                
                fs.writeFile(path, pdfBuffer.toString('base64'), 'base64').then((success) => {
                    const fileName = linkFile.substring(linkFile.lastIndexOf('/') + 1, linkFile.length);
                    const originFileName = file.file.ten.substring(0, file.file.ten.lastIndexOf('.'));
                    const extFile = file.file.ten.substring(file.file.ten.lastIndexOf('.') + 1, file.file.ten.length);
                    var files = [
                        {
                            name: 'file',
                            filename: `${originFileName}_${user.shcc}.${extFile}`,
                            filepath: path,
                            filetype: 'application/pdf'
                        },
                    ];
                    var upload = (response) => {
                        var jobId = response.jobId;
                    };
    
                    var uploadProgress = (response) => {
                        // if (new Date().getTime() - begin.getTime() > timeOut) throw new Error('Lỗi')
                        var percentage = Math.floor((response.totalBytesSent / response.totalBytesExpectedToSend) * 100);
                    };
    
                    fs.uploadFiles({
                        toUrl: uploadUrl,
                        files: files,
                        method: 'POST',
                        headers: {
                            'Accept': 'application/pdf',
                        },
                        fields: {
                            'userData': `hcthKyDienTu:${file.vanBanDi}:${file.id}:${signAt}`,
                        },
                        begin: upload,
                        progress: uploadProgress,
                    }).promise.then((response) => {
                        // navigation.pus
                        if (response.statusCode == 200) {
                            const resBody = JSON.parse(response.body);
                            if (!resBody.error) {
                                T.alert('Thông báo', 'Chữ kí hợp lệ. Tải lên thành công !!');
                            } else {
                                T.alert('Lỗi', resBody.error);
                            }
                        } else {
                            T.alert('Lỗi');
                        }
                    }).catch((err) => {
                        if (err.description === 'cancelled') {
                            
                        }
                    });
                });

                if (fileIndex < listSignFile.length - 1) {
                    const congVanId = route?.params?.vanBanDiId;
                    const keyDir = RNFS.DocumentDirectoryPath + `/${user.shcc}.p12`; 
                    const key = RNFS.readFile(keyDir, 'base64');
                    const signFile = listSignFile[fileIndex + 1];
                    const linkFile = `${T.config.API_URL}api/hcth/van-ban-di/download/${id}/${signFile.file.tenFile}`;
        
                    navigation.navigate('SelectSignPos', { id: congVanId, key, fileIndex: fileIndex + 1, listSignFile, source: { uri: linkFile, cache: true } });
                } else navigation.navigate('vanBanDiPage');

            }));
        }
        catch (error) {
            console.error(error);
        }
    }


    return <View>
        <FormPasswordTextBox secureTextEntry={true} style={styles.replyInput} value={passphrase} onChangeText={text => setPassphrase(text)} placeholder='Nhập mật khẩu' />
        <View style={styles.buttonView}>
            <TouchableOpacity style={{ ...styles.sign, backgroundColor: colors.primary }} onPress={() => trySign(passphrase)}>
                <Text style={{ ...styles.buttonText, color: colors.background }} >Ký công văn</Text>
            </TouchableOpacity>
        </View>
    </View>
}

export default CongVanTrinhKySign;