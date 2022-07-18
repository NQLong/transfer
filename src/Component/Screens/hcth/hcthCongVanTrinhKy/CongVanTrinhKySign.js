import React, { useEffect, useRef, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AdminModal, Comment, FormTextBox, renderScrollView, FormPasswordTextBox } from '@/Utils/component';
import { ActivityIndicator, RefreshControl, TouchableOpacity, View } from 'react-native';
import { Button, Card, List, Menu, Switch, Text, useTheme, TextInput } from 'react-native-paper';
import styles from './styles';

import T from '@/Utils/common';

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

const CongVanTrinhKySign = ({ navigation, route }) => {
    const { key, linkFile } = route.params;
    const [passphrase, setPassphrase] = useState('');

    const { colors } = useTheme();


    const getFile = async (linkFile) => {
        try {
            const file = await T.get(linkFile, { responseType: 'arraybuffer' });
            return file;
        } catch (error) {
            console.error(error)
        }
    }

    const trySign = async (passphrase) => {
        try {
            const file = await getFile(linkFile);
            const signPdf = new SignPDF(Buffer.from(file, 'base64'), Buffer.from(key, 'base64'));
            const pdfBuffer = await signPdf.signPDF(passphrase);
            var path = fs.DocumentDirectoryPath + '/test.pdf';
            const uploadUrl = T.config.API_URL + 'user/upload';

            const begin = new Date();
            const timeOut = 500;
            fs.writeFile(path, pdfBuffer.toString('base64'), 'base64').then((success) => {
                console.log('FILE WRITTEN!');
                var files = [
                    {
                        name: 'test',
                        filename: 'test.pdf',
                        filepath: path,
                        filetype: 'application/pdf'
                    },
                ];
                var upload = (response) => {
                    var jobId = response.jobId;
                    console.log('UPLOAD HAS BEGUN! JobId: ' + jobId);
                };

                var uploadProgress = (response) => {
                    if (new Date().getTime() - begin.getTime() > timeOut) throw new Error('Lỗi')
                    var percentage = Math.floor((response.totalBytesSent / response.totalBytesExpectedToSend) * 100);
                    console.log('UPLOAD IS ' + percentage + '% DONE!');
                };

                fs.uploadFiles({
                    toUrl: uploadUrl,
                    files: files,
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                    },
                    fields: {
                        'hello': 'world',
                    },
                    begin: upload,
                    progress: uploadProgress
                }).promise.then((response) => {
                    // navigation.pus
                    if (response.statusCode == 200) {
                        console.log('FILES UPLOADED!'); // response.statusCode, response.headers, response.body
                    } else {
                        console.log('SERVER ERROR');
                    }
                    console.log('good boy');
                }).catch((err) => {
                    if (err.description === 'cancelled') {

                    }
                    console.log(err);
                });
            })
            // navigation.navigate('CongVanTrinhKyPage');
            
        }
        catch (error) {
            // console.log(response);
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